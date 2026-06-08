import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';

export function GradientHeaderBackground() {
  return (
    <LinearGradient
      colors={[...AppTheme.gradientHeader]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
