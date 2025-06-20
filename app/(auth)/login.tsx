import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import AnimatedView from '@/components/AnimatedView';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const { signIn, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });

  const handleBack = () => {
    router.back();
  };

  const handleLogin = async () => {
    // Clear previous errors
    clearError();
    
    // Validate inputs
    const errors = {
      email: '',
      password: ''
    };
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    
    // If no validation errors, proceed with login
    if (!errors.email && !errors.password) {
      await signIn({ email, password });
    }
  };

  const handleForgotPassword = () => {
    router.navigate('/(auth)/forgot-password');
  };

  const handleSignUp = () => {
    router.navigate('/(auth)/signup');
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to your account</Text>
            </AnimatedView>

            <AnimatedView animation="slideUp" delay={400} duration={600} style={styles.formContainer}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
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
                error={validationErrors.email}
                containerStyle={styles.inputContainer}
              />

              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
                leftIcon={<Lock size={20} color={Colors.text.secondary} />}
                error={validationErrors.password}
                containerStyle={styles.inputContainer}
              />

              <Button
                title="Forgot Password?"
                onPress={handleForgotPassword}
                variant="text"
                style={styles.forgotPasswordButton}
              />

              <Button
                title="Log In"
                onPress={handleLogin}
                variant="primary"
                size="large"
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
              />

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  variant="text"
                  style={styles.signupButton}
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
    marginBottom: Spacing.md,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginBottom: Spacing.xl,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signupText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  signupButton: {
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
});