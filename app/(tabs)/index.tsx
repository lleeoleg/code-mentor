import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Dimensions,
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
} from '@/utils/courseHelpers';
import { CourseGridCard } from '@/components/CourseGridCard';
import { HomeProgramSlider } from '@/components/HomeProgramSlider';
import { HomeReviewsStrip } from '@/components/HomeReviewsStrip';

const WEBINAR_URL = 'https://welcome.stepik.org/go_career';

type Course = {
  id: number;
  title: string;
  description?: string;
  level_display?: string;
  level?: string;
  price?: number | string;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(!!user);
  const [levelFilter, setLevelFilter] = useState('');
  const [activeCourseTab, setActiveCourseTab] = useState(COURSE_TABS[0].id);

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
  const screenW = Dimensions.get('window').width;
  const cardW = Math.floor((screenW - 16 * 2 - 12) / 2);

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

      {/* Карточка вебинара на всю ширину (как на сайте) */}
      <TouchableOpacity
        style={styles.webinarCard}
        activeOpacity={0.9}
        onPress={() => Linking.openURL(WEBINAR_URL)}
      >
        <Text style={styles.webinarLabel}>ВЕБИНАР</Text>
        <Text style={styles.webinarTitle}>Go-разработка в 2026: путь middle-разработчика</Text>
      </TouchableOpacity>

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
            <>
              <View style={styles.grid}>
                {filteredByLevel.map((course) => (
                  <CourseGridCard
                    key={course.id}
                    width={cardW}
                    course={course}
                    levelBadge={levelLabel(course.level_display ?? course.level)}
                    priceLabel={formatCoursePrice(course.price, course)}
                    onPress={() => router.push(`/course/${course.id}`)}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.moreCoursesBtn} onPress={() => router.push('/(tabs)/courses')} activeOpacity={0.8}>
                <Text style={styles.moreCoursesText}>Все курсы →</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      <HomeProgramSlider />
      <HomeReviewsStrip />

      {!user && (
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/login')}>
          <Text style={styles.linkBtnText}>Войти в аккаунт</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const SPACING = 20;

const PAGE_BG = '#f3f4f6';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BG },
  content: { paddingBottom: 32, paddingTop: SPACING },
  searchStrip: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: SPACING,
    backgroundColor: PAGE_BG,
  },
  searchBtn: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#9ca3af',
  },
  searchPlaceholder: {
    color: '#4b5563',
    fontSize: 17,
    lineHeight: 22,
  },
  webinarCard: {
    marginHorizontal: 16,
    marginBottom: SPACING,
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  webinarLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.06,
    color: '#6b7280',
    marginBottom: 4,
  },
  webinarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    lineHeight: 20,
  },
  heroText: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0d0d0d',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    marginTop: SPACING + 4,
    marginBottom: 12,
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
  grid: { paddingHorizontal: 16, gap: 12, flexDirection: 'row', flexWrap: 'wrap' },
  moreCoursesBtn: {
    alignSelf: 'flex-end',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  moreCoursesText: { color: '#3f8cff', fontSize: 15, fontWeight: '600' },
  linkBtn: { alignSelf: 'center', marginTop: 24 },
  linkBtnText: { color: '#3f8cff', fontSize: 16 },
});
