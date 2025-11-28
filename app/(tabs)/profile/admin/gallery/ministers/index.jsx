import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadMinister } from '../../../../../../services/dataService';
import { SafeAreaWrapper } from '../../../../../../components/ui/SafeAreaWrapper';
import { TopNavigation } from '../../../../../../components/TopNavigation';

export default function UploadMinister() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    station: '',
    maritalStatus: '',
    contact: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
    if (!res.canceled) setFile(res.assets[0]);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const upload = async () => {
    if (!form.name.trim() || !file) {
      return Alert.alert('Required', 'Name and photo are required');
    }

    setUploading(true);
    try {
      await uploadMinister(file, {
        name: form.name.trim(),
        category: form.category.trim(),
        station: form.station.trim(),
        maritalStatus: form.maritalStatus.trim(),
        contact: form.contact.trim(),
      });

      Alert.alert('Success', 'Minister added successfully!');
      setForm({
        name: '',
        category: '',
        station: '',
        maritalStatus: '',
        contact: '',
      });
      setFile(null);
    } catch (e) {
      Alert.alert('Upload Failed', e.message || 'Please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <TopNavigation showBackButton={true} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Name */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Name *</Text>
          <TextInput
            value={form.name}
            onChangeText={(t) => handleChange('name', t)}
            placeholder="Full name"
            style={styles.input}
          />
        </View>

        {/* Category */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Category</Text>
          <TextInput
            value={form.category}
            onChangeText={(t) => handleChange('category', t)}
            placeholder="e.g. Pastor, Deacon, Evangelist"
            style={styles.input}
          />
        </View>

        {/* Station */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Station</Text>
          <TextInput
            value={form.station}
            onChangeText={(t) => handleChange('station', t)}
            placeholder="e.g. Warri, Lagos, Abuja"
            style={styles.input}
          />
        </View>

        {/* Marital Status */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Marital Status
          </Text>
          <TextInput
            value={form.maritalStatus}
            onChangeText={(t) => handleChange('maritalStatus', t)}
            placeholder="e.g. Married, Single"
            style={styles.input}
          />
        </View>

        {/* Contact */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Contact (Phone/Email)
          </Text>
          <TextInput
            value={form.contact}
            onChangeText={(t) => handleChange('contact', t)}
            placeholder="Optional"
            style={styles.input}
          />
        </View>

        {/* Pick Photo Button */}
        <TouchableOpacity
          onPress={pickPhoto}
          disabled={uploading}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {file ? `Photo: ${file.name}` : 'Pick Photo *'}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          onPress={upload}
          disabled={uploading || !form.name || !file}
          style={[
            styles.button,
            {
              backgroundColor:
                uploading || !form.name || !file ? '#aaa' : '#34C759',
            },
          ]}
        >
          {uploading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>
            {uploading ? 'Saving...' : 'Save Minister'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
};
