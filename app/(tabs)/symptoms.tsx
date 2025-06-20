import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Modal, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Plus, ChevronLeft, Camera, X, Trash2 } from 'lucide-react-native';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import CaptureModal from '@/components/CaptureModal';
import { useSymptomStorage, SymptomRecord } from '@/hooks/useSymptomStorage';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function SymptomsScreen() {
  const { symptoms, addSymptom, addRecord, removeRecord, isLoading, error, clearError } = useSymptomStorage();
  const [showNewSymptomModal, setShowNewSymptomModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<any>(null);
  const [newSymptomName, setNewSymptomName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all symptom records flattened with symptom name
  const getAllRecords = () => {
    const allRecords: (SymptomRecord & { symptomName: string; symptomId: string })[] = [];
    symptoms.forEach(symptom => {
      symptom.records.forEach(record => {
        allRecords.push({
          ...record,
          symptomName: symptom.name,
          symptomId: symptom.id,
        });
      });
    });
    // Sort by timestamp, newest first
    return allRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleAddSymptom = async () => {
    if (!newSymptomName.trim()) {
      setValidationError('Please enter a symptom name');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');
      clearError();

      const newRecord: Omit<SymptomRecord, 'id'> = {
        severity,
        timestamp: `${date}T${time}`,
        imageUri: capturedPhoto || undefined,
      };

      await addSymptom({
        name: newSymptomName.trim(),
        records: [newRecord]
      });
      
      // Reset form
      setNewSymptomName('');
      setSeverity(5);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setCapturedPhoto(null);
      setShowNewSymptomModal(false);
    } catch (err) {
      setValidationError('Failed to add symptom. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSymptomPress = (symptom: any) => {
    setSelectedSymptom(symptom);
    setSeverity(5);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setCapturedPhoto(null);
    setShowSeverityModal(true);
  };

  const handleSubmitSeverity = async () => {
    if (selectedSymptom) {
      try {
        setIsSubmitting(true);
        clearError();
        
        const newRecord: Omit<SymptomRecord, 'id'> = {
          severity,
          timestamp: `${date}T${time}`,
          imageUri: capturedPhoto || undefined,
        };

        await addRecord(selectedSymptom.id, newRecord);
        
        setShowSeverityModal(false);
        setSelectedSymptom(null);
        setCapturedPhoto(null);
      } catch (err) {
        // Error is handled by the context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelSeverity = () => {
    setShowSeverityModal(false);
    setSelectedSymptom(null);
    setCapturedPhoto(null);
  };

  const handleCancelNewSymptom = () => {
    setShowNewSymptomModal(false);
    setNewSymptomName('');
    setSeverity(5);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setValidationError('');
    setCapturedPhoto(null);
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

  const handleRemoveRecord = async (recordId: string, symptomId: string) => {
    try {
      await removeRecord(symptomId, recordId);
    } catch (err) {
      // Error is handled by the context
    }
  };

  const incrementSeverity = () => {
    if (severity < 10) {
      setSeverity(severity + 1);
    }
  };

  const decrementSeverity = () => {
    if (severity > 0) {
      setSeverity(severity - 1);
    }
  };

  const handleHome = () => {
    router.back();
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
          <Text style={styles.headerTitle}>Symptoms</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading your symptom entries...</Text>
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
        <Text style={styles.headerTitle}>Symptoms</Text>
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
          title="New Symptom"
          onPress={() => setShowNewSymptomModal(true)}
          variant="primary"
          icon={<Plus size={24} color={Colors.common.white} />}
          fullWidth
          style={styles.addButton}
        />

        {/* Existing Symptoms for Quick Recording */}
        {symptoms.length > 0 && (
          <View style={styles.existingSymptomsSection}>
            <Text style={styles.sectionTitle}>Record Existing Symptoms</Text>
            {symptoms.map(symptom => (
              <Pressable
                key={symptom.id}
                style={({ pressed }) => [
                  styles.symptomCard,
                  pressed && styles.symptomCardPressed
                ]}
                onPress={() => handleSymptomPress(symptom)}
              >
                <Text style={styles.symptomName}>{symptom.name}</Text>
                {symptom.records.length > 0 && (
                  <Text style={styles.lastRecord}>
                    Last recorded: Severity {symptom.records[symptom.records.length - 1].severity}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* All Symptom Records */}
        {allRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No symptom records yet</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your symptoms by adding your first entry above
            </Text>
          </View>
        ) : (
          <View style={styles.recordsSection}>
            <Text style={styles.sectionTitle}>Recent Records</Text>
            {allRecords.map(record => (
              <View key={`${record.symptomId}_${record.id}`} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordMainContent}>
                    {record.imageUri && (
                      <Image source={{ uri: record.imageUri }} style={styles.recordImage} />
                    )}
                    <View style={styles.recordTextContent}>
                      <Text style={styles.recordSymptomName}>{record.symptomName}</Text>
                      <Text style={styles.recordSeverity}>Severity: {record.severity}/10</Text>
                      <Text style={styles.timestamp}>
                        {new Date(record.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleRemoveRecord(record.id, record.symptomId)}
                  >
                    <Trash2 size={20} color={Colors.error.main} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Symptom Modal */}
      <Modal
        visible={showNewSymptomModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelNewSymptom}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Symptom</Text>
            
            {(validationError || error) && (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>
                  {validationError || error}
                </Text>
              </View>
            )}
            
            <TextInput
              label="Symptom Name"
              value={newSymptomName}
              onChangeText={setNewSymptomName}
              placeholder="e.g., Headache, Nausea, Fatigue"
              containerStyle={styles.inputContainer}
              editable={!isSubmitting}
            />

            <View style={styles.severityContainer}>
              <Text style={styles.severityLabel}>Initial Severity</Text>
              <View style={styles.severitySpinner}>
                <Button
                  title="-"
                  onPress={decrementSeverity}
                  variant="outline"
                  style={styles.severityButton}
                  disabled={severity <= 0 || isSubmitting}
                />
                <View style={styles.severityDisplay}>
                  <Text style={styles.severityValue}>{severity}</Text>
                </View>
                <Button
                  title="+"
                  onPress={incrementSeverity}
                  variant="outline"
                  style={styles.severityButton}
                  disabled={severity >= 10 || isSubmitting}
                />
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
                title="Save Symptom"
                onPress={handleAddSymptom}
                variant="primary"
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={handleCancelNewSymptom}
                variant="outline"
                style={styles.modalButton}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Severity Modal */}
      <Modal
        visible={showSeverityModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelSeverity}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedSymptom?.name}</Text>
            
            <View style={styles.severityContainer}>
              <Text style={styles.severityLabel}>Severity</Text>
              <View style={styles.severitySpinner}>
                <Button
                  title="-"
                  onPress={decrementSeverity}
                  variant="outline"
                  style={styles.severityButton}
                  disabled={severity <= 0 || isSubmitting}
                />
                <View style={styles.severityDisplay}>
                  <Text style={styles.severityValue}>{severity}</Text>
                </View>
                <Button
                  title="+"
                  onPress={incrementSeverity}
                  variant="outline"
                  style={styles.severityButton}
                  disabled={severity >= 10 || isSubmitting}
                />
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
                title="Record Symptom"
                onPress={handleSubmitSeverity}
                variant="primary"
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={handleCancelSeverity}
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
  existingSymptomsSection: {
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
  symptomCard: {
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
  symptomCardPressed: {
    opacity: 0.8,
  },
  symptomName: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
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
  recordSymptomName: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  recordSeverity: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
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
  severityContainer: {
    marginBottom: Spacing.lg,
  },
  severityLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  severitySpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  severityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  severityDisplay: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  severityValue: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
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