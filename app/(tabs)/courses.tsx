import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { courses as coursesApi } from '@/lib/api';
import {
  levelLabel,
  formatCoursePrice,
  filterCoursesByLevel,
  LEVEL_FILTER_OPTIONS,
  PRICE_FILTER_OPTIONS,
} from '@/utils/courseHelpers';

type Course = {
  id: number;
  title: string;
  description?: string;
  level_display?: string;
  level?: string;
  price?: number | string;
};

function isPowerBICourse(course: Course): boolean {
  return !!(course.title && String(course.title).toLowerCase().includes('power bi'));
}

function filterBySearch(list: Course[], q: string): Course[] {
  if (!q.trim()) return list;
  const lower = q.trim().toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  return list.filter((c) => {
    const title = (c.title || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    return words.every((word) => title.includes(word) || desc.includes(word));
  });
}

export default function CoursesScreen() {
  const router = useRouter();
  const [list, setList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = priceFilter ? { price_type: priceFilter } : {};
    coursesApi
      .list(params)
      .then(setList)
      .catch(() => {
        setError('Ошибка загрузки');
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [priceFilter]);

  const byLevel = filterCoursesByLevel(list, levelFilter);
  const filtered = filterBySearch(byLevel, searchQ);

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.cardSquare}
      onPress={() => router.push(`/course/${item.id}`)}
      activeOpacity={0.8}
    >
      {isPowerBICourse(item) ? (
        <View style={styles.cardTop}>
          <Image source={require('@/assets/images/powerbi-logo.png')} style={styles.cardLogo} contentFit="contain" />
        </View>
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardMeta}>{levelLabel(item.level_display ?? item.level)}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description ? item.description.slice(0, 100) + (item.description.length > 100 ? '…' : '') : 'Без описания'}
        </Text>
        <Text style={styles.cardPrice}>{formatCoursePrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск по курсам..."
        value={searchQ}
        onChangeText={setSearchQ}
      />

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Цена: </Text>
        {PRICE_FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value || 'all'}
            style={[styles.chip, priceFilter === opt.value && styles.chipActive]}
            onPress={() => setPriceFilter(opt.value)}
          >
            <Text style={[styles.chipText, priceFilter === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Уровень: </Text>
        {LEVEL_FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value || 'all'}
            style={[styles.chip, levelFilter === opt.value && styles.chipActive]}
            onPress={() => setLevelFilter(opt.value)}
          >
            <Text style={[styles.chipText, levelFilter === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.muted}>Нет курсов</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchInput: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    lineHeight: 20,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  filterLabel: { fontSize: 14, marginRight: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#0d0d0d' },
  chipText: { fontSize: 13 },
  chipTextActive: { color: '#fff' },
  loader: { marginTop: 48 },
  error: { color: '#dc2626', padding: 16 },
  muted: { color: '#6b7280', padding: 16 },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  cardSquare: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    aspectRatio: 1,
  },
  cardTop: {
    height: 88,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  cardLogo: { width: 56, height: 56 },
  cardBody: { padding: 12, paddingBottom: 16 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  cardPrice: { fontSize: 14, fontWeight: '600' },
});
