import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Modal, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Plus, ChevronLeft, Camera, X, Trash2, Pill, Check } from 'lucide-react-native';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import CaptureModal from '@/components/CaptureModal';
import { useMedicationStorage, MedicationRecord } from '@/hooks/useMedicationStorage';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function MedicationScreen() {
  const { medications, addMedication, addRecord, removeRecord, isLoading, error, clearError } = useMedicationStorage();
  const [showNewMedicationModal, setShowNewMedicationModal] = useState(false);
  const [showDosageModal, setShowDosageModal] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [newMedicationName, setNewMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicationTaken, setMedicationTaken] = useState(true); // true = taken (green tick), false = missed (red cross)

  // Get all medication records flattened with medication name
  const getAllRecords = () => {
    const allRecords: (MedicationRecord & { medicationName: string; medicationId: string; medicationType: string })[] = [];
    medications.forEach(medication => {
      medication.records.forEach(record => {
        allRecords.push({
          ...record,
          medicationName: medication.name,
          medicationId: medication.id,
          medicationType: medication.type,
        });
      });
    });
    // Sort by timestamp, newest first
    return allRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleAddMedication = async () => {
    if (!newMedicationName.trim()) {
      setValidationError('Please enter a medication name');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');
      clearError();

      // Create initial record with taken/missed status
      const newRecord: Omit<MedicationRecord, 'id'> = {
        dosage: medicationTaken ? 'Taken' : 'Missed',
        timestamp: `${date}T${time}`,
        imageUri: capturedPhoto || undefined,
        notes: medicationTaken ? 'Medication taken as scheduled' : 'Medication missed',
      };

      await addMedication({
        name: newMedicationName.trim(),
        type: 'prescription', // Default type since we removed the type selection
        records: [newRecord] // Include the initial record
      });
      
      // Reset form
      setNewMedicationName('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setCapturedPhoto(null);
      setMedicationTaken(true);
      setShowNewMedicationModal(false);
    } catch (err) {
      setValidationError('Failed to add medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMedicationPress = (medication: any) => {
    setSelectedMedication(medication);
    setDosage('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setCapturedPhoto(null);
    setShowDosageModal(true);
  };

  const handleSubmitDosage = async () => {
    if (!dosage.trim()) {
      setValidationError('Please enter a dosage');
      return;
    }

    if (selectedMedication) {
      try {
        setIsSubmitting(true);
        clearError();
        setValidationError('');
        
        const newRecord: Omit<MedicationRecord, 'id'> = {
          dosage: dosage.trim(),
          timestamp: `${date}T${time}`,
          imageUri: capturedPhoto || undefined,
          notes: notes.trim() || undefined,
        };

        await addRecord(selectedMedication.id, newRecord);
        
        setShowDosageModal(false);
        setSelectedMedication(null);
        setCapturedPhoto(null);
        setDosage('');
        setNotes('');
      } catch (err) {
        // Error is handled by the context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelDosage = () => {
    setShowDosageModal(false);
    setSelectedMedication(null);
    setCapturedPhoto(null);
    setDosage('');
    setNotes('');
    setValidationError('');
  };

  const handleCancelNewMedication = () => {
    setShowNewMedicationModal(false);
    setNewMedicationName('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setValidationError('');
    setCapturedPhoto(null);
    setMedicationTaken(true);
    clearError();
  };

  const handleCapture = () => {
    setShowCaptureModal(true);
  };

  const handleCaptureComplete = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setShowCaptureModal(false);
  };

  const handleCaptureCancel = () => {
    setShowCaptureModal(false);
  };

  const handleRemovePhoto = () => {
    setCapturedPhoto(null);
  };

  const handleRemoveRecord = async (recordId: string, medicationId: string) => {
    try {
      await removeRecord(medicationId, recordId);
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleHome = () => {
    router.back();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription':
        return Colors.primary.main;
      case 'supplement':
        return Colors.secondary.main;
      case 'vitamin':
        return Colors.accent.main;
      default:
        return Colors.neutral.main;
    }
  };

  const allRecords = getAllRecords();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="Back"
            onPress={handleHome}
            variant="text"
            icon={<ChevronLeft size={24} color={Colors.common.white} />}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Medication</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading your medication entries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back"
          onPress={handleHome}
          variant="text"
          icon={<ChevronLeft size={24} color={Colors.common.white} />}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Medication</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Dismiss"
              onPress={clearError}
              variant="text"
              style={styles.dismissButton}
            />
          </View>
        )}

        <Button
          title="Add Medication"
          onPress={() => setShowNewMedicationModal(true)}
          variant="primary"
          icon={<Plus size={24} color={Colors.common.white} />}
          fullWidth
          style={styles.addButton}
        />

        {/* Existing Medications for Quick Recording */}
        {medications.length > 0 && (
          <View style={styles.existingMedicationsSection}>
            <Text style={styles.sectionTitle}>Record Existing Medications</Text>
            {medications.map(medication => (
              <Pressable
                key={medication.id}
                style={({ pressed }) => [
                  styles.medicationCard,
                  pressed && styles.medicationCardPressed
                ]}
                onPress={() => handleMedicationPress(medication)}
              >
                <View style={styles.medicationHeader}>
                  <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(medication.type) }]}>
                    <Pill size={16} color={Colors.common.white} />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationType}>
                      {medication.type.charAt(0).toUpperCase() + medication.type.slice(1)}
                    </Text>
                    {medication.records.length > 0 && (
                      <Text style={styles.lastRecord}>
                        Last taken: {medication.records[medication.records.length - 1].dosage}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* All Medication Records */}
        {allRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No medication records yet</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your medications by adding your first entry above
            </Text>
          </View>
        ) : (
          <View style={styles.recordsSection}>
            <Text style={styles.sectionTitle}>Recent Records</Text>
            {allRecords.map(record => (
              <View key={`${record.medicationId}_${record.id}`} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordMainContent}>
                    {record.imageUri && (
                      <Image source={{ uri: record.imageUri }} style={styles.recordImage} />
                    )}
                    <View style={styles.recordTextContent}>
                      <Text style={styles.recordMedicationName}>{record.medicationName}</Text>
                      <Text style={styles.recordDosage}>Dosage: {record.dosage}</Text>
                      <Text style={styles.recordType}>
                        {record.medicationType.charAt(0).toUpperCase() + record.medicationType.slice(1)}
                      </Text>
                      {record.notes && (
                        <Text style={styles.recordNotes}>Notes: {record.notes}</Text>
                      )}
                      <Text style={styles.timestamp}>
                        {new Date(record.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleRemoveRecord(record.id, record.medicationId)}
                  >
                    <Trash2 size={20} color={Colors.error.main} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Medication Modal - Simplified with Date/Time and Taken/Missed */}
      <Modal
        visible={showNewMedicationModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelNewMedication}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Medication</Text>
            
            {(validationError || error) && (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>
                  {validationError || error}
                </Text>
              </View>
            )}
            
            <TextInput
              label="Medication Name"
              value={newMedicationName}
              onChangeText={setNewMedicationName}
              placeholder="e.g., Aspirin, Vitamin D, Fish Oil"
              containerStyle={styles.inputContainer}
              editable={!isSubmitting}
            />

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
                    editable={!isSubmitting}
                  />
                </View>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    containerStyle={styles.dateTimeInput}
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={styles.statusButtons}>
                <Pressable
                  style={[
                    styles.statusButton,
                    styles.takenButton,
                    medicationTaken && styles.statusButtonActive
                  ]}
                  onPress={() => setMedicationTaken(true)}
                  disabled={isSubmitting}
                >
                  <Check size={24} color={medicationTaken ? Colors.common.white : Colors.success.main} />
                  <Text style={[
                    styles.statusButtonText,
                    medicationTaken && styles.statusButtonTextActive
                  ]}>
                    Taken
                  </Text>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.statusButton,
                    styles.missedButton,
                    !medicationTaken && styles.statusButtonActive
                  ]}
                  onPress={() => setMedicationTaken(false)}
                  disabled={isSubmitting}
                >
                  <X size={24} color={!medicationTaken ? Colors.common.white : Colors.error.main} />
                  <Text style={[
                    styles.statusButtonText,
                    !medicationTaken && styles.statusButtonTextActive
                  ]}>
                    Missed
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Save Medication"
                onPress={handleAddMedication}
                variant="primary"
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={handleCancelNewMedication}
                variant="outline"
                style={styles.modalButton}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Dosage Modal */}
      <Modal
        visible={showDosageModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelDosage}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMedication?.name}</Text>
            
            {validationError && (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>{validationError}</Text>
              </View>
            )}
            
            <TextInput
              label="Dosage"
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 100mg, 2 tablets, 1 capsule"
              containerStyle={styles.inputContainer}
              editable={!isSubmitting}
            />

            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes..."
              containerStyle={styles.inputContainer}
              editable={!isSubmitting}
              multiline
              numberOfLines={2}
            />

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
                    editable={!isSubmitting}
                  />
                </View>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    containerStyle={styles.dateTimeInput}
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>

            <View style={styles.captureContainer}>
              {capturedPhoto ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: capturedPhoto }} style={styles.capturedPhoto} />
                  <Pressable style={styles.removePhotoButton} onPress={handleRemovePhoto}>
                    <X size={20} color={Colors.common.white} />
                  </Pressable>
                </View>
              ) : (
                <Button
                  title="Capture"
                  onPress={handleCapture}
                  variant="secondary"
                  icon={<Camera size={24} color={Colors.common.white} />}
                  fullWidth
                  style={styles.captureButton}
                  disabled={isSubmitting}
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Record Medication"
                onPress={handleSubmitDosage}
                variant="primary"
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={handleCancelDosage}
                variant="outline"
                style={styles.modalButton}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Capture Modal */}
      <CaptureModal
        visible={showCaptureModal}
        onComplete={handleCaptureComplete}
        onCancel={handleCaptureCancel}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxl,
    color: Colors.common.white,
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    backgroundColor: Colors.error.light,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.error.dark,
    flex: 1,
  },
  dismissButton: {
    marginLeft: Spacing.sm,
  },
  addButton: {
    marginBottom: Spacing.xl,
  },
  existingMedicationsSection: {
    marginBottom: Spacing.xl,
  },
  recordsSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  medicationCard: {
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
  medicationCardPressed: {
    opacity: 0.8,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  medicationType: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  lastRecord: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
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
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordMainContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  recordImage: {
    width: 60,
    height: 60,
    borderRadius: Spacing.sm,
    marginRight: Spacing.md,
    resizeMode: 'cover',
  },
  recordTextContent: {
    flex: 1,
  },
  recordMedicationName: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  recordDosage: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  recordType: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  recordNotes: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: Spacing.xs,
    borderRadius: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  timestamp: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    opacity: 0.8,
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
  modalErrorContainer: {
    backgroundColor: Colors.error.light,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalErrorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.error.dark,
  },
  inputContainer: {
    marginBottom: Spacing.md,
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
  statusContainer: {
    marginBottom: Spacing.lg,
  },
  statusLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.sm,
    borderWidth: 2,
  },
  takenButton: {
    borderColor: Colors.success.main,
    backgroundColor: Colors.success.light,
  },
  missedButton: {
    borderColor: Colors.error.main,
    backgroundColor: Colors.error.light,
  },
  statusButtonActive: {
    backgroundColor: Colors.success.main,
  },
  statusButtonText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  statusButtonTextActive: {
    color: Colors.common.white,
  },
  captureContainer: {
    marginBottom: Spacing.lg,
  },
  captureButton: {
    backgroundColor: Colors.secondary.main,
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  capturedPhoto: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.md,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error.main,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
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