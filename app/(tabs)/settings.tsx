import { StyleSheet, Text, View, ScrollView, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatStorage } from '@/hooks/useChatStorage';
import { useDietStorage } from '@/hooks/useDietStorage';
import { useMedicationStorage } from '@/hooks/useMedicationStorage';
import { usePrescriptionStorage } from '@/hooks/usePrescriptionStorage';
import { useSymptomStorage } from '@/hooks/useSymptomStorage';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { clearMessages } = useChatStorage();
  const { clearItems } = useDietStorage();
  const { clearMedications } = useMedicationStorage();
  const { clearPrescriptions } = usePrescriptionStorage();
  const { clearSymptoms } = useSymptomStorage();
  const { showToast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [shareHealthData, setShareHealthData] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all your data? This action cannot be undone and will remove:\n\n• All chat messages\n• Diet entries\n• Medication records\n• Prescriptions\n• Symptom records',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              
              // Clear all data from storage
              await Promise.all([
                clearMessages(),
                clearItems(),
                clearMedications(),
                clearPrescriptions(),
                clearSymptoms(),
              ]);

              // Show success toast
              showToast('All data has been successfully cleared', 'success', 4000);
            } catch (error) {
              console.error('Failed to reset data:', error);
              showToast('Failed to clear data. Please try again.', 'error', 4000);
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders and updates
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ 
                false: Colors.gray[300], 
                true: Colors.primary.light 
              }}
              thumbColor={
                notificationsEnabled ? Colors.primary.main : Colors.gray[100]
              }
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme throughout the app
              </Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ 
                false: Colors.gray[300], 
                true: Colors.primary.light 
              }}
              thumbColor={
                darkModeEnabled ? Colors.primary.main : Colors.gray[100]
              }
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Share Health Data</Text>
              <Text style={styles.settingDescription}>
                Allow anonymous data sharing for research
              </Text>
            </View>
            <Switch
              value={shareHealthData}
              onValueChange={setShareHealthData}
              trackColor={{ 
                false: Colors.gray[300], 
                true: Colors.primary.light 
              }}
              thumbColor={
                shareHealthData ? Colors.primary.main : Colors.gray[100]
              }
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Terms of Service</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Privacy Policy</Text>
          </View>
          <View style={[styles.aboutItem, styles.lastItem]}>
            <Text style={styles.aboutLabel}>Contact Support</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Button
            title="Reset All Data"
            onPress={handleResetAllData}
            variant="outline"
            loading={isResetting}
            disabled={isResetting}
            style={[styles.resetButton, { borderColor: Colors.error.main }]}
            textStyle={{ color: Colors.error.main }}
          />
        </View>

        <Button
          title="Sign Out"
          onPress={signOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    backgroundColor: Colors.neutral.main,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.common.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxl,
    color: Colors.neutral.main,
  },
  name: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xl,
    color: Colors.common.white,
    marginBottom: Spacing.xs,
  },
  email: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.common.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    padding: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  lastItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: Spacing.sm,
    borderBottomRightRadius: Spacing.sm,
  },
  aboutLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  aboutValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  resetButton: {
    marginBottom: Spacing.md,
  },
  signOutButton: {
    marginTop: Spacing.xl,
  },
});