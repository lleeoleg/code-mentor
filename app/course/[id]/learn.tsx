import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { courses, lessons, comments } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonProgress } from '@/contexts/LessonProgressContext';

type CurriculumModule = {
  id: number;
  title: string;
  order: number;
  lessons: { id: number; title: string; order: number; is_free: boolean }[];
};

type LessonDetail = {
  id: number;
  title: string;
  order: number;
  content_type: 'video' | 'text';
  content: string;
  is_free: boolean;
  locked?: boolean;
  detail?: string;
};

const SIDEBAR_W = 290;
const HEADER_H = 52;

function stripHtml(s: string): string {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function getVideoUri(raw: string): string {
  const url = String(raw || '').trim();
  // Many seeded lessons use YouTube embed URLs. Some embeds can be blocked (error 152).
  // Opening the watch page in WebView is more reliable.
  const ytEmbed = url.match(/youtube\.com\/embed\/([^?&#/]+)/i);
  if (ytEmbed?.[1]) return `https://www.youtube.com/watch?v=${ytEmbed[1]}`;
  const youtuBe = url.match(/youtu\.be\/([^?&#/]+)/i);
  if (youtuBe?.[1]) return `https://www.youtube.com/watch?v=${youtuBe[1]}`;
  return url;
}

export default function CourseLearnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isLessonCompleted, markLessonCompleted } = useLessonProgress();

  const courseId = useMemo(() => String(id || ''), [id]);

  const [courseTitle, setCourseTitle] = useState<string>('Курс');
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonDetail | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [commentsList, setCommentsList] = useState<{ id: number; username: string; text: string; created_at: string }[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);

  // Drawer: hidden by default (offscreen to the right).
  const tx = useSharedValue(SIDEBAR_W);
  const opened = useSharedValue(false);

  const openDrawer = () => {
    opened.value = true;
    tx.value = withTiming(0, { duration: 220 });
  };
  const closeDrawer = () => {
    opened.value = false;
    tx.value = withTiming(SIDEBAR_W, { duration: 220 });
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      // no-op
    })
    .onUpdate((e) => {
      // Right drawer: swipe left to open, swipe right to close.
      const next = Math.max(0, Math.min(SIDEBAR_W, tx.value - e.changeX));
      tx.value = next;
    })
    .onEnd(() => {
      const shouldOpen = tx.value < SIDEBAR_W / 2;
      if (shouldOpen) openDrawer();
      else closeDrawer();
    });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opened.value ? 1 : 0, { duration: 160 }),
    pointerEvents: opened.value ? ('auto' as any) : ('none' as any),
  }));

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    Promise.all([courses.get(courseId), courses.curriculum(courseId)])
      .then(([c, curr]) => {
        setCourseTitle(c?.title || 'Курс');
        setCurriculum(Array.isArray(curr) ? curr : []);
        const first = (curr?.[0]?.lessons?.[0]?.id as number | undefined) ?? null;
        setCurrentLessonId(first);
      })
      .catch(() => setError('Ошибка загрузки курса'))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (!currentLessonId) {
      setCurrentLesson(null);
      return;
    }
    setLessonLoading(true);
    lessons
      .get(currentLessonId)
      .then(setCurrentLesson)
      .catch((err: any) => {
        const data = err?.response?.data;
        if (data?.locked) setCurrentLesson({ locked: true, detail: data.detail } as any);
        else setCurrentLesson(null);
      })
      .finally(() => setLessonLoading(false));
  }, [currentLessonId]);

  useEffect(() => {
    if (!currentLessonId) {
      setCommentsList([]);
      return;
    }
    setCommentsLoading(true);
    setCommentError(null);
    comments
      .list(currentLessonId)
      .then((list) => setCommentsList(Array.isArray(list) ? list : []))
      .catch(() => setCommentsList([]))
      .finally(() => setCommentsLoading(false));
  }, [currentLessonId]);

  const allLessons = useMemo(() => curriculum.flatMap((m) => m.lessons || []), [curriculum]);
  const nextLessonId = useMemo(() => {
    if (!currentLessonId) return null;
    const idx = allLessons.findIndex((l) => l.id === currentLessonId);
    if (idx >= 0 && idx < allLessons.length - 1) return allLessons[idx + 1].id;
    return null;
  }, [allLessons, currentLessonId]);

  const selectLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    closeDrawer();
  };

  const handleNextLesson = async () => {
    if (currentLessonId) {
      await markLessonCompleted(courseId, currentLessonId);
    }
    if (nextLessonId) setCurrentLessonId(nextLessonId);
  };

  const submitComment = async () => {
    if (!currentLessonId) return;
    const text = commentText.trim();
    if (!text) return;
    setCommentError(null);
    try {
      await comments.create(currentLessonId, text);
      setCommentText('');
      const list = await comments.list(currentLessonId);
      setCommentsList(Array.isArray(list) ? list : []);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Не удалось отправить комментарий';
      setCommentError(String(msg));
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 48 }} />;
  }
  if (error) {
    return <Text style={{ color: '#dc2626', padding: 24 }}>{error}</Text>;
  }

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={styles.headerBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{courseTitle}</Text>
          <TouchableOpacity onPress={() => (opened.value ? closeDrawer() : openDrawer())} style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={styles.headerBtnText}>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Main content */}
          <View style={styles.main}>
            {lessonLoading ? (
              <ActivityIndicator style={{ marginTop: 24 }} />
            ) : currentLesson?.locked ? (
              <View style={styles.locked}>
                <Text style={styles.lockedTitle}>Урок закрыт</Text>
                <Text style={styles.lockedDesc}>{currentLesson.detail || 'Доступен после покупки.'}</Text>
              </View>
            ) : currentLesson ? (
              <ScrollView contentContainerStyle={styles.lessonContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
                {currentLesson.content_type === 'video' && currentLesson.content ? (
                  <View style={styles.videoWrap}>
                    <WebView
                      source={{ uri: getVideoUri(currentLesson.content) }}
                      style={styles.video}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      javaScriptEnabled
                      domStorageEnabled
                      originWhitelist={['*']}
                      mediaPlaybackRequiresUserAction={false}
                      onError={() => setVideoError(true)}
                    />
                  </View>
                ) : (
                  <Text style={styles.lessonText}>{stripHtml(currentLesson.content || '') || 'Нет контента.'}</Text>
                )}
                {videoError ? (
                  <Text style={styles.commentError}>
                    Не удалось встроить видео. Попробуйте открыть в браузере.
                  </Text>
                ) : null}

                {nextLessonId ? (
                  <View style={styles.footerRow}>
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNextLesson} activeOpacity={0.85}>
                      <Text style={styles.nextBtnText}>Следующий урок</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={styles.commentsBlock}>
                  <Text style={styles.commentsTitle}>Комментарии</Text>
                  {commentsLoading ? (
                    <ActivityIndicator style={{ marginVertical: 10 }} />
                  ) : commentsList.length === 0 ? (
                    <Text style={styles.muted}>Пока нет комментариев.</Text>
                  ) : (
                    <View style={styles.commentsList}>
                      {commentsList.map((c) => (
                        <View key={c.id} style={styles.commentItem}>
                          <Text style={styles.commentUser}>{c.username}</Text>
                          <Text style={styles.commentText}>{c.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {user ? (
                    <View style={styles.commentForm}>
                      <TextInput
                        value={commentText}
                        onChangeText={setCommentText}
                        placeholder="Написать комментарий…"
                        placeholderTextColor="#9ca3af"
                        style={styles.commentInput}
                        multiline
                      />
                      {commentError ? <Text style={styles.commentError}>{commentError}</Text> : null}
                      <TouchableOpacity style={styles.commentBtn} onPress={submitComment} activeOpacity={0.85}>
                        <Text style={styles.commentBtnText}>Отправить</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.muted}>Войдите, чтобы оставлять комментарии.</Text>
                  )}
                </View>
              </ScrollView>
            ) : (
              <Text style={{ color: '#6b7280', padding: 16 }}>Выберите урок в меню слева.</Text>
            )}
          </View>

          {/* Overlay for closing */}
          <Animated.View style={[styles.overlay, overlayStyle as any]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeDrawer} activeOpacity={1} />
          </Animated.View>

          {/* Sidebar */}
          <Animated.View style={[styles.sidebar, sidebarStyle]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ height: insets.top + HEADER_H }} />
              {curriculum.map((m) => (
                <View key={m.id} style={styles.module}>
                  <Text style={styles.moduleTitle}>{m.order}. {m.title}</Text>
                  {m.lessons.map((l) => {
                    const active = currentLessonId === l.id;
                    const done = isLessonCompleted(courseId, l.id);
                    return (
                      <TouchableOpacity
                        key={l.id}
                        style={[styles.lessonItem, active && styles.lessonItemActive, done && styles.lessonItemDone]}
                        onPress={() => selectLesson(l.id)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.lessonItemText, active && styles.lessonItemTextActive]} numberOfLines={2}>
                          {m.order}.{l.order} {l.title}
                        </Text>
                        {!l.is_free ? <Ionicons name="lock-closed" size={16} color="#6b7280" /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              <View style={styles.module}>
                <Text style={styles.moduleTitle}>4. ТЕСТ</Text>
                <TouchableOpacity
                  style={styles.lessonItem}
                  onPress={() => {
                    closeDrawer();
                    router.push(`/course/${courseId}/exam`);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.lessonItemText}>4. Тестирование</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerBtnText: { fontSize: 20, fontWeight: '700', color: '#111' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111', textAlign: 'center', paddingHorizontal: 8 },
  body: { flex: 1 },
  main: { flex: 1 },
  lessonContent: { padding: 16, paddingBottom: 32 },
  lessonTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 12 },
  lessonText: { fontSize: 15, lineHeight: 22, color: '#111' },
  videoWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', marginBottom: 12 },
  video: { flex: 1 },
  footerRow: { marginTop: 18 },
  nextBtn: { backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  locked: { padding: 16 },
  lockedTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  lockedDesc: { color: '#6b7280', fontSize: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_W,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    paddingVertical: 10,
  },
  module: { paddingBottom: 10 },
  moduleTitle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: 0.6,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  lessonItemActive: { backgroundColor: 'rgba(22, 163, 74, 0.10)', borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  lessonItemDone: { backgroundColor: '#ecfdf5', borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  lessonItemText: { flex: 1, color: '#111', fontSize: 14 },
  lessonItemTextActive: { fontWeight: '700' },
  muted: { color: '#6b7280', fontSize: 14 },
  commentsBlock: { marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  commentsTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 10 },
  commentsList: { gap: 10 },
  commentItem: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 },
  commentUser: { fontSize: 12, fontWeight: '800', color: '#111', marginBottom: 6 },
  commentText: { fontSize: 14, color: '#111', lineHeight: 20 },
  commentForm: { marginTop: 10 },
  commentInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#111',
  },
  commentBtn: { backgroundColor: '#0d0d0d', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  commentBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  commentError: { color: '#dc2626', marginTop: 8 },
});

