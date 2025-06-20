import React, { ReactNode } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface GradientBackgroundProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pattern?: 'dots' | 'lines' | 'none';
}

export default function GradientBackground({ 
  children, 
  style,
  pattern = 'dots'
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[Colors.secondary.light, Colors.primary.light]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {pattern !== 'none' && (
        <View style={[
          styles.pattern,
          pattern === 'dots' && styles.dotPattern,
          pattern === 'lines' && styles.linePattern
        ]} />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    zIndex: 1,
  },
  dotPattern: {
    backgroundColor: Colors.common.white,
    // In a real implementation, we would use an actual dot pattern
    // For this example, we're just using a solid color with low opacity
  },
  linePattern: {
    backgroundColor: Colors.common.white,
    // In a real implementation, we would use an actual line pattern
    // For this example, we're just using a solid color with low opacity
  },
});