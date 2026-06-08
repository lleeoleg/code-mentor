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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { courses as coursesApi } from '@/lib/api';
import { CourseGridCard } from '@/components/CourseGridCard';
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
  const { q: qParam } = useLocalSearchParams<{ q?: string }>();
  const [list, setList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    if (typeof qParam === 'string' && qParam.trim()) {
      setSearchQ(qParam.trim());
    }
  }, [qParam]);

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
    <CourseGridCard
      course={item}
      levelBadge={levelLabel(item.level_display ?? item.level)}
      priceLabel={formatCoursePrice(item.price, item)}
      onPress={() => router.push(`/course/${item.id}`)}
      style={styles.catalogCard}
    />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск по курсам..."
        placeholderTextColor="#4b5563"
        value={searchQ}
        onChangeText={setSearchQ}
        selectionColor="#2563eb"
        underlineColorAndroid="transparent"
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
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#9ca3af',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 17,
    lineHeight: 22,
    color: '#111827',
    backgroundColor: '#f9fafb',
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
  catalogCard: { marginBottom: 16 },
});
