import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExerciseLog, type ExerciseLogEntry } from '@/hooks/use-exercise-log';

const EXERCISE_TYPES = [
  'Running',
  'Walking',
  'Cycling',
  'Swimming',
  'Weight Training',
  'Yoga',
  'Pilates',
  'Dancing',
  'HIIT',
  'Rowing',
  'Elliptical',
  'Stair Climbing',
  'Other',
];

export default function ExerciseLogScreen() {
  const { logs, addExerciseLog, deleteExerciseLog, getLogsByDate } = useExerciseLog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    exerciseType: 'Running',
    duration: '',
    caloriesBurned: '',
    notes: '',
  });

  const todayLogs = getLogsByDate(selectedDate);
  const totalCalories = todayLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const totalDuration = todayLogs.reduce((sum, log) => sum + log.duration, 0);

  const handleAddExercise = async () => {
    if (!formData.exerciseType.trim()) {
      Alert.alert('Error', 'Please select an exercise type');
      return;
    }

    const duration = parseFloat(formData.duration) || 0;
    const caloriesBurned = parseFloat(formData.caloriesBurned) || 0;

    if (duration <= 0) {
      Alert.alert('Error', 'Please enter duration in minutes');
      return;
    }

    try {
      await addExerciseLog({
        date: selectedDate,
        exerciseType: formData.exerciseType,
        duration,
        caloriesBurned,
        notes: formData.notes.trim() || undefined,
      });

      // Reset form
      setFormData({
        exerciseType: 'Running',
        duration: '',
        caloriesBurned: '',
        notes: '',
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Exercise logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log exercise. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteExerciseLog(id);
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
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
            Exercise Log
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
              Total Calories Burned
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryValue} lightColor="#1a1f2e">
              {totalCalories} cal
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel} lightColor="#4a5568">
              Total Duration
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryValue} lightColor="#1a1f2e">
              {formatDuration(totalDuration)}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel} lightColor="#4a5568">
              Exercises Logged
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryValue} lightColor="#1a1f2e">
              {todayLogs.length}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.logsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
            Exercises for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </ThemedText>
          {todayLogs.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText} lightColor="#6b7280">
                No exercises logged for this date. Tap the + button to add one!
              </ThemedText>
            </ThemedView>
          ) : (
            todayLogs.map((log) => (
              <ThemedView key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logHeaderLeft}>
                    <ThemedText type="defaultSemiBold" style={styles.logExerciseType} lightColor="#2563eb">
                      {log.exerciseType}
                    </ThemedText>
                    <View style={styles.logStats}>
                      <View style={styles.statItem}>
                        <ThemedText style={styles.statValue} lightColor="#1a1f2e">
                          {formatDuration(log.duration)}
                        </ThemedText>
                        <ThemedText style={styles.statLabel} lightColor="#6b7280">
                          duration
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <ThemedText style={styles.statValue} lightColor="#1a1f2e">
                          {log.caloriesBurned}
                        </ThemedText>
                        <ThemedText style={styles.statLabel} lightColor="#6b7280">
                          calories
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(log.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
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

      {/* Add Exercise Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="title" style={styles.modalTitle} lightColor="#1a1f2e">
                  Add Exercise
                </ThemedText>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#1a1f2e" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                <View style={styles.formField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                    Exercise Type *
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseTypeScroll}>
                    {EXERCISE_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.exerciseTypeButton,
                          formData.exerciseType === type && styles.exerciseTypeButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, exerciseType: type })}
                      >
                        <ThemedText
                          style={[
                            styles.exerciseTypeText,
                            formData.exerciseType === type && styles.exerciseTypeTextActive,
                          ]}
                          lightColor={formData.exerciseType === type ? '#ffffff' : '#1a1f2e'}
                        >
                          {type}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {formData.exerciseType === 'Other' && (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter exercise type"
                      placeholderTextColor="#8b95a7"
                      value={formData.exerciseType}
                      onChangeText={(value) => setFormData({ ...formData, exerciseType: value })}
                    />
                  )}
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                      Duration (min) *
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#8b95a7"
                      value={formData.duration}
                      onChangeText={(value) => setFormData({ ...formData, duration: value })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.fieldLabel} lightColor="#1e40af">
                      Calories Burned
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#8b95a7"
                      value={formData.caloriesBurned}
                      onChangeText={(value) => setFormData({ ...formData, caloriesBurned: value })}
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

                <TouchableOpacity style={styles.saveButton} onPress={handleAddExercise}>
                  <ThemedText type="defaultSemiBold" style={styles.saveButtonText} lightColor="#ffffff">
                    Add Exercise
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
  logExerciseType: {
    fontSize: 16,
    marginBottom: 8,
  },
  logStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
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
  exerciseTypeScroll: {
    marginBottom: 8,
  },
  exerciseTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  exerciseTypeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  exerciseTypeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseTypeTextActive: {
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

