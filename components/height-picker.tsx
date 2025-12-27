import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';

interface HeightPickerProps {
  value: number; // Total height in inches
  onChange: (value: number) => void; // Returns total inches
  label?: string;
}

export function HeightPicker({ value, onChange, label = 'Height' }: HeightPickerProps) {
  // Convert inches to feet and inches
  const parseHeight = (totalInches: number) => {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet, inches };
  };

  const [height, setHeight] = useState(parseHeight(value || 70));
  const [showFeetModal, setShowFeetModal] = useState(false);
  const [showInchesModal, setShowInchesModal] = useState(false);

  // Generate feet options (3 to 8 feet)
  const feetOptions = Array.from({ length: 6 }, (_, i) => i + 3);
  
  // Generate inches options (0 to 11)
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i);

  // Update when value prop changes
  useEffect(() => {
    setHeight(parseHeight(value || 70));
  }, [value]);

  const handleHeightChange = (field: 'feet' | 'inches', newValue: number) => {
    const updated = { ...height, [field]: newValue };
    setHeight(updated);
    
    // Convert to total inches
    const totalInches = updated.feet * 12 + updated.inches;
    onChange(totalInches);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1e40af">
        {label}
      </ThemedText>
      <View style={styles.pickerRow}>
        {/* Feet Dropdown */}
        <View style={styles.pickerGroup}>
          <ThemedText type="defaultSemiBold" style={styles.unitLabel} lightColor="#4a5568">
            Feet
          </ThemedText>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowFeetModal(true)}
          >
            <ThemedText style={styles.pickerText} lightColor="#1a1f2e">
              {height.feet}
            </ThemedText>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>

        {/* Inches Dropdown */}
        <View style={styles.pickerGroup}>
          <ThemedText type="defaultSemiBold" style={styles.unitLabel} lightColor="#4a5568">
            Inches
          </ThemedText>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowInchesModal(true)}
          >
            <ThemedText style={styles.pickerText} lightColor="#1a1f2e">
              {height.inches}
            </ThemedText>
            <Ionicons name="chevron-down" size={20} color="#4a5568" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feet Modal */}
      <Modal
        visible={showFeetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Feet
              </ThemedText>
              <TouchableOpacity onPress={() => setShowFeetModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {feetOptions.map((feet) => (
                <TouchableOpacity
                  key={feet}
                  style={[
                    styles.modalItem,
                    height.feet === feet && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleHeightChange('feet', feet);
                    setShowFeetModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      height.feet === feet && styles.modalItemTextSelected,
                    ]}
                    lightColor={height.feet === feet ? '#ffffff' : '#1a1f2e'}
                  >
                    {feet} ft
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Inches Modal */}
      <Modal
        visible={showInchesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInchesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Inches
              </ThemedText>
              <TouchableOpacity onPress={() => setShowInchesModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {inchesOptions.map((inches) => (
                <TouchableOpacity
                  key={inches}
                  style={[
                    styles.modalItem,
                    height.inches === inches && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleHeightChange('inches', inches);
                    setShowInchesModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      height.inches === inches && styles.modalItemTextSelected,
                    ]}
                    lightColor={height.inches === inches ? '#ffffff' : '#1a1f2e'}
                  >
                    {inches} in
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
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerGroup: {
    flex: 1,
    gap: 8,
  },
  unitLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4a5568',
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
  pickerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
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



