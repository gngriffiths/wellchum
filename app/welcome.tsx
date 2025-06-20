import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  useWindowDimensions,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import SocialButton from '@/components/SocialButton';
import AnimatedView from '@/components/AnimatedView';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize, LineHeight } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleLogin = () => {
    router.navigate('/(auth)/login');
  };

  const handleSignUp = () => {
    router.navigate('/(auth)/signup');
  };

  const handleForgotPassword = () => {
    router.navigate('/(auth)/forgot-password');
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    console.log(`Login with ${provider}`);
    // For demo purposes, navigate to tabs after social login
    router.navigate('/(tabs)');
  };

  return (
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
          <AnimatedView animation="fadeIn" duration={800}>
            <Logo size="large" />
          </AnimatedView>

          <AnimatedView animation="slideUp" delay={300} duration={800}>
            <Text style={styles.tagline}>
              Your Personal Health Journey Starts Here
            </Text>
          </AnimatedView>

          <View style={styles.actionsContainer}>
            <AnimatedView animation="slideUp" delay={500} duration={800}>
              <Button 
                title="Log In" 
                onPress={handleLogin}
                variant="primary"
                size="large"
                fullWidth
                style={styles.button}
              />

              <Button 
                title="Sign Up" 
                onPress={handleSignUp}
                variant="secondary"
                size="large"
                fullWidth
                style={styles.button}
              />

              <Button 
                title="Forgot Password?" 
                onPress={handleForgotPassword}
                variant="text"
                style={styles.forgotPasswordButton}
              />
            </AnimatedView>

            <AnimatedView animation="slideUp" delay={700} duration={800}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <SocialButton 
                  provider="google" 
                  onPress={() => handleSocialLogin('google')}
                  style={styles.socialButton}
                />
                
                <SocialButton 
                  provider="apple" 
                  onPress={() => handleSocialLogin('apple')}
                  style={styles.socialButton}
                />
              </View>
            </AnimatedView>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  largeScreenContainer: {
    maxWidth: 500,
  },
  tagline: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    lineHeight: Platform.OS === 'web' ? 30 : 30,
  },
  actionsContainer: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  button: {
    marginBottom: Spacing.md,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.md,
  },
  socialButtons: {
    width: '100%',
  },
  socialButton: {
    marginBottom: Spacing.sm,
  },
});