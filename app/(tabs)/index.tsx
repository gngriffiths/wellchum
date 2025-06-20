import { StyleSheet, Text, View, ScrollView, Pressable, useWindowDimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Utensils, ClipboardList, ChartLine as LineChart } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useEffect } from 'react';

const MENU_ITEMS = [
  {
    id: 'diet',
    title: 'Diet',
    icon: (color: string) => <Utensils size={32} color={color} />,
    route: '/(tabs)/diet'
  },
  {
    id: 'medication',
    title: 'Medication',
    icon: (color: string) => <ClipboardList size={32} color={color} />,
    route: '/(tabs)/medication'
  },
  {
    id: 'symptoms',
    title: 'Symptom',
    icon: (color: string) => <LineChart size={32} color={color} />,
    route: '/(tabs)/symptoms'
  }
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Animation values for the Quokka bobbing
  const translateY = useSharedValue(0);

  // Start the bobbing animation when component mounts
  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-8, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1, // Infinite repeat
      true // Reverse direction
    );
  }, []);

  // Animated style for the Quokka
  const animatedQuokkaStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleMenuPress = (route: string) => {
    router.push(route);
  };

  const handleChatPress = () => {
    router.push('/(tabs)/chat');
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.header, { minHeight: height * 0.267 }]} // Decreased from 0.297 to 0.267 (10% reduction)
        onPress={handleChatPress}
        accessibilityRole="button"
        accessibilityLabel="Open chat"
      >
        <View style={styles.characterContainer}>
          {/* Speech bubble at the top */}
          <View style={styles.speechBubbleContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.greeting}>Hello, {user?.name || 'Demo User'}!</Text>
              <View style={styles.speechBubbleTail} />
            </View>
          </View>
          
          {/* Quokka character below and to the right with bobbing animation */}
          <View style={styles.quokkaContainer}>
            <Animated.View style={animatedQuokkaStyle}>
              <Image 
                source={require('@/assets/images/Quokka.png')}
                style={styles.quokkaImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>
      </Pressable>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isLargeScreen && styles.largeScreenContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed, hovered }) => [
                styles.menuItem,
                (pressed || hovered) && styles.menuItemActive
              ]}
              onPress={() => handleMenuPress(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.iconContainer}>
                {item.icon(Colors.primary.main)}
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
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
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'space-between',
  },
  characterContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  speechBubbleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  speechBubble: {
    backgroundColor: Colors.common.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    position: 'relative',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: '80%',
    minWidth: 200,
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -10,
    right: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.common.white,
  },
  greeting: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xl,
    color: Colors.primary.main,
    textAlign: 'center',
    lineHeight: FontSize.xl * 1.2,
  },
  quokkaContainer: {
    alignItems: 'flex-end',
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  quokkaImage: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: '5%',
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  largeScreenContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  menuItem: {
    backgroundColor: Colors.common.white,
    borderRadius: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      },
    }),
  },
  menuItemActive: {
    ...Platform.select({
      web: {
        transform: [{ translateY: -2 }],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      default: {
        opacity: 0.9,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTitle: {
    fontFamily: FontFamily.subheading,
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    textAlign: 'left',
    alignSelf: 'center',
  },
  captureContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
});