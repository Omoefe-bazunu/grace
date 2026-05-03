import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  FileText,
  Search,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react-native';
import { SafeAreaWrapper } from '../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../components/TopNavigation';
import { AppText } from '../../../../components/ui/AppText';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getArchiveDocuments } from '../../../../services/dataService';

export default function ArchiveDocuments() {
  const { colors } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [webViewLoading, setWebViewLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await getArchiveDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Docs fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocs(true);
  }, []);

  const filtered = documents.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      d.title?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => {
        setWebViewLoading(true);
        setSelectedDoc(item);
      }}
      activeOpacity={0.85}
    >
      <View
        style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}
      >
        <FileText size={28} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          style={[styles.docTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </AppText>
        {item.description ? (
          <AppText
            style={[styles.docDesc, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </AppText>
        ) : null}
        {item.date && (
          <View style={styles.metaRow}>
            <Calendar size={11} color={colors.textSecondary} />
            <AppText style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatDate(item.date)}
            </AppText>
          </View>
        )}
      </View>
      <View
        style={[styles.viewBtn, { backgroundColor: colors.primary + '15' }]}
      >
        <ExternalLink size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Documents" />

      <View
        style={[styles.searchContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search documents..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <FileText size={48} color={colors.textSecondary} />
              <AppText
                style={[styles.emptyText, { color: colors.textSecondary }]}
              >
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </AppText>
            </View>
          }
        />
      )}

      {/* PDF Viewer Modal */}
      <Modal
        visible={!!selectedDoc}
        animationType="slide"
        onRequestClose={() => setSelectedDoc(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedDoc(null)}
              style={styles.closeBtn}
            >
              <X size={22} color="#fff" />
            </TouchableOpacity>
            <AppText style={styles.modalTitle} numberOfLines={1}>
              {selectedDoc?.title}
            </AppText>
            <View style={{ width: 40 }} />
          </View>

          {/* WebView */}
          {selectedDoc && (
            <WebView
              source={{ uri: selectedDoc.url }}
              style={{ flex: 1 }}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webViewLoader}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <AppText
                    style={{ color: '#fff', marginTop: 12, fontSize: 13 }}
                  >
                    Loading document...
                  </AppText>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: { paddingHorizontal: 15, paddingVertical: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  listContent: { padding: 15, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  docDesc: { fontSize: 12, lineHeight: 17, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  viewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: { padding: 4 },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
});
