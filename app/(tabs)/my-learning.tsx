import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useMyLearning } from '@/contexts/MyLearningContext';
import { levelLabel, formatCoursePrice } from '@/utils/courseHelpers';
import { courses, exams } from '@/lib/api';
import { useLessonProgress } from '@/contexts/LessonProgressContext';
import { AppTheme } from '@/constants/theme';

export default function MyLearningScreen() {
  const { favorites, removeFavorite } = useFavorites();
  const { enrolledList, loading: enrollmentsLoading, refreshEnrollments } = useMyLearning();
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
    if (!enrolledList.length) {
      setCurriculumByCourse({});
      setExamInfoByCourse({});
      return;
    }

    Promise.all(
      enrolledList.map(async (e) => {
        const [curr, info] = await Promise.all([
          courses.curriculum(e.course).catch(() => []),
          exams.info(e.course).catch(() => ({ has_exam: false })),
        ]);
        return [String(e.course), curr, info] as const;
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
  }, [enrolledList]);

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
      {enrollmentsLoading ? (
        <ActivityIndicator style={{ marginVertical: 16 }} />
      ) : enrolledList.length === 0 ? (
        <>
          <Text style={styles.muted}>Начните курс из каталога — запись синхронизируется с аккаунтом (как на сайте).</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => refreshEnrollments()}>
            <Text style={styles.refreshBtnText}>Обновить список</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.list}>
          {enrolledList.map((e) => (
            <View key={e.id} style={styles.card}>
              <Link href={`/course/${e.course}/learn`} asChild>
                <TouchableOpacity style={styles.cardMain} activeOpacity={0.85}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{e.course_title}</Text>
                  {(() => {
                    const cid = String(e.course);
                    const mods = curriculumByCourse[cid] || [];
                    const total = countLessons(mods);
                    const completed = getCompletedLessonIds(e.course);
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
                              Попыток осталось (4ч): <Text style={styles.extraStrong}>{attemptsLeft ?? '—'}</Text>
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
                                onPress={(ev) => {
                                  ev.stopPropagation?.();
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
                </TouchableOpacity>
              </Link>
              <View style={styles.rowActions}>
                <Link href={`/course/${e.course}/learn`} asChild>
                  <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Продолжить" activeOpacity={0.8}>
                    <Ionicons name="play-circle-outline" size={24} color={AppTheme.accent} />
                  </TouchableOpacity>
                </Link>
                <Link href={`/course/${e.course}/exam`} asChild>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnExam]} accessibilityLabel="Итоговый тест" activeOpacity={0.8}>
                    <Ionicons name="clipboard-outline" size={24} color="#f59e0b" />
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Избранные</Text>
      {favorites.length === 0 ? (
        <Text style={styles.muted}>Добавляйте курсы в избранные сердечком на странице курса.</Text>
      ) : (
        <View style={styles.list}>
          {favorites.map((course) => (
            <View key={course.id} style={[styles.card, styles.cardFav]}>
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
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: AppTheme.text },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: AppTheme.text },
  sectionTitleSpaced: { marginTop: 24 },
  muted: { fontSize: 15, color: AppTheme.textMuted, textAlign: 'center', marginBottom: 8 },
  refreshBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  refreshBtnText: { color: AppTheme.accent, fontWeight: '600' },
  list: { marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: AppTheme.radius,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppTheme.border,
    overflow: 'hidden',
  },
  cardMain: { flex: 1, padding: 14 },
  cardMainTouch: { flex: 1, paddingVertical: 4 },
  rowActions: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: AppTheme.border,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: AppTheme.cardHover,
  },
  iconBtnExam: { borderColor: 'rgba(245, 158, 11, 0.5)', backgroundColor: 'rgba(245, 158, 11, 0.06)' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: AppTheme.textMuted, marginBottom: 2 },
  cardPrice: { fontSize: 14, fontWeight: '600', color: AppTheme.accent },
  extra: { marginTop: 10, gap: 6 },
  extraLine: { fontSize: 13, color: AppTheme.textMuted },
  extraStrong: { fontWeight: '800', color: AppTheme.text },
  progressBar: { height: 8, backgroundColor: AppTheme.border, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: AppTheme.green },
  historyToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  historyToggleText: { fontSize: 13, color: AppTheme.text, fontWeight: '700' },
  historyList: { marginTop: 4, paddingLeft: 2, gap: 2 },
  historyItem: { fontSize: 13, color: AppTheme.textMuted },
  heartBtn: { padding: 8 },
  cardFav: { alignItems: 'center' },
});
