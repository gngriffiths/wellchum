import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Check, X, AlertCircle, Info } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Toast({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Colors.success.main,
          icon: <Check size={20} color={Colors.common.white} />,
        };
      case 'error':
        return {
          backgroundColor: Colors.error.main,
          icon: <X size={20} color={Colors.common.white} />,
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning.main,
          icon: <AlertCircle size={20} color={Colors.common.white} />,
        };
      case 'info':
        return {
          backgroundColor: Colors.primary.main,
          icon: <Info size={20} color={Colors.common.white} />,
        };
      default:
        return {
          backgroundColor: Colors.success.main,
          icon: <Check size={20} color={Colors.common.white} />,
        };
    }
  };

  const config = getToastConfig();

  useEffect(() => {
    if (visible) {
      // Show toast
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    }, () => {
      if (onHide) {
        runOnJS(onHide)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: config.backgroundColor },
          animatedStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {config.icon}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 60, // Account for status bar
    paddingHorizontal: Spacing.lg,
  },
  toast: {
    borderRadius: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    maxWidth: screenWidth - (Spacing.lg * 2),
    minWidth: 200,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  message: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.common.white,
    lineHeight: 20,
  },
});