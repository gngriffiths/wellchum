import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { FontFamily, FontSize } from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

export default function AnalysisScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Analysis</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Health analysis and insights will be displayed here
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    backgroundColor: Colors.secondary.main,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.xxl,
    color: Colors.common.white,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});