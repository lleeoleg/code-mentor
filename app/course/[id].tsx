import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { courses } from '@/lib/api';
import { levelLabel, formatCoursePrice } from '@/utils/courseHelpers';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useMyLearning } from '@/contexts/MyLearningContext';
import { useAuth } from '@/contexts/AuthContext';

function formatDate(s: string | undefined) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default function CourseDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isEnrolled, tryStartLearning } = useMyLearning();
  const [course, setCourse] = useState<{
    id: number;
    title: string;
    description?: string;
    level_display?: string;
    level?: string;
    price?: number | string | null;
    updated_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    courses
      .get(id)
      .then(setCourse)
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={styles.loader} />;
  if (error || !course) return <Text style={styles.error}>{error || 'Курс не найден'}</Text>;

  const fav = isFavorite(course.id);
  const handleToggleFav = () =>
    toggleFavorite({
      id: course.id,
      title: course.title,
      price: course.price,
      level_display: course.level_display,
      level: course.level,
    });

  const priceNum = course.price == null ? 0 : Number(course.price);
  const isFreeCourse = !priceNum || priceNum <= 0;

  const requireAuth = (): boolean => {
    if (!user) {
      Alert.alert('Вход', 'Войдите в аккаунт, чтобы записаться на курс.', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Войти', onPress: () => router.push('/login') },
      ]);
      return false;
    }
    return true;
  };

  const handleBuy = async () => {
    if (!requireAuth()) return;
    setPayLoading(true);
    try {
      const data = await courses.createCheckoutSession(course.id);
      const url = (data as { url?: string })?.url;
      if (url) await Linking.openURL(url);
      else Alert.alert('Ошибка', 'Не удалось получить ссылку на оплату.');
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.detail || e?.message || 'Оплата недоступна');
    } finally {
      setPayLoading(false);
    }
  };

  const handleTryFree = async () => {
    if (!requireAuth()) return;
    setStartLoading(true);
    try {
      await tryStartLearning(course.id);
      router.push(`/course/${course.id}/learn`);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.detail || e?.message || 'Не удалось записаться');
    } finally {
      setStartLoading(false);
    }
  };

  const handleStartFree = async () => {
    if (!requireAuth()) return;
    setStartLoading(true);
    try {
      await tryStartLearning(course.id);
      router.push(`/course/${course.id}/learn`);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.detail || e?.message || 'Не удалось начать курс');
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← К списку курсов</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favBtn} onPress={handleToggleFav} activeOpacity={0.7}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={26} color={fav ? '#dc2626' : '#6b7280'} />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.badge}>{levelLabel(course.level_display ?? course.level)}</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.meta}>Обновлён: {formatDate(course.updated_at)}</Text>

        <View style={styles.actions}>
          <Text style={styles.priceBlock}>{formatCoursePrice(course.price, course)}</Text>

          {isFreeCourse ? (
            <TouchableOpacity
              style={[styles.btnPrimary, startLoading && styles.btnDisabled]}
              onPress={handleStartFree}
              activeOpacity={0.8}
              disabled={startLoading}
            >
              <Text style={styles.btnPrimaryText}>
                {startLoading ? '…' : isEnrolled(course.id) ? 'Продолжить обучение' : 'Начать курс бесплатно'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btnPrimary, payLoading && styles.btnDisabled]}
                onPress={handleBuy}
                activeOpacity={0.8}
                disabled={payLoading}
              >
                <Text style={styles.btnPrimaryText}>{payLoading ? '…' : 'Купить'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnOutline, startLoading && styles.btnDisabled]}
                onPress={handleTryFree}
                activeOpacity={0.8}
                disabled={startLoading}
              >
                <Text style={styles.btnOutlineText}>
                  {startLoading ? '…' : isEnrolled(course.id) ? 'Продолжить обучение' : 'Попробовать бесплатно'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.desc}>{course.description || 'Описание отсутствует.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, marginTop: 48 },
  error: { color: '#dc2626', padding: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  backBtn: { padding: 16 },
  backBtnText: { color: '#3f8cff', fontSize: 16 },
  favBtn: { padding: 12 },
  body: { padding: 20 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    fontSize: 12,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  actions: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  priceBlock: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: '#3f8cff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnOutline: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnOutlineText: { color: '#0d0d0d', fontSize: 16, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
  desc: { fontSize: 16, lineHeight: 24 },
});
