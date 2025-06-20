import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Platform, Image, Modal } from 'react-native';
import { Camera as CameraIcon, Image as ImageIcon, Check, X } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

interface CaptureModalProps {
  visible: boolean;
  onComplete: (photoUri: string) => void;
  onCancel: () => void;
}

export default function CaptureModal({ visible, onComplete, onCancel }: CaptureModalProps) {
  const [type] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onComplete(photo);
      setPhoto(null);
    }
  };

  const handleDelete = () => {
    setPhoto(null);
  };

  const handleCancel = () => {
    setPhoto(null);
    onCancel();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.permissionContainer}>
            <Text style={styles.message}>We need your permission to use the camera</Text>
            <Button 
              title="Grant Permission" 
              onPress={requestPermission}
              variant="primary"
              style={styles.permissionButton}
            />
            <Button 
              title="Cancel" 
              onPress={handleCancel}
              variant="outline"
              style={styles.permissionButton}
            />
          </View>
        </View>
      </Modal>
    );
  }

  if (photo) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo }} style={styles.preview} />
            <View style={styles.actionButtons}>
              <Button
                title="Confirm"
                onPress={handleConfirm}
                variant="primary"
                icon={<Check size={24} color={Colors.common.white} />}
                style={styles.actionButton}
              />
              <Button
                title="Retake"
                onPress={handleDelete}
                variant="outline"
                icon={<X size={24} color={Colors.error.main} />}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.cameraContainer}>
          {Platform.OS !== 'web' ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              type={type}
            >
              <View style={styles.buttonContainer}>
                <Button
                  title="Take Photo"
                  onPress={handleCapture}
                  variant="primary"
                  icon={<CameraIcon size={24} color={Colors.common.white} />}
                  style={styles.button}
                />
                <Button
                  title="Gallery"
                  onPress={handlePickImage}
                  variant="secondary"
                  icon={<ImageIcon size={24} color={Colors.common.white} />}
                  style={styles.button}
                />
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  icon={<X size={24} color={Colors.primary.main} />}
                  style={styles.button}
                />
              </View>
            </CameraView>
          ) : (
            <View style={styles.webFallback}>
              <Text style={styles.message}>Camera is not available on web</Text>
              <View style={styles.webButtons}>
                <Button
                  title="Upload Photo"
                  onPress={handlePickImage}
                  variant="primary"
                  icon={<ImageIcon size={24} color={Colors.common.white} />}
                  style={styles.button}
                />
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  icon={<X size={24} color={Colors.primary.main} />}
                  style={styles.button}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  button: {
    marginHorizontal: Spacing.sm,
  },
  previewContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.common.white,
    borderRadius: Spacing.lg,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.xl,
    backgroundColor: Colors.common.white,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  permissionContainer: {
    backgroundColor: Colors.common.white,
    borderRadius: Spacing.lg,
    padding: Spacing.xl,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  permissionButton: {
    marginTop: Spacing.md,
    width: '100%',
  },
  message: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  webButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
});