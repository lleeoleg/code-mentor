import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getCourseLogoSource } from '@/utils/courseLogos';
import { getCourseCardBadgeLines } from '@/utils/courseCardBranding';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { FavoriteCourse } from '@/contexts/FavoritesContext';

const HEADER_BG = '#F5F5F5';
const BADGE_BG = '#FDF2D9';
const BADGE_TEXT = '#A37F4C';
const PRICE_BLUE = '#4A90E2';
const LOGO_BLUE = '#007BFF';
const CARD_BORDER = '#e8e8e8';

export type CourseGridCourse = {
  id: number;
  title: string;
  description?: string;
  level_display?: string;
  level?: string;
  price?: number | string;
};

export type CourseGridCardProps = {
  course: CourseGridCourse;
  /** Уже отформатированная цена («Бесплатно», «7 990 ₸»). */
  priceLabel: string;
  /** Подпись уровня для бейджа (например «Средний»). */
  levelBadge: string;
  onPress: () => void;
  width?: number;
  style?: ViewStyle;
  showFavorite?: boolean;
};

function toFavoriteCourse(c: CourseGridCourse): FavoriteCourse {
  return {
    id: c.id,
    title: c.title,
    price: c.price,
    level: c.level,
    level_display: c.level_display,
  };
}

export function CourseGridCard({
  course,
  priceLabel,
  levelBadge,
  onPress,
  width,
  style,
  showFavorite = true,
}: CourseGridCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(course.id);
  const logo = getCourseLogoSource(course);
  const { line1, line2 } = getCourseCardBadgeLines(course);
  const badgeUpper = String(levelBadge || '—').toUpperCase();

  return (
    <View style={[styles.shadowWrap, width != null ? { width } : styles.fullWidth, style]}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.92}
          style={styles.cardTouchable}
          accessibilityRole="button"
          accessibilityLabel={course.title}
        >
          <View style={styles.header}>
            <View style={styles.logoTile}>
              {logo ? (
                <Image source={logo} style={styles.logoImg} contentFit="contain" />
              ) : (
                <>
                  <Text style={styles.logoLine1} numberOfLines={1}>
                    {line1}
                  </Text>
                  {line2 ? (
                    <Text style={styles.logoLine2} numberOfLines={1}>
                      {line2}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </View>
          <View style={styles.body}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{badgeUpper}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={styles.price}>{priceLabel}</Text>
          </View>
        </TouchableOpacity>

        {showFavorite ? (
          <TouchableOpacity
            style={styles.favOuter}
            onPress={() => toggleFavorite(toFavoriteCourse(course))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={fav ? 'Убрать из избранного' : 'В избранное'}
          >
            <View style={styles.favCircle}>
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={20}
                color={fav ? '#ef4444' : '#9ca3af'}
              />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardTouchable: {},
  header: {
    backgroundColor: HEADER_BG,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  logoTile: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: LOGO_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  logoImg: {
    width: 52,
    height: 52,
  },
  logoLine1: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoLine2: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  body: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BADGE_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BADGE_TEXT,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: PRICE_BLUE,
  },
  favOuter: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  favCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
});
