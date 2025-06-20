import React, { useEffect } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  WithTimingConfig
} from 'react-native-reanimated';

interface AnimatedViewProps extends ViewProps {
  animation?: 'fadeIn' | 'slideUp' | 'slideInRight' | 'scale';
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  initialValues?: {
    opacity?: number;
    translateY?: number;
    translateX?: number;
    scale?: number;
  };
}

export default function AnimatedView({
  animation = 'fadeIn',
  delay = 0,
  duration = 400,
  children,
  initialValues,
  style,
  ...rest
}: AnimatedViewProps) {
  const opacity = useSharedValue(initialValues?.opacity ?? 0);
  const translateY = useSharedValue(initialValues?.translateY ?? 20);
  const translateX = useSharedValue(initialValues?.translateX ?? 0);
  const scale = useSharedValue(initialValues?.scale ?? 1);

  const timingConfig: WithTimingConfig = {
    duration,
    easing: Easing.bezier(0.16, 1, 0.3, 1), // Smooth ease out
  };

  useEffect(() => {
    switch (animation) {
      case 'fadeIn':
        opacity.value = withDelay(delay, withTiming(1, timingConfig));
        break;
      case 'slideUp':
        opacity.value = withDelay(delay, withTiming(1, timingConfig));
        translateY.value = withDelay(delay, withTiming(0, timingConfig));
        break;
      case 'slideInRight':
        opacity.value = withDelay(delay, withTiming(1, timingConfig));
        translateX.value = withDelay(delay, withTiming(0, timingConfig));
        break;
      case 'scale':
        opacity.value = withDelay(delay, withTiming(1, timingConfig));
        scale.value = withDelay(delay, withTiming(1, timingConfig));
        break;
      default:
        opacity.value = withDelay(delay, withTiming(1, timingConfig));
    }
  }, [animation, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]} {...rest}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base styles can be added here
  },
});