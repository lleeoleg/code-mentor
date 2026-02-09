import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { courses } from '@/lib/api';
import {
  levelLabel,
  formatCoursePrice,
  filterCoursesByLevel,
  LEVEL_FILTER_OPTIONS,
  COURSE_TABS,
  PROGRAM_TABS,
} from '@/utils/courseHelpers';
import { Image } from 'expo-image';

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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(!!user);
  const [levelFilter, setLevelFilter] = useState('');
  const [activeCourseTab, setActiveCourseTab] = useState(COURSE_TABS[0].id);
  const [activeProgramTab, setActiveProgramTab] = useState(PROGRAM_TABS[0].id);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // На главной всегда загружаем все курсы без фильтра по цене
    courses
      .list()
      .then(setCourseList)
      .catch(() => setCourseList([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredByLevel = filterCoursesByLevel(courseList, levelFilter);
  const showCourses = user && !loading;

  const handleSearch = () => {
    if (user) router.push('/(tabs)/courses');
    else router.push('/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Полоса поиска */}
      <View style={styles.searchStrip}>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchPlaceholder}>Поиск по курсам...</Text>
        </TouchableOpacity>
      </View>

      {/* Hero с баннером */}
      <View style={styles.heroWrap}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => Linking.openURL('https://welcome.stepik.org/go_career')}
        >
          <Image
            source={require('@/assets/images/webinar-banner.png')}
            style={styles.heroImage}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Текст под картинкой */}
      <View style={styles.heroText}>
        <Text style={styles.heroTitle}>Учитесь с CodeMentor</Text>
        <Text style={styles.heroDesc}>
          Платформа для обучения программированию. Выбирайте курсы по уровню и получайте практические навыки.
        </Text>
        {user ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/courses')} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Каталог курсов</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/register')} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Начать бесплатно</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Онлайн-курсы: вкладки + фильтры по цене и уровню */}
      {showCourses && (
        <>
          <Text style={styles.sectionTitle}>Онлайн-курсы</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
            {COURSE_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeCourseTab === tab.id && styles.tabActive]}
                onPress={() => setActiveCourseTab(tab.id)}
              >
                <Text style={[styles.tabText, activeCourseTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.sectionSubtitle}>Уровень</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
            {LEVEL_FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value || 'all'}
                style={[styles.chip, levelFilter === opt.value && styles.chipActive]}
                onPress={() => setLevelFilter(opt.value)}
              >
                <Text style={[styles.chipText, levelFilter === opt.value && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator style={styles.loader} color="#0d0d0d" />
          ) : filteredByLevel.length === 0 ? (
            <Text style={styles.muted}>Пока нет курсов.</Text>
          ) : (
            <View style={styles.grid}>
              {filteredByLevel.slice(0, 6).map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.cardSquare}
                  onPress={() => router.push(`/course/${course.id}`)}
                  activeOpacity={0.8}
                >
                  {isPowerBICourse(course) ? (
                    <View style={styles.cardTop}>
                      <Image source={require('@/assets/images/powerbi-logo.png')} style={styles.cardLogo} contentFit="contain" />
                    </View>
                  ) : null}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
                    <Text style={styles.cardMeta}>{levelLabel(course.level_display ?? course.level)}</Text>
                    <Text style={styles.cardPrice}>{formatCoursePrice(course.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Программы курсов: вкладки + фильтр по уровню */}
          <Text style={[styles.sectionTitle, styles.sectionTitlePrograms]}>Программы курсов</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
            {PROGRAM_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeProgramTab === tab.id && styles.tabActive]}
                onPress={() => setActiveProgramTab(tab.id)}
              >
                <Text style={[styles.tabText, activeProgramTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.sectionSubtitle}>Уровень</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
            {LEVEL_FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={`program-${opt.value || 'all'}`}
                style={[styles.chip, levelFilter === opt.value && styles.chipActive]}
                onPress={() => setLevelFilter(opt.value)}
              >
                <Text style={[styles.chipText, levelFilter === opt.value && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator style={styles.loader} color="#0d0d0d" />
          ) : filteredByLevel.length === 0 ? (
            <Text style={styles.muted}>Пока нет программ.</Text>
          ) : (
            <View style={styles.grid}>
              {filteredByLevel.slice(0, 6).map((course) => (
                <TouchableOpacity
                  key={`program-${course.id}`}
                  style={styles.cardSquare}
                  onPress={() => router.push(`/course/${course.id}`)}
                  activeOpacity={0.8}
                >
                  {isPowerBICourse(course) ? (
                    <View style={styles.cardTop}>
                      <Image source={require('@/assets/images/powerbi-logo.png')} style={styles.cardLogo} contentFit="contain" />
                    </View>
                  ) : null}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
                    <Text style={styles.cardMeta}>{levelLabel(course.level_display ?? course.level)}</Text>
                    <Text style={styles.cardPrice}>{formatCoursePrice(course.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {!user && (
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/login')}>
          <Text style={styles.linkBtnText}>Войти в аккаунт</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  searchStrip: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  searchBtn: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchPlaceholder: {
    color: '#6b7280',
    fontSize: 16,
  },
  heroWrap: {
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  heroImage: {
    width: '100%',
    height: 160,
  },
  heroText: {
    marginHorizontal: 16,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0d0d0d',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitlePrograms: {
    marginTop: 32,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabsScroll: { marginBottom: 12, maxHeight: 44 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  tabActive: { backgroundColor: '#0d0d0d' },
  tabText: { fontSize: 14, color: '#374151' },
  tabTextActive: { color: '#fff' },
  chipsScroll: { marginBottom: 16, maxHeight: 44 },
  chipsContent: { paddingHorizontal: 16 },
  chip: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#0d0d0d' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextActive: { color: '#fff' },
  loader: { marginVertical: 24 },
  muted: { color: '#6b7280', padding: 16 },
  grid: { paddingHorizontal: 16, gap: 16 },
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
    maxWidth: 180,
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
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#111' },
  cardMeta: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  cardPrice: { fontSize: 14, fontWeight: '600', color: '#0d0d0d' },
  linkBtn: { alignSelf: 'center', marginTop: 24 },
  linkBtnText: { color: '#3f8cff', fontSize: 16 },
});
