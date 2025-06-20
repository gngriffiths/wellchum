import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import AnimatedView from '@/components/AnimatedView';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function ForgotPasswordScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const { resetPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    clearError();
    setValidationError('');
    
    // Validate email
    if (!email) {
      setValidationError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Invalid email format');
      return;
    }
    
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      // Error will be handled by the useAuth hook
    }
  };

  const handleLogin = () => {
    router.navigate('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <GradientBackground pattern="dots">
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            isLargeScreen && styles.largeScreenContent
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.container,
            isLargeScreen && styles.largeScreenContainer
          ]}>
            <AnimatedView animation="fadeIn" duration={600}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ChevronLeft size={24} color={Colors.text.primary} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </AnimatedView>

            <AnimatedView animation="slideUp" delay={200} duration={600}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password
              </Text>
            </AnimatedView>

            <AnimatedView animation="slideUp" delay={400} duration={600} style={styles.formContainer}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {resetSent && (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>
                    Password reset email sent! Check your inbox.
                  </Text>
                </View>
              )}

              <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={<Mail size={20} color={Colors.text.secondary} />}
                error={validationError}
                containerStyle={styles.inputContainer}
                editable={!resetSent}
              />

              <Button
                title={resetSent ? "Email Sent" : "Reset Password"}
                onPress={handleResetPassword}
                variant="primary"
                size="large"
                loading={isLoading}
                disabled={resetSent}
                fullWidth
                style={styles.resetButton}
              />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password?</Text>
                <Button
                  title="Log In"
                  onPress={handleLogin}
                  variant="text"
                  style={styles.loginButton}
                />
              </View>
            </AnimatedView>
          </View>
        </ScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: Spacing.xl,
  },
  largeScreenContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  largeScreenContainer: {
    maxWidth: 500,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  backButtonText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxxl,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },
  formContainer: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  resetButton: {
    marginBottom: Spacing.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  loginText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  loginButton: {
    marginLeft: Spacing.xs,
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
  successContainer: {
    backgroundColor: Colors.success.light,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.md,
  },
  successText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.success.dark,
  },
});