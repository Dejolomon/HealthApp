import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type DatePickerProps = {
  value: string; // Format: YYYY-MM-DD or empty string
  onChange: (value: string) => void;
  label: string;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Parse existing value
  const parseDate = (dateString: string) => {
    if (!dateString) return { year: null, month: null, day: null };
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1, // 0-indexed
        day: parseInt(parts[2], 10),
      };
    }
    return { year: null, month: null, day: null };
  };

  // Initialize from value
  const initializeFromValue = () => {
    const parsed = parseDate(value);
    setSelectedYear(parsed.year);
    setSelectedMonth(parsed.month);
    setSelectedDay(parsed.day);
  };

  const handleOpen = () => {
    initializeFromValue();
    setModalVisible(true);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(null);
    setSelectedDay(null);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setSelectedDay(null);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedYear !== null && selectedMonth !== null && selectedDay !== null) {
      const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      onChange(formattedDate);
      setModalVisible(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    initializeFromValue(); // Reset to original values
  };

  const displayValue = value
    ? (() => {
        const parsed = parseDate(value);
        if (parsed.year && parsed.month !== null && parsed.day) {
          return `${MONTHS[parsed.month]} ${parsed.day}, ${parsed.year}`;
        }
        return value;
      })()
    : 'Select date';

  const currentYear = getCurrentYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  // Recalculate days when year or month changes
  const maxDays =
    selectedYear !== null && selectedMonth !== null
      ? getDaysInMonth(selectedYear, selectedMonth)
      : 31;
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Reset day if it's invalid for the selected month/year (e.g., Feb 30 or Feb 29 in non-leap year)
  useEffect(() => {
    if (selectedYear !== null && selectedMonth !== null && selectedDay !== null) {
      const validDays = getDaysInMonth(selectedYear, selectedMonth);
      if (selectedDay > validDays) {
        setSelectedDay(null);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <TouchableOpacity style={styles.input} onPress={handleOpen}>
        <ThemedText style={styles.inputText} lightColor={value ? '#1a1f2e' : '#9ca3af'}>
          {displayValue}
        </ThemedText>
        <ThemedText style={styles.arrow} lightColor="#718096">
          ▼
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle} lightColor="#1a1f2e">
              Select {label}
            </ThemedText>

            <View style={styles.pickerContainer}>
              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerLabel} lightColor="#4b5563">
                  Year
                </ThemedText>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected,
                      ]}
                      onPress={() => handleYearSelect(year)}
                    >
                      <ThemedText
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.pickerItemTextSelected,
                        ]}
                        lightColor={selectedYear === year ? '#ffffff' : '#1a1f2e'}
                      >
                        {year}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              {selectedYear !== null && (
                <View style={styles.pickerColumn}>
                  <ThemedText style={styles.pickerLabel} lightColor="#4b5563">
                    Month
                  </ThemedText>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {MONTHS.map((month, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          selectedMonth === index && styles.pickerItemSelected,
                        ]}
                        onPress={() => handleMonthSelect(index)}
                      >
                        <ThemedText
                          style={[
                            styles.pickerItemText,
                            selectedMonth === index && styles.pickerItemTextSelected,
                          ]}
                          lightColor={selectedMonth === index ? '#ffffff' : '#1a1f2e'}
                        >
                          {month}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Day Picker */}
              {selectedYear !== null && selectedMonth !== null && (
                <View style={styles.pickerColumn}>
                  <ThemedText style={styles.pickerLabel} lightColor="#4b5563">
                    Day
                  </ThemedText>
                  <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.pickerItem,
                          selectedDay === day && styles.pickerItemSelected,
                        ]}
                        onPress={() => handleDaySelect(day)}
                      >
                        <ThemedText
                          style={[
                            styles.pickerItemText,
                            selectedDay === day && styles.pickerItemTextSelected,
                          ]}
                          lightColor={selectedDay === day ? '#ffffff' : '#1a1f2e'}
                        >
                          {day}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <ThemedText style={styles.cancelButtonText} lightColor="#4b5563">
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (selectedYear === null || selectedMonth === null || selectedDay === null) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={selectedYear === null || selectedMonth === null || selectedDay === null}
              >
                <ThemedText style={styles.confirmButtonText} lightColor="#ffffff">
                  Confirm
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
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
  input: {
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
  inputText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: '800',
    fontSize: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    maxHeight: 300,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  pickerScroll: {
    width: '100%',
    maxHeight: 250,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
    minWidth: 80,
  },
  pickerItemSelected: {
    backgroundColor: '#2563eb',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerItemTextSelected: {
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});

