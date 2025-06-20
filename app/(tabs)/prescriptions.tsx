import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Plus, FileText, Archive, Trash2 } from 'lucide-react-native';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { usePrescriptionStorage } from '@/hooks/usePrescriptionStorage';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function PrescriptionsScreen() {
  const { prescriptions, addPrescription, archivePrescription, deletePrescription, isLoading, error, clearError } = usePrescriptionStorage();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  
  // Form states
  const [prescriptionText, setPrescriptionText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPrescription = async () => {
    if (!prescriptionText.trim()) {
      setValidationError('Please enter prescription details');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');
      clearError();
      
      await addPrescription(prescriptionText);
      setPrescriptionText('');
      setShowAddModal(false);
    } catch (err) {
      setValidationError('Failed to add prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchivePrescription = async () => {
    if (selectedPrescription) {
      try {
        await archivePrescription(selectedPrescription.id);
        setShowViewModal(false);
        setSelectedPrescription(null);
      } catch (err) {
        // Error is handled by the context
      }
    }
  };

  const handleDeletePrescription = async () => {
    if (selectedPrescription) {
      try {
        await deletePrescription(selectedPrescription.id);
        setShowViewModal(false);
        setSelectedPrescription(null);
      } catch (err) {
        // Error is handled by the context
      }
    }
  };

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setPrescriptionText('');
    setValidationError('');
    clearError();
  };

  const handleHome = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Separate current and archived prescriptions
  const currentPrescriptions = prescriptions.filter(p => !p.isArchived);
  const archivedPrescriptions = prescriptions.filter(p => p.isArchived);

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
          <Text style={styles.headerTitle}>Prescriptions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading your prescriptions...</Text>
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
        <Text style={styles.headerTitle}>Prescriptions</Text>
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
          title="Add Prescription"
          onPress={() => setShowAddModal(true)}
          variant="primary"
          icon={<Plus size={24} color={Colors.common.white} />}
          fullWidth
          style={styles.addButton}
        />

        {/* Current Prescriptions */}
        {currentPrescriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Prescriptions</Text>
            {currentPrescriptions.map(prescription => (
              <Pressable
                key={prescription.id}
                style={({ pressed }) => [
                  styles.prescriptionCard,
                  pressed && styles.prescriptionCardPressed
                ]}
                onPress={() => handleViewPrescription(prescription)}
              >
                <View style={styles.prescriptionHeader}>
                  <View style={styles.prescriptionIcon}>
                    <FileText size={20} color={Colors.primary.main} />
                  </View>
                  <View style={styles.prescriptionContent}>
                    <Text style={styles.prescriptionPreview} numberOfLines={2}>
                      {prescription.text}
                    </Text>
                    <Text style={styles.prescriptionDate}>
                      Added {formatDate(prescription.createdDate)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Archived Prescriptions */}
        {archivedPrescriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archived Prescriptions</Text>
            {archivedPrescriptions.map(prescription => (
              <Pressable
                key={prescription.id}
                style={({ pressed }) => [
                  styles.prescriptionCard,
                  styles.archivedCard,
                  pressed && styles.prescriptionCardPressed
                ]}
                onPress={() => handleViewPrescription(prescription)}
              >
                <View style={styles.prescriptionHeader}>
                  <View style={[styles.prescriptionIcon, styles.archivedIcon]}>
                    <Archive size={20} color={Colors.gray[600]} />
                  </View>
                  <View style={styles.prescriptionContent}>
                    <Text style={[styles.prescriptionPreview, styles.archivedText]} numberOfLines={2}>
                      {prescription.text}
                    </Text>
                    <Text style={styles.prescriptionDate}>
                      Archived {formatDate(prescription.archivedDate!)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {prescriptions.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.gray[400]} />
            <Text style={styles.emptyStateTitle}>No prescriptions yet</Text>
            <Text style={styles.emptyStateText}>
              Add your first prescription to keep track of your medications and dosages
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Prescription Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Prescription</Text>
            
            {(validationError || error) && (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>
                  {validationError || error}
                </Text>
              </View>
            )}
            
            <TextInput
              label="Prescription Details"
              value={prescriptionText}
              onChangeText={setPrescriptionText}
              placeholder="Enter medication name, dosage, frequency, and any special instructions..."
              multiline
              numberOfLines={6}
              containerStyle={styles.inputContainer}
              editable={!isSubmitting}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Save Prescription"
                onPress={handleAddPrescription}
                variant="primary"
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={handleCancelAdd}
                variant="outline"
                style={styles.modalButton}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        visible={showViewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedPrescription?.isArchived ? 'Archived Prescription' : 'Current Prescription'}
            </Text>
            
            <ScrollView style={styles.prescriptionTextContainer}>
              <Text style={styles.prescriptionText}>{selectedPrescription?.text}</Text>
            </ScrollView>
            
            <View style={styles.prescriptionMeta}>
              <Text style={styles.metaText}>
                Added: {selectedPrescription?.createdDate && formatDate(selectedPrescription.createdDate)}
              </Text>
              {selectedPrescription?.archivedDate && (
                <Text style={styles.metaText}>
                  Archived: {formatDate(selectedPrescription.archivedDate)}
                </Text>
              )}
            </View>

            <View style={styles.modalButtons}>
              {!selectedPrescription?.isArchived && (
                <Button
                  title="Archive"
                  onPress={handleArchivePrescription}
                  variant="secondary"
                  icon={<Archive size={20} color={Colors.common.white} />}
                  style={styles.modalButton}
                />
              )}
              <Button
                title="Delete"
                onPress={handleDeletePrescription}
                variant="outline"
                icon={<Trash2 size={20} color={Colors.error.main} />}
                style={[styles.modalButton, styles.deleteButton]}
              />
              <Button
                title="Close"
                onPress={() => setShowViewModal(false)}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  prescriptionCard: {
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
  prescriptionCardPressed: {
    opacity: 0.8,
  },
  archivedCard: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gray[400],
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  prescriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  archivedIcon: {
    backgroundColor: Colors.gray[200],
  },
  prescriptionContent: {
    flex: 1,
  },
  prescriptionPreview: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  archivedText: {
    color: Colors.text.secondary,
  },
  prescriptionDate: {
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
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
    maxWidth: 500,
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
    marginBottom: Spacing.lg,
  },
  prescriptionTextContainer: {
    maxHeight: 200,
    marginBottom: Spacing.lg,
  },
  prescriptionText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  prescriptionMeta: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metaText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    minWidth: 100,
  },
  deleteButton: {
    borderColor: Colors.error.main,
  },
});