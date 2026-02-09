import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { courses } from '@/lib/api';
import { levelLabel, formatCoursePrice } from '@/utils/courseHelpers';

function formatDate(s: string | undefined) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<{
    id: number;
    title: string;
    description?: string;
    level_display?: string;
    level?: string;
    price?: number | string;
    updated_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← К списку курсов</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={styles.badge}>{levelLabel(course.level_display ?? course.level)}</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.meta}>
          Обновлён: {formatDate(course.updated_at)}
        </Text>

        <View style={styles.actions}>
          <Text style={styles.priceBlock}>{formatCoursePrice(course.price)}</Text>
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>Купить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
            <Text style={styles.btnOutlineText}>Попробовать бесплатно</Text>
          </TouchableOpacity>
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
  backBtn: { padding: 16 },
  backBtnText: { color: '#3f8cff', fontSize: 16 },
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
    backgroundColor: '#0d0d0d',
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
  desc: { fontSize: 16, lineHeight: 24 },
});
