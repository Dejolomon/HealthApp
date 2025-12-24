import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMealLog, type MealLogEntry } from '@/hooks/use-meal-log';

export default function MealLogScreen() {
  const { logs, addMealLog, deleteMealLog, getLogsByDate } = useMealLog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    mealType: 'breakfast' as MealLogEntry['mealType'],
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: '',
  });

  const todayLogs = getLogsByDate(selectedDate);
  const totalCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);

  const handleAddMeal = async () => {
    if (!formData.foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const calories = parseFloat(formData.calories) || 0;
    const protein = parseFloat(formData.protein) || 0;
    const carbs = parseFloat(formData.carbs) || 0;
    const fat = parseFloat(formData.fat) || 0;

    if (calories <= 0) {
      Alert.alert('Error', 'Please enter calories');
      return;
    }

    try {
      await addMealLog({
        date: selectedDate,
        mealType: formData.mealType,
        foodName: formData.foodName.trim(),
        calories,
        protein,
        carbs,
        fat,
        notes: formData.notes.trim() || undefined,
      });

      // Reset form
      setFormData({
        mealType: 'breakfast',
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        notes: '',
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Meal logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Meal', 'Are you sure you want to delete this meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMealLog(id);
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1f2e" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title} lightColor="#1a1f2e">
            Meal Log
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ThemedView style={styles.dateCard}>
          <ThemedText type="defaultSemiBold" style={styles.dateLabel} lightColor="#1e40af">
            Select Date
          </ThemedText>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#8b95a7"
          />
          <ThemedText style={styles.dateText} lightColor="#4a5568">
            {formatDate(selectedDate)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.summaryCard}>
          <ThemedText type="subtitle" style={styles.summaryTitle} lightColor="#1a1f2e">
            Daily Summary
          </ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel} lightColor="#4a5568">
              Total Calories
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryValue} lightColor="#1a1f2e">
              {totalCalories} cal
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel} lightColor="#4a5568">
              Meals Logged
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryValue} lightColor="#1a1f2e">
              {todayLogs.length}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.logsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
            Meals for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </ThemedText>
          {todayLogs.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText} lightColor="#6b7280">
                No meals logged for this date. Tap the + button to add one!
              </ThemedText>
            </ThemedView>
          ) : (
            todayLogs.map((log) => (
              <ThemedView key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logHeaderLeft}>
                    <ThemedText type="defaultSemiBold" style={styles.logMealType} lightColor="#2563eb">
                      {mealTypeLabels[log.mealType]}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.logFoodName} lightColor="#1a1f2e">
                      {log.foodName}
                    </ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(log.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <View style={styles.logMacros}>
                  <View style={styles.macroItem}>
                    <ThemedText style={styles.macroValue} lightColor="#1a1f2e">
                      {log.calories}
                    </ThemedText>
                    <ThemedText style={styles.macroLabel} lightColor="#6b7280">
                      cal
                    </ThemedText>
                  </View>
                  <View style={styles.macroItem}>
                    <ThemedText style={styles.macroValue} lightColor="#1a1f2e">
                      {log.protein}g
                    </ThemedText>
                    <ThemedText style={styles.macroLabel} lightColor="#6b7280">
                      protein
                    </ThemedText>
                  </View>
                  <View style={styles.macroItem}>
                    <ThemedText style={styles.macroValue} lightColor="#1a1f2e">
                      {log.carbs}g
                    </ThemedText>
                    <ThemedText style={styles.macroLabel} lightColor="#6b7280">
                      carbs
                    </ThemedText>
                  </View>
                  <View style={styles.macroItem}>
                    <ThemedText style={styles.macroValue} lightColor="#1a1f2e">
                      {log.fat}g
                    </ThemedText>
                    <ThemedText style={styles.macroLabel} lightColor="#6b7280">
                      fat
                    </ThemedText>
                  </View>
                </View>
                {log.notes && (
                  <ThemedText style={styles.logNotes} lightColor="#6b7280">
                    {log.notes}
                  </ThemedText>
                )}
              </ThemedView>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Meal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="title" style={styles.modalTitle} lightColor="#1a1f2e">
                  Add Meal
                </ThemedText>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#1a1f2e" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                <View style={styles.formField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                    Meal Type
                  </ThemedText>
                  <View style={styles.mealTypeRow}>
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.mealTypeButton,
                          formData.mealType === type && styles.mealTypeButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, mealType: type })}
                      >
                        <ThemedText
                          style={[
                            styles.mealTypeText,
                            formData.mealType === type && styles.mealTypeTextActive,
                          ]}
                          lightColor={formData.mealType === type ? '#ffffff' : '#1a1f2e'}
                        >
                          {mealTypeLabels[type]}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                    Food Name *
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Grilled Chicken Salad"
                    placeholderTextColor="#8b95a7"
                    value={formData.foodName}
                    onChangeText={(value) => setFormData({ ...formData, foodName: value })}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                      Calories *
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#8b95a7"
                      value={formData.calories}
                      onChangeText={(value) => setFormData({ ...formData, calories: value })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                      Protein (g)
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#8b95a7"
                      value={formData.protein}
                      onChangeText={(value) => setFormData({ ...formData, protein: value })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                      Carbs (g)
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#8b95a7"
                      value={formData.carbs}
                      onChangeText={(value) => setFormData({ ...formData, carbs: value })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                      Fat (g)
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#8b95a7"
                      value={formData.fat}
                      onChangeText={(value) => setFormData({ ...formData, fat: value })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                    Notes (optional)
                  </ThemedText>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any additional notes..."
                    placeholderTextColor="#8b95a7"
                    value={formData.notes}
                    onChangeText={(value) => setFormData({ ...formData, notes: value })}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleAddMeal}>
                  <ThemedText type="defaultSemiBold" style={styles.saveButtonText} lightColor="#ffffff">
                    Add Meal
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            </ThemedView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  dateLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  dateInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1f2e',
    marginBottom: 8,
  },
  dateText: {
    marginTop: 4,
    fontSize: 14,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  summaryTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
  },
  logsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3fb1ff',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logHeaderLeft: {
    flex: 1,
  },
  logMealType: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  logFoodName: {
    fontSize: 16,
  },
  logMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 11,
  },
  logNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 0,
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
    fontSize: 22,
    fontWeight: '800',
  },
  modalScrollView: {
    padding: 20,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mealTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8f9fa',
  },
  mealTypeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mealTypeTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

