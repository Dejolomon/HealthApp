import { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';

interface DateOfBirthPickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
}

export function DateOfBirthPicker({ value, onChange, label = 'Date of Birth' }: DateOfBirthPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Parse initial value or use current date
  const parseDate = (dateString?: string) => {
    if (dateString) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return { year, month, day };
        }
      }
    }
    return { year: currentYear - 25, month: 1, day: 1 };
  };

  const [selectedDate, setSelectedDate] = useState(parseDate(value));
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

  // Update when value prop changes
  useEffect(() => {
    setSelectedDate(parseDate(value));
  }, [value]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedDate.year, selectedDate.month) },
    (_, i) => i + 1
  );

  const handleDateChange = (field: 'year' | 'month' | 'day', newValue: number) => {
    const updated = { ...selectedDate, [field]: newValue };
    
    // If month or year changed, adjust day if necessary
    if (field === 'month' || field === 'year') {
      const maxDays = getDaysInMonth(updated.year, updated.month);
      if (updated.day > maxDays) {
        updated.day = maxDays;
      }
    }
    
    setSelectedDate(updated);
    
    // Format as YYYY-MM-DD
    const formatted = `${updated.year}-${String(updated.month).padStart(2, '0')}-${String(updated.day).padStart(2, '0')}`;
    onChange(formatted);
  };

  const selectedMonthName = months.find(m => m.value === selectedDate.month)?.label || 'January';

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#1e40af">
        {label}
      </ThemedText>
      <View style={styles.pickerRow}>
        {/* Year Dropdown */}
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowYearModal(true)}
        >
          <ThemedText style={styles.pickerText} lightColor="#1a1f2e">
            {selectedDate.year}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color="#4a5568" />
        </TouchableOpacity>

        {/* Month Dropdown */}
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowMonthModal(true)}
        >
          <ThemedText style={styles.pickerText} lightColor="#1a1f2e">
            {selectedMonthName}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color="#4a5568" />
        </TouchableOpacity>

        {/* Day Dropdown */}
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDayModal(true)}
        >
          <ThemedText style={styles.pickerText} lightColor="#1a1f2e">
            {selectedDate.day}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color="#4a5568" />
        </TouchableOpacity>
      </View>

      {/* Year Modal */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Year
              </ThemedText>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.modalItem,
                    selectedDate.year === year && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleDateChange('year', year);
                    setShowYearModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      selectedDate.year === year && styles.modalItemTextSelected,
                    ]}
                    lightColor={selectedDate.year === year ? '#ffffff' : '#1a1f2e'}
                  >
                    {year}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Month Modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Month
              </ThemedText>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.modalItem,
                    selectedDate.month === month.value && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleDateChange('month', month.value);
                    setShowMonthModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      selectedDate.month === month.value && styles.modalItemTextSelected,
                    ]}
                    lightColor={selectedDate.month === month.value ? '#ffffff' : '#1a1f2e'}
                  >
                    {month.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Day Modal */}
      <Modal
        visible={showDayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle} lightColor="#1a1f2e">
                Select Day
              </ThemedText>
              <TouchableOpacity onPress={() => setShowDayModal(false)}>
                <Ionicons name="close" size={24} color="#1a1f2e" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.modalItem,
                    selectedDate.day === day && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleDateChange('day', day);
                    setShowDayModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.modalItemText,
                      selectedDate.day === day && styles.modalItemTextSelected,
                    ]}
                    lightColor={selectedDate.day === day ? '#ffffff' : '#1a1f2e'}
                  >
                    {day}
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
    gap: 10,
  },
  pickerButton: {
    flex: 1,
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

