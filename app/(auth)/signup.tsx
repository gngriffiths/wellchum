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
import { ChevronLeft, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import AnimatedView from '@/components/AnimatedView';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function SignupScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const { signUp, isLoading, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleBack = () => {
    router.back();
  };

  const handleSignUp = async () => {
    // Clear previous errors
    clearError();
    
    // Validate inputs
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    if (!name) {
      errors.name = 'Name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    
    // If no validation errors, proceed with signup
    if (!errors.name && !errors.email && !errors.password && !errors.confirmPassword) {
      await signUp({ email, password, name });
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </AnimatedView>

            <AnimatedView animation="slideUp" delay={400} duration={600} style={styles.formContainer}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TextInput
                label="Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                leftIcon={<User size={20} color={Colors.text.secondary} />}
                error={validationErrors.name}
                containerStyle={styles.inputContainer}
              />

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
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                isPassword
                leftIcon={<Lock size={20} color={Colors.text.secondary} />}
                error={validationErrors.password}
                containerStyle={styles.inputContainer}
              />

              <TextInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                leftIcon={<Lock size={20} color={Colors.text.secondary} />}
                error={validationErrors.confirmPassword}
                containerStyle={styles.inputContainer}
              />

              <Button
                title="Sign Up"
                onPress={handleSignUp}
                variant="primary"
                size="large"
                loading={isLoading}
                fullWidth
                style={styles.signupButton}
              />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
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
    marginBottom: Spacing.md,
  },
  signupButton: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
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
});