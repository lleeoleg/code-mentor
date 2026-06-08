import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, useWindowDimensions } from 'react-native';
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
  content_type: 'video' | 'text' | 'code';
  content: string;
  video_summary?: string;
  is_free: boolean;
  locked?: boolean;
  detail?: string;
};

const SIDEBAR_W = 290;
const HEADER_H = 52;

function stripHtml(s: string): string {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

type PythonLessonJson = {
  description?: string;
  starter_code?: string;
  hint?: string;
};

function parsePythonLesson(raw: string): PythonLessonJson | null {
  try {
    const v = JSON.parse(String(raw || ''));
    if (v && typeof v === 'object') return v as PythonLessonJson;
  } catch {
    /* не JSON — старый формат */
  }
  return null;
}

/** Встроенный редактор: задание + Skulpt (Python в браузерном движке WebView). */
function CodeLessonWebView({ jsonString }: { jsonString: string }) {
  const { height: winH } = useWindowDimensions();
  const parsed = useMemo(() => parsePythonLesson(jsonString), [jsonString]);
  const html = useMemo(() => {
    if (!parsed) return '';
    const desc = parsed.description ?? '';
    const starter = parsed.starter_code ?? '';
    const hint = parsed.hint ?? '';
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 12px; background: #f8fafc; color: #111; }
    #desc { font-size: 15px; line-height: 1.5; margin-bottom: 12px; }
    #desc code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
    #desc ol { padding-left: 1.25rem; margin: 8px 0; }
    #desc li { margin: 6px 0; }
    textarea#code {
      width: 100%; min-height: 200px; font-family: ui-monospace, Menlo, monospace; font-size: 14px;
      padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff;
    }
    .row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
    button {
      background: #0d0d0d; color: #fff; border: none; padding: 12px 18px; border-radius: 10px;
      font-size: 15px; font-weight: 700;
    }
    button.secondary { background: #e5e7eb; color: #111; }
    #hint {
      display: none; margin-top: 10px; padding: 10px; background: #fef9c3; border-radius: 10px; font-size: 14px; color: #713f12;
    }
    #hint.show { display: block; }
    #out {
      margin-top: 12px; white-space: pre-wrap; background: #111; color: #e5e5e5; padding: 12px; border-radius: 10px;
      min-height: 100px; font-size: 14px; font-family: ui-monospace, Menlo, monospace;
    }
  </style>
</head>
<body>
  <div id="desc"></div>
  <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
  <div class="row">
    <button type="button" onclick="runPy()">▶ Запустить</button>
    <button type="button" class="secondary" onclick="toggleHint()">Подсказка</button>
  </div>
  <div id="hint"></div>
  <div id="out"></div>
  <script>
    var HINT = ${JSON.stringify(hint)};
    document.getElementById('desc').innerHTML = ${JSON.stringify(desc)};
    document.getElementById('code').value = ${JSON.stringify(starter)};
    if (HINT) document.getElementById('hint').textContent = HINT;
    function toggleHint() {
      var h = document.getElementById('hint');
      if (!HINT) return;
      h.classList.toggle('show');
    }
    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: " + x;
      return Sk.builtinFiles["files"][x];
    }
    function runPy() {
      var out = document.getElementById('out');
      out.textContent = '';
      var prog = document.getElementById('code').value;
      Sk.configure({ output: function (t) { out.textContent += t; }, read: builtinRead });
      Sk.TurtleGraphics = { target: null };
      try {
        Sk.importMainWithBody("<stdin>", false, prog, true);
      } catch (e) {
        out.textContent += "\\n" + (e && e.toString ? e.toString() : String(e));
      }
    }
  </script>
</body>
</html>`;
  }, [parsed]);

  if (!parsed) {
    return (
      <Text style={styles.lessonText}>
        {stripHtml(jsonString) || 'Нет данных для редактора. Ожидается JSON (description, starter_code).'}
      </Text>
    );
  }

  const h = Math.min(Math.max(winH * 0.62, 420), 720);

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ width: '100%', height: h, backgroundColor: '#f8fafc' }}
      javaScriptEnabled
      domStorageEnabled
      automaticallyAdjustContentInsets={false}
    />
  );
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
                  <View>
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
                    {currentLesson.video_summary ? (
                      <View style={styles.videoSummary}>
                        <Text style={styles.videoSummaryTitle}>О чём этот урок</Text>
                        <Text style={styles.videoSummaryText}>{currentLesson.video_summary}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : currentLesson.content_type === 'code' && currentLesson.content ? (
                  <CodeLessonWebView jsonString={currentLesson.content} />
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
  videoWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  video: { flex: 1 },
  videoSummary: {
    marginTop: 14,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  videoSummaryTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  videoSummaryText: { fontSize: 15, lineHeight: 22, color: '#475569' },
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

