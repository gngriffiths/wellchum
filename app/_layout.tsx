import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';
import { DietStorageProvider } from '@/hooks/useDietStorage';
import { SymptomStorageProvider } from '@/hooks/useSymptomStorage';
import { MedicationStorageProvider } from '@/hooks/useMedicationStorage';
import { PrescriptionStorageProvider } from '@/hooks/usePrescriptionStorage';
import { ChatStorageProvider } from '@/hooks/useChatStorage';
import { ToastProvider } from '@/hooks/useToast';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import {
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show a loading screen until fonts are ready
  if (!fontsLoaded && !fontError) {
    return <View style={styles.container} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ToastProvider>
        <AuthProvider>
          <DietStorageProvider>
            <SymptomStorageProvider>
              <MedicationStorageProvider>
                <PrescriptionStorageProvider>
                  <ChatStorageProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="welcome" />
                      <Stack.Screen 
                        name="(auth)" 
                        options={{
                          animation: 'slide_from_right',
                        }} 
                      />
                      <Stack.Screen 
                        name="(tabs)" 
                        options={{
                          animation: 'fade',
                        }}
                      />
                      <Stack.Screen name="+not-found" />
                    </Stack>
                  </ChatStorageProvider>
                </PrescriptionStorageProvider>
              </MedicationStorageProvider>
            </SymptomStorageProvider>
          </DietStorageProvider>
        </AuthProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});