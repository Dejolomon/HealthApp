import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';

interface AddressPickerProps {
  value?: string; // Format: "street|city|state|zip"
  onChange: (value: string) => void;
  label?: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const COMMON_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Virginia Beach',
  'Miami', 'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita', 'Arlington', 'Tampa'
];

export function AddressPicker({ value, onChange, label = 'Address' }: AddressPickerProps) {
  // Parse address value - handles both pipe-separated format and plain text
  const parseAddress = (addressString?: string) => {
    if (addressString) {
      // Check if it's in pipe-separated format
      if (addressString.includes('|')) {
        const parts = addressString.split('|');
        if (parts.length === 4) {
          return {
            street: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            zip: parts[3] || '',
          };
        }
      }
      // If it's old format (plain text), try to keep it as street address
      // User can then fill in the other fields
      return {
        street: addressString,
        city: '',
        state: '',
        zip: '',
      };
    }
    return { street: '', city: '', state: '', zip: '' };
  };

  const [address, setAddress] = useState(parseAddress(value));
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [zipSearch, setZipSearch] = useState('');

  // Update when value prop changes
  useEffect(() => {
    const parsed = parseAddress(value);
    setAddress(parsed);
  }, [value]);

  const handleAddressChange = (field: 'street' | 'city' | 'state' | 'zip', newValue: string) => {
    const updated = { ...address, [field]: newValue };
    setAddress(updated);
    
    // Format as "street|city|state|zip" for storage
    const formatted = `${updated.street}|${updated.city}|${updated.state}|${updated.zip}`;
    onChange(formatted);
  };

  const filteredCities = COMMON_CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredStates = US_STATES.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Generate common zip codes (5-digit format)
  const generateZipCodes = () => {
    const zips: string[] = [];
    // Generate some common zip code patterns
    for (let i = 10000; i <= 99999; i += 1000) {
      zips.push(i.toString().padStart(5, '0'));
    }
    return zips;
  };

  const commonZipCodes = generateZipCodes();
  const filteredZips = commonZipCodes.filter(zip =>
    zip.includes(zipSearch)
  );

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1e40af">
        {label}
      </ThemedText>

      {/* Street Address */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          Street Address
        </ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="Enter street address"
          placeholderTextColor="#8b95a7"
          value={address.street}
          onChangeText={(value) => handleAddressChange('street', value)}
        />
      </View>

      {/* City Dropdown */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          City
        </ThemedText>
        <View style={styles.pickerButton}>
          <TextInput
            style={styles.pickerTextInput}
            placeholder="Enter or select city"
            placeholderTextColor="#8b95a7"
            value={address.city || ''}
            onChangeText={(value) => handleAddressChange('city', value)}
            editable={true}
            selectTextOnFocus={false}
          />
          <TouchableOpacity onPress={() => setShowCityModal(true)} style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* State Dropdown */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          State
        </ThemedText>
        <View style={styles.pickerButton}>
          <TextInput
            style={styles.pickerTextInput}
            placeholder="Enter or select state"
            placeholderTextColor="#8b95a7"
            value={address.state || ''}
            onChangeText={(value) => handleAddressChange('state', value)}
            editable={true}
            selectTextOnFocus={false}
          />
          <TouchableOpacity onPress={() => setShowStateModal(true)} style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zip Code Dropdown */}
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
          Zip Code
        </ThemedText>
        <View style={styles.pickerButton}>
          <TextInput
            style={styles.pickerTextInput}
            placeholder="Enter or select zip code"
            placeholderTextColor="#8b95a7"
            value={address.zip || ''}
            onChangeText={(value) => handleAddressChange('zip', value)}
            keyboardType="numeric"
            editable={true}
            maxLength={5}
            selectTextOnFocus={false}
          />
          <TouchableOpacity onPress={() => setShowZipModal(true)} style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* City Modal */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select City
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              placeholderTextColor="#8b95a7"
              value={citySearch}
              onChangeText={setCitySearch}
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.modalItem,
                    address.city === city && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleAddressChange('city', city);
                    setCitySearch('');
                    setShowCityModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      address.city === city && styles.modalItemTextSelected,
                    ]}
                    lightColor={address.city === city ? '#ffffff' : '#1a1f2e'}
                  >
                    {city}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* State Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select State
              </ThemedText>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search states..."
              placeholderTextColor="#8b95a7"
              value={stateSearch}
              onChangeText={setStateSearch}
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredStates.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.modalItem,
                    address.state === state && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleAddressChange('state', state);
                    setStateSearch('');
                    setShowStateModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      address.state === state && styles.modalItemTextSelected,
                    ]}
                    lightColor={address.state === state ? '#ffffff' : '#1a1f2e'}
                  >
                    {state}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Zip Code Modal */}
      <Modal
        visible={showZipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowZipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Zip Code
              </ThemedText>
              <TouchableOpacity onPress={() => setShowZipModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search zip codes..."
              placeholderTextColor="#8b95a7"
              value={zipSearch}
              onChangeText={setZipSearch}
              keyboardType="numeric"
            />
            <ScrollView style={styles.modalScrollView}>
              {filteredZips.slice(0, 100).map((zip) => (
                <TouchableOpacity
                  key={zip}
                  style={[
                    styles.modalItem,
                    address.zip === zip && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleAddressChange('zip', zip);
                    setZipSearch('');
                    setShowZipModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      address.zip === zip && styles.modalItemTextSelected,
                    ]}
                    lightColor={address.zip === zip ? '#ffffff' : '#1a1f2e'}
                  >
                    {zip}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
  },
  field: {
    gap: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  pickerTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
    padding: 0,
    minHeight: 20,
  },
  dropdownButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1f2e',
  },
  searchInput: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1a1f2e',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemSelected: {
    backgroundColor: '#2563eb',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

