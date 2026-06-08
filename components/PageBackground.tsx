import { ComponentProps } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppTheme } from '@/constants/theme';

type DecorItem = {
  name: ComponentProps<typeof MaterialCommunityIcons>['name'];
  top: number;
  left?: number;
  right?: number;
  size: number;
  rotate: string;
};

const LOGOS: DecorItem[] = [
  { name: 'language-python', top: 0.06, left: 0.04, size: 44, rotate: '-14deg' },
  { name: 'language-javascript', top: 0.12, right: 0.06, size: 38, rotate: '10deg' },
  { name: 'react', top: 0.28, left: 0.02, size: 36, rotate: '8deg' },
  { name: 'language-html5', top: 0.22, right: 0.03, size: 40, rotate: '-6deg' },
  { name: 'git', top: 0.42, left: 0.07, size: 34, rotate: '-18deg' },
  { name: 'docker', top: 0.38, right: 0.08, size: 36, rotate: '12deg' },
  { name: 'language-typescript', top: 0.52, right: 0.04, size: 34, rotate: '-10deg' },
  { name: 'language-java', top: 0.68, left: 0.09, size: 38, rotate: '-8deg' },
  { name: 'database', top: 0.64, right: 0.07, size: 32, rotate: '14deg' },
  { name: 'language-csharp', top: 0.78, left: 0.05, size: 36, rotate: '10deg' },
  { name: 'language-go', top: 0.82, right: 0.05, size: 34, rotate: '-12deg' },
  { name: 'api', top: 0.18, left: 0.14, size: 30, rotate: '-4deg' },
  { name: 'chart-bar', top: 0.48, right: 0.14, size: 32, rotate: '4deg' },
  { name: 'book-open-variant', top: 0.08, left: 0.48, size: 38, rotate: '-8deg' },
  { name: 'code-tags', top: 0.32, left: 0.82, size: 40, rotate: '6deg' },
  { name: 'console', top: 0.58, left: 0.72, size: 36, rotate: '-5deg' },
  { name: 'code-braces', top: 0.72, left: 0.42, size: 42, rotate: '3deg' },
];

export function PageBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.wrap} pointerEvents="none">
      {LOGOS.map((item, i) => {
        const left = item.left != null ? width * item.left : undefined;
        const right = item.right != null ? width * item.right : undefined;
        return (
          <MaterialCommunityIcons
            key={`${item.name}-${i}`}
            name={item.name}
            size={item.size}
            color={AppTheme.accentViolet}
            style={[
              styles.icon,
              {
                top: height * item.top,
                left,
                right,
                transform: [{ rotate: item.rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  icon: {
    position: 'absolute',
    opacity: AppTheme.decorOpacity,
  },
});
