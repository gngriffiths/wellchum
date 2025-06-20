import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

interface SocialButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function SocialButton({ provider, onPress, style }: SocialButtonProps) {
  const getProviderLabel = () => {
    switch (provider) {
      case 'google':
        return 'Continue with Google';
      case 'apple':
        return 'Continue with Apple';
      case 'facebook':
        return 'Continue with Facebook';
      default:
        return 'Continue with Social';
    }
  };

  const getProviderIcon = () => {
    // In a real implementation, we would use actual icons here
    // For this example, we'll use a placeholder
    return (
      <View style={[styles.iconPlaceholder, 
        provider === 'google' && styles.googleIcon,
        provider === 'apple' && styles.appleIcon,
        provider === 'facebook' && styles.facebookIcon
      ]} />
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={getProviderLabel()}
    >
      <View style={styles.content}>
        {getProviderIcon()}
        <Text style={styles.text}>{getProviderLabel()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.common.white,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    width: '100%',
    marginVertical: Spacing.sm / 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.md,
  },
  googleIcon: {
    backgroundColor: '#DB4437',
  },
  appleIcon: {
    backgroundColor: '#000000',
  },
  facebookIcon: {
    backgroundColor: '#4267B2',
  },
  text: {
    color: Colors.text.primary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
  },
});