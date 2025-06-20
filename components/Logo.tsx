import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const sizeValues = {
    small: 40,
    medium: 64,
    large: 96,
  };

  const logoSize = sizeValues[size];
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.logoContainer,
        { width: logoSize * 2, height: logoSize * 2, borderRadius: logoSize }
      ]}>
        <Heart
          size={logoSize}
          color={Colors.common.white}
          strokeWidth={1.5}
          fill={Colors.primary.main}
        />
      </View>
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.logoText}>Vitality</Text>
          <Text style={styles.logoTextAccent}>Track</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: Colors.secondary.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  textContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  logoText: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxl,
    color: Colors.text.primary,
  },
  logoTextAccent: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxl,
    color: Colors.primary.main,
  },
});