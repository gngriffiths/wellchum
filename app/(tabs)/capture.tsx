import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Platform, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera as CameraIcon, Image as ImageIcon, Chrome as Home, Check, X } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function CaptureScreen() {
  const [type] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  
  // Get the source parameter to know where we came from
  const { source } = useLocalSearchParams<{ source?: string }>();

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
    // Here you would typically save or process the photo
    console.log('Photo confirmed:', photo);
    
    // Navigate back based on source
    if (source === 'diet') {
      // Navigate back to diet screen
      router.navigate('/(tabs)/diet');
    } else {
      // Default behavior - go back
      router.back();
    }
  };

  const handleDelete = () => {
    setPhoto(null);
    
    // Navigate back based on source
    if (source === 'diet') {
      // Navigate back to diet screen
      router.navigate('/(tabs)/diet');
    } else {
      // Default behavior - go back
      router.back();
    }
  };

  const handleHome = () => {
    // Navigate back based on source
    if (source === 'diet') {
      // Navigate back to diet screen
      router.navigate('/(tabs)/diet');
    } else {
      // Default behavior - go back
      router.back();
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <Button 
          title="Grant Permission" 
          onPress={requestPermission}
          variant="primary"
        />
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
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
            title="Delete"
            onPress={handleDelete}
            variant="outline"
            icon={<X size={24} color={Colors.error.main} />}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
              title="Back"
              onPress={handleHome}
              variant="outline"
              icon={<Home size={24} color={Colors.primary.main} />}
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
              title="Back"
              onPress={handleHome}
              variant="outline"
              icon={<Home size={24} color={Colors.primary.main} />}
              style={styles.button}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
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
  preview: {
    flex: 1,
    resizeMode: 'contain',
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