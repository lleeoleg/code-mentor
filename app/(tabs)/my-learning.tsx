import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useMyLearning } from '@/contexts/MyLearningContext';
import { levelLabel, formatCoursePrice } from '@/utils/courseHelpers';
import { courses, exams } from '@/lib/api';
import { useLessonProgress } from '@/contexts/LessonProgressContext';

export default function MyLearningScreen() {
  const { favorites, removeFavorite } = useFavorites();
  const { startedCourses } = useMyLearning();
  const { getCompletedLessonIds } = useLessonProgress();

  const [curriculumByCourse, setCurriculumByCourse] = useState<Record<string, any[]>>({});
  const [examInfoByCourse, setExamInfoByCourse] = useState<Record<string, any>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!startedCourses.length) {
      setCurriculumByCourse({});
      setExamInfoByCourse({});
      return;
    }

    Promise.all(
      startedCourses.map(async (c) => {
        const [curr, info] = await Promise.all([
          courses.curriculum(c.id).catch(() => []),
          exams.info(c.id).catch(() => ({ has_exam: false })),
        ]);
        return [String(c.id), curr, info] as const;
      })
    ).then((rows) => {
      if (cancelled) return;
      const currMap: Record<string, any[]> = {};
      const examMap: Record<string, any> = {};
      rows.forEach(([id, curr, info]) => {
        currMap[id] = Array.isArray(curr) ? curr : [];
        examMap[id] = info;
      });
      setCurriculumByCourse(currMap);
      setExamInfoByCourse(examMap);
    });

    return () => {
      cancelled = true;
    };
  }, [startedCourses]);

  const countLessons = (mods: any[]): number =>
    (mods || []).reduce((sum, m) => sum + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);

  const formatCountdown = (dt: string | null | undefined): string => {
    if (!dt) return '';
    const target = new Date(dt).getTime();
    if (!Number.isFinite(target)) return '';
    const left = Math.max(0, target - now);
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Моё обучение</Text>

      <Text style={styles.sectionTitle}>Курсы в обучении</Text>
      {startedCourses.length === 0 ? (
        <Text style={styles.muted}>Нажмите «Начать обучение» на странице курса, чтобы добавить его сюда.</Text>
      ) : (
        <View style={styles.list}>
          {startedCourses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}/learn`} asChild>
              <TouchableOpacity style={styles.card} activeOpacity={0.85}>
                <View style={styles.cardMain}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.cardMeta}>{levelLabel(course.level_display ?? course.level)}</Text>
                  <Text style={styles.cardPrice}>{formatCoursePrice(course.price, course)}</Text>

                  {(() => {
                    const cid = String(course.id);
                    const mods = curriculumByCourse[cid] || [];
                    const total = countLessons(mods);
                    const completed = getCompletedLessonIds(course.id);
                    const percent = total ? Math.min(100, Math.round((completed.length / total) * 100)) : 0;
                    const info = examInfoByCourse[cid];
                    const attemptsLeft = typeof info?.attempts_left_24h === 'number' ? info.attempts_left_24h : null;
                    const resetAt = info?.attempts_reset_at;
                    const last = info?.last_attempt;
                    const recent = Array.isArray(info?.attempts_recent) ? info.attempts_recent : [];
                    const showHistory = !!expandedHistory[cid];

                    return (
                      <View style={styles.extra}>
                        <Text style={styles.extraLine}>Прогресс курса: <Text style={styles.extraStrong}>{percent}%</Text> ({completed.length}/{total || '—'})</Text>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${percent}%` }]} />
                        </View>

                        {info?.has_exam ? (
                          <>
                            <Text style={styles.extraLine}>
                              Попыток осталось (3ч): <Text style={styles.extraStrong}>{attemptsLeft ?? '—'}</Text>
                              {attemptsLeft === 0 && resetAt ? (
                                <>
                                  {'  '}•  Снова можно через: <Text style={styles.extraStrong}>{formatCountdown(resetAt)}</Text>
                                </>
                              ) : null}
                            </Text>
                            {last ? (
                              <Text style={styles.extraLine}>
                                Последняя попытка: <Text style={styles.extraStrong}>{last.score_percent}%</Text> • {String(last.status)}
                              </Text>
                            ) : null}

                            {recent.length > 0 ? (
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setExpandedHistory((p) => ({ ...p, [cid]: !p[cid] }));
                                }}
                                style={styles.historyToggle}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.historyToggleText}>{showHistory ? 'Скрыть историю тестирований' : 'История тестирований'}</Text>
                                <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
                              </TouchableOpacity>
                            ) : null}

                            {showHistory ? (
                              <View style={styles.historyList}>
                                {recent.map((a: any) => (
                                  <Text key={a.id} style={styles.historyItem}>
                                    {a.score_percent}% — {String(a.status)}
                                  </Text>
                                ))}
                              </View>
                            ) : null}
                          </>
                        ) : null}
                      </View>
                    );
                  })()}
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Избранные</Text>
      {favorites.length === 0 ? (
        <Text style={styles.muted}>Добавляйте курсы в избранные сердечком на странице курса.</Text>
      ) : (
        <View style={styles.list}>
          {favorites.map((course) => (
            <View key={course.id} style={styles.card}>
              <Link href={`/course/${course.id}`} asChild style={styles.cardMain}>
                <TouchableOpacity activeOpacity={0.8} style={styles.cardMainTouch}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.cardMeta}>{levelLabel(course.level_display ?? course.level)}</Text>
                  <Text style={styles.cardPrice}>{formatCoursePrice(course.price, course)}</Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => removeFavorite(course.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="heart" size={24} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111' },
  sectionTitleSpaced: { marginTop: 24 },
  muted: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
  list: { marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardMain: { flex: 1 },
  cardMainTouch: { flex: 1, paddingVertical: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  cardPrice: { fontSize: 14, fontWeight: '600', color: '#0d0d0d' },
  extra: { marginTop: 10, gap: 6 },
  extraLine: { fontSize: 13, color: '#374151' },
  extraStrong: { fontWeight: '800', color: '#111' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#16a34a' },
  historyToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  historyToggleText: { fontSize: 13, color: '#111', fontWeight: '700' },
  historyList: { marginTop: 4, paddingLeft: 2, gap: 2 },
  historyItem: { fontSize: 13, color: '#6b7280' },
  heartBtn: { padding: 8 },
});
