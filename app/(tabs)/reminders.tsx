import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Plus, Bell, Clock, Calendar, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  type: 'medication' | 'appointment' | 'general';
  isCompleted: boolean;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Take Morning Medication',
      description: 'Vitamin D and Omega-3',
      datetime: '2024-01-15T08:00',
      type: 'medication',
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      description: 'Annual checkup with Dr. Smith',
      datetime: '2024-01-20T14:30',
      type: 'appointment',
      isCompleted: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [type, setType] = useState<'medication' | 'appointment' | 'general'>('general');
  const [validationError, setValidationError] = useState('');

  const handleAddReminder = () => {
    if (!title.trim()) {
      setValidationError('Please enter a title');
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      datetime: `${date}T${time}`,
      type,
      isCompleted: false,
    };

    setReminders(prev => [newReminder, ...prev]);
    resetForm();
    setShowAddModal(false);
  };

  const handleEditReminder = () => {
    if (!selectedReminder || !title.trim()) {
      setValidationError('Please enter a title');
      return;
    }

    const updatedReminder: Reminder = {
      ...selectedReminder,
      title: title.trim(),
      description: description.trim() || undefined,
      datetime: `${date}T${time}`,
      type,
    };

    setReminders(prev => prev.map(r => r.id === selectedReminder.id ? updatedReminder : r));
    resetForm();
    setShowEditModal(false);
    setSelectedReminder(null);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    if (selectedReminder?.id === id) {
      setShowEditModal(false);
      setSelectedReminder(null);
    }
  };

  const handleToggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    ));
  };

  const handleEditPress = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setDate(reminder.datetime.split('T')[0]);
    setTime(reminder.datetime.split('T')[1].slice(0, 5));
    setType(reminder.type);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setType('general');
    setValidationError('');
  };

  const handleCancel = () => {
    resetForm();
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedReminder(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return Colors.primary.main;
      case 'appointment':
        return Colors.secondary.main;
      default:
        return Colors.accent.main;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Bell size={16} color={Colors.common.white} />;
      case 'appointment':
        return <Calendar size={16} color={Colors.common.white} />;
      default:
        return <Clock size={16} color={Colors.common.white} />;
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const upcomingReminders = reminders.filter(r => !r.isCompleted && new Date(r.datetime) > new Date());
  const completedReminders = reminders.filter(r => r.isCompleted);
  const overdueReminders = reminders.filter(r => !r.isCompleted && new Date(r.datetime) <= new Date());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Button
          title="Add Reminder"
          onPress={() => setShowAddModal(true)}
          variant="primary"
          icon={<Plus size={24} color={Colors.common.white} />}
          fullWidth
          style={styles.addButton}
        />

        {/* Overdue Reminders */}
        {overdueReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.error.main }]}>Overdue</Text>
            {overdueReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditPress}
                onDelete={handleDeleteReminder}
                isOverdue
              />
            ))}
          </View>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditPress}
                onDelete={handleDeleteReminder}
              />
            ))}
          </View>
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditPress}
                onDelete={handleDeleteReminder}
                isCompleted
              />
            ))}
          </View>
        )}

        {reminders.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={64} color={Colors.gray[400]} />
            <Text style={styles.emptyStateTitle}>No reminders yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first reminder to stay on top of your health goals
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Reminder Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showEditModal ? 'Edit Reminder' : 'Add Reminder'}
            </Text>
            
            {validationError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            )}
            
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter reminder title"
              containerStyle={styles.inputContainer}
            />

            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Add additional details"
              multiline
              numberOfLines={2}
              containerStyle={styles.inputContainer}
            />

            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Type</Text>
              <View style={styles.typeButtons}>
                {(['general', 'medication', 'appointment'] as const).map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeButton,
                      type === t && styles.typeButtonActive,
                      { borderColor: getTypeColor(t) }
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === t && { color: Colors.common.white }
                    ]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeLabel}>Date & Time</Text>
              <View style={styles.dateTimeInputs}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    containerStyle={styles.dateTimeInput}
                  />
                </View>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    containerStyle={styles.dateTimeInput}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title={showEditModal ? 'Update' : 'Add'}
                onPress={showEditModal ? handleEditReminder : handleAddReminder}
                variant="primary"
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  isOverdue?: boolean;
  isCompleted?: boolean;
}

function ReminderCard({ 
  reminder, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  isOverdue = false,
  isCompleted = false 
}: ReminderCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return Colors.primary.main;
      case 'appointment':
        return Colors.secondary.main;
      default:
        return Colors.accent.main;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Bell size={16} color={Colors.common.white} />;
      case 'appointment':
        return <Calendar size={16} color={Colors.common.white} />;
      default:
        return <Clock size={16} color={Colors.common.white} />;
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={[
      styles.reminderCard,
      isOverdue && styles.overdueCard,
      isCompleted && styles.completedCard
    ]}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderMainContent}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(reminder.type) }]}>
            {getTypeIcon(reminder.type)}
          </View>
          <View style={styles.reminderTextContent}>
            <Text style={[
              styles.reminderTitle,
              isCompleted && styles.completedText
            ]}>
              {reminder.title}
            </Text>
            {reminder.description && (
              <Text style={[
                styles.reminderDescription,
                isCompleted && styles.completedText
              ]}>
                {reminder.description}
              </Text>
            )}
            <Text style={[
              styles.reminderDateTime,
              isOverdue && styles.overdueText
            ]}>
              {formatDateTime(reminder.datetime)}
            </Text>
          </View>
        </View>
        <View style={styles.reminderActions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onEdit(reminder)}
          >
            <Edit3 size={18} color={Colors.text.secondary} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => onDelete(reminder.id)}
          >
            <Trash2 size={18} color={Colors.error.main} />
          </Pressable>
          <Pressable
            style={[
              styles.checkButton,
              reminder.isCompleted && styles.checkButtonActive
            ]}
            onPress={() => onToggleComplete(reminder.id)}
          >
            {reminder.isCompleted && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxl,
    color: Colors.common.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
  },
  addButton: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  reminderCard: {
    backgroundColor: Colors.common.white,
    borderRadius: Spacing.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error.main,
  },
  completedCard: {
    opacity: 0.7,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderMainContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  reminderTextContent: {
    flex: 1,
  },
  reminderTitle: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  reminderDescription: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  reminderDateTime: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  overdueText: {
    color: Colors.error.main,
    fontFamily: FontFamily.bodyMedium,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
    borderRadius: Spacing.xs,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonActive: {
    backgroundColor: Colors.success.main,
    borderColor: Colors.success.main,
  },
  checkMark: {
    color: Colors.common.white,
    fontSize: 14,
    fontFamily: FontFamily.bodyMedium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyStateTitle: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.common.white,
    borderRadius: Spacing.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xl,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.error.light,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.error.dark,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  typeContainer: {
    marginBottom: Spacing.lg,
  },
  typeLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  typeButtonText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
  },
  dateTimeContainer: {
    marginBottom: Spacing.lg,
  },
  dateTimeLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  dateTimeInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateInputWrapper: {
    flex: 1,
  },
  timeInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
  },
  dateTimeInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});