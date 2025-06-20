import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, ActivityIndicator, Pressable, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Plus, ChevronLeft, Trash2, Camera, X } from 'lucide-react-native';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { useDietStorage, DietItem } from '@/hooks/useDietStorage';
import CaptureModal from '@/components/CaptureModal';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function DietScreen() {
  const { items, addItem, removeItem, isLoading, error, clearError } = useDietStorage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Check if we should reopen the modal when returning from capture
  useFocusEffect(
    React.useCallback(() => {
      // This will run when the screen comes into focus
      // You could add logic here to reopen the modal if needed
      // For now, we'll keep it simple and let the user manually reopen
    }, [])
  );

  const handleAdd = async () => {
    if (!name.trim()) {
      setValidationError('Please enter a name');
      return;
    }

    if (weight <= 0) {
      setValidationError('Please select a weight greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');
      clearError();

      await addItem({
        name: name.trim(),
        weight,
        timestamp: `${date}T${time}`,
        imageUri: capturedPhoto || undefined, // Include the captured photo
      });

      // Reset form
      setName('');
      setWeight(0);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setCapturedPhoto(null);
      setShowAddModal(false);
    } catch (err) {
      setValidationError('Failed to add entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setName('');
    setWeight(0);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setValidationError('');
    setCapturedPhoto(null);
    clearError();
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleHome = () => {
    router.back();
  };

  const incrementWeight = () => {
    if (weight < 2000) {
      setWeight(weight + 100);
    }
  };

  const decrementWeight = () => {
    if (weight > 0) {
      setWeight(weight - 100);
    }
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
          <Text style={styles.headerTitle}>Diet Tracking</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading your diet entries...</Text>
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
        <Text style={styles.headerTitle}>Diet Tracking</Text>
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
          title="Add Diet Entry"
          onPress={() => setShowAddModal(true)}
          variant="primary"
          icon={<Plus size={24} color={Colors.common.white} />}
          fullWidth
          style={styles.addButton}
        />

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No entries yet</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your diet by adding your first entry above
            </Text>
          </View>
        ) : (
          items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemMainContent}>
                  {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
                  )}
                  <View style={styles.itemTextContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemWeight}>{item.weight}g</Text>
                    <Text style={styles.timestamp}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Trash2 size={20} color={Colors.error.main} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Diet Entry Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Diet Entry</Text>
            
            {(validationError || error) && (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>
                  {validationError || error}
                </Text>
              </View>
            )}
            
            <TextInput
              label="Item Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Apple, Chicken Breast, Rice"
              containerStyle={styles.inputContainer}
              editable={!isSubmitting}
            />

            <View style={styles.weightContainer}>
              <Text style={styles.weightLabel}>Weight</Text>
              <View style={styles.weightSpinner}>
                <Button
                  title="-"
                  onPress={decrementWeight}
                  variant="outline"
                  style={styles.weightButton}
                  disabled={weight <= 0 || isSubmitting}
                />
                <View style={styles.weightDisplay}>
                  <Text style={styles.weightValue}>{weight}g</Text>
                </View>
                <Button
                  title="+"
                  onPress={incrementWeight}
                  variant="outline"
                  style={styles.weightButton}
                  disabled={weight >= 2000 || isSubmitting}
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
                title="Add Entry"
                onPress={handleAdd}
                variant="primary"
                style={styles.modalButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                onPress={handleCancel}
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
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemMainContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Spacing.sm,
    marginRight: Spacing.md,
    resizeMode: 'cover',
  },
  itemTextContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
    borderRadius: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  itemWeight: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
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
  weightContainer: {
    marginBottom: Spacing.lg,
  },
  weightLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  weightSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  weightButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  weightDisplay: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  weightValue: {
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