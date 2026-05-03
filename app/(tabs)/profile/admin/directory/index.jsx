import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { MapPin, Plus, Trash2, Edit2, X, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { TopNavigation } from '@/components/TopNavigation';
import { AppText } from '@/components/ui/AppText';
import {
  getDirectories,
  addDirectoryEntry,
  updateDirectoryEntry,
  deleteDirectoryEntry,
} from '../../../../../services/dataService';

const EMPTY_FORM = {
  name: '',
  zone: '',
  address: '',
  phone: '',
  latitude: '',
  longitude: '',
};

export default function DirectoryManagerScreen() {
  const { colors } = useTheme();
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [hasCoords, setHasCoords] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getDirectories();
    setDirectories(data);
    setLoading(false);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setHasCoords(false);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      zone: item.zone || '',
      address: item.address || '',
      phone: item.phone || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
    });
    setHasCoords(!!(item.latitude && item.longitude));
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.zone.trim() || !form.address.trim()) {
      Alert.alert('Required', 'Name, zone, and address are required.');
      return;
    }
    if (hasCoords && (!form.latitude.trim() || !form.longitude.trim())) {
      Alert.alert(
        'Coordinates',
        'Enter both latitude and longitude, or disable coordinates.',
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      zone: form.zone.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      ...(hasCoords && {
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      }),
    };

    // Strip coords if toggled off during edit
    if (!hasCoords && editingId) {
      payload.latitude = null;
      payload.longitude = null;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateDirectoryEntry(editingId, payload);
      } else {
        await addDirectoryEntry(payload);
      }
      setShowForm(false);
      await load();
    } catch {
      Alert.alert('Error', 'Could not save entry. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Branch', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDirectoryEntry(item.id);
          await load();
        },
      },
    ]);
  };

  const s = styles(colors);

  if (showForm) {
    return (
      <SafeAreaWrapper>
        <TopNavigation
          showBackButton
          title={editingId ? 'Edit Branch' : 'Add Branch'}
        />
        <ScrollView
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
        >
          <AppText style={s.label}>Branch Name *</AppText>
          <TextInput
            style={s.input}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="e.g. GKS Warri Central"
            placeholderTextColor={colors.textSecondary}
          />

          <AppText style={s.label}>Zone *</AppText>
          <TextInput
            style={s.input}
            value={form.zone}
            onChangeText={(v) => setForm((f) => ({ ...f, zone: v }))}
            placeholder="e.g. Warri"
            placeholderTextColor={colors.textSecondary}
          />

          <AppText style={s.label}>Address *</AppText>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top' }]}
            value={form.address}
            multiline
            onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
            placeholder="Full address"
            placeholderTextColor={colors.textSecondary}
          />

          <AppText style={s.label}>Phone (optional)</AppText>
          <TextInput
            style={s.input}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="+234..."
            placeholderTextColor={colors.textSecondary}
          />

          <View style={s.toggleRow}>
            <AppText style={s.label}>Add GPS Coordinates</AppText>
            <Switch
              value={hasCoords}
              onValueChange={setHasCoords}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <AppText style={[s.hint, { color: colors.textSecondary }]}>
            Coordinates enable the map view. Get them from Google Maps → long
            press a location → copy the numbers shown.
          </AppText>

          {hasCoords && (
            <View style={s.coordRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <AppText style={s.label}>Latitude</AppText>
                <TextInput
                  style={s.input}
                  value={form.latitude}
                  keyboardType="decimal-pad"
                  onChangeText={(v) => setForm((f) => ({ ...f, latitude: v }))}
                  placeholder="e.g. 5.5167"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={s.label}>Longitude</AppText>
                <TextInput
                  style={s.input}
                  value={form.longitude}
                  keyboardType="decimal-pad"
                  onChangeText={(v) => setForm((f) => ({ ...f, longitude: v }))}
                  placeholder="e.g. 5.7500"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          )}

          <View style={s.formActions}>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.border }]}
              onPress={() => setShowForm(false)}
            >
              <X size={18} color={colors.text} />
              <AppText style={{ color: colors.text, marginLeft: 6 }}>
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <AppText style={{ color: '#fff', marginLeft: 6 }}>
                    Save
                  </AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton title="Directories" />
      <View style={s.headerRow}>
        <AppText style={{ color: colors.textSecondary, fontSize: 13 }}>
          {directories.length} branch{directories.length !== 1 ? 'es' : ''}
        </AppText>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
        >
          <Plus size={18} color="#fff" />
          <AppText style={{ color: '#fff', marginLeft: 4, fontWeight: '600' }}>
            Add Branch
          </AppText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <FlatList
          data={directories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View
              style={[
                s.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <AppText style={[s.zone, { color: colors.primary }]}>
                  {item.zone?.toUpperCase()}
                </AppText>
                <AppText style={[s.name, { color: colors.text }]}>
                  {item.name}
                </AppText>
                <AppText style={[s.address, { color: colors.textSecondary }]}>
                  {item.address}
                </AppText>
                {item.phone ? (
                  <AppText style={[s.address, { color: colors.textSecondary }]}>
                    {item.phone}
                  </AppText>
                ) : null}
                <AppText
                  style={[
                    s.coordBadge,
                    {
                      color: item.latitude
                        ? colors.primary
                        : colors.textSecondary,
                      borderColor: item.latitude
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  {item.latitude
                    ? `📍 ${item.latitude}, ${item.longitude}`
                    : 'No coordinates'}
                </AppText>
              </View>
              <View style={s.actions}>
                <TouchableOpacity
                  style={s.iconBtn}
                  onPress={() => openEdit(item)}
                >
                  <Edit2 size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.iconBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Trash2 size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    formScroll: { padding: 20, paddingBottom: 60 },
    label: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 16,
      color: colors?.text,
    },
    hint: { fontSize: 12, lineHeight: 18, marginTop: 4 },
    input: {
      borderWidth: 1,
      borderColor: colors?.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors?.text,
      backgroundColor: colors?.surface,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    coordRow: { flexDirection: 'row' },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 28 },
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    card: {
      flexDirection: 'row',
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      elevation: 2,
    },
    zone: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 2,
    },
    name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    address: { fontSize: 13, lineHeight: 18, marginBottom: 2 },
    coordBadge: {
      fontSize: 11,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      alignSelf: 'flex-start',
      marginTop: 6,
    },
    actions: { justifyContent: 'space-around', paddingLeft: 10 },
    iconBtn: { padding: 6 },
  });
