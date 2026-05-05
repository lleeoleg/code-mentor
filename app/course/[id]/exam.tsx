import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { exams } from '@/lib/api';
import { API_BASE } from '@/lib/config';

type ExamInfoResponse =
  | { has_exam: false }
  | {
      has_exam: true;
      exam: { id: number; pass_percent: number; questions_count: number };
      attempts_left_24h: number;
      has_certificate: boolean;
    };

type Question = {
  id: number;
  text: string;
  order: number;
  choices: { id: number; text: string }[];
};

export default function CourseExamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const courseId = useMemo(() => id || '', [id]);

  const [info, setInfo] = useState<ExamInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; score_percent: number; pass_percent: number } | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    exams
      .info(courseId)
      .then(setInfo)
      .catch(() => setInfo({ has_exam: false }))
      .finally(() => setLoading(false));
  }, [courseId]);

  const canStart =
    info && info.has_exam && info.attempts_left_24h > 0 && !attemptId && !result;

  const start = async () => {
    if (!courseId) return;
    setStarting(true);
    try {
      const data = await exams.start(courseId);
      setAttemptId(data.attempt.id);
      setQuestions(data.questions || []);
      setSelected({});
      setResult(null);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.detail || 'Не удалось начать тест');
    } finally {
      setStarting(false);
    }
  };

  const submit = async () => {
    if (!attemptId) return;
    const answers = questions
      .map((q) => ({ question_id: q.id, choice_id: selected[q.id] }))
      .filter((a) => !!a.choice_id) as { question_id: number; choice_id: number }[];

    if (answers.length !== questions.length) {
      Alert.alert('Заполните тест', 'Ответьте на все 10 вопросов перед отправкой.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await exams.submit(attemptId, { answers });
      setResult({
        status: data.attempt.status,
        score_percent: data.attempt.score_percent,
        pass_percent: data.attempt.pass_percent,
      });
      // Обновим info, чтобы подтянуть certificate flag/attempts left
      const newInfo = await exams.info(courseId);
      setInfo(newInfo);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.detail || 'Не удалось отправить ответы');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = async () => {
    if (!courseId) return;
    try {
      const token = await AsyncStorage.getItem('access');
      if (!token) {
        Alert.alert('Ошибка', 'Нужно войти в аккаунт, чтобы скачать сертификат.');
        return;
      }

      const from = `${API_BASE.replace(/\/$/, '')}/courses/${courseId}/certificate/pdf/`;
      const to = `${FileSystem.cacheDirectory}certificate_${courseId}.pdf`;
      const res = await FileSystem.downloadAsync(from, to, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 200) {
        Alert.alert('Ошибка', `Не удалось скачать сертификат. HTTP ${res.status}`);
        return;
      }

      const uri = res.uri;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('Готово', `PDF сохранён: ${uri}`);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail;
      const msg = detail || e?.message || 'Не удалось скачать сертификат';
      Alert.alert('Ошибка', status ? `${msg} (HTTP ${status})` : msg);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 48 }} />;

  if (!info || !info.has_exam) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Final exam</Text>
        <Text style={styles.muted}>Для этого курса тест пока не настроен.</Text>
        <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}>
          <Text style={styles.btnOutlineText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Final exam</Text>
        <Text style={styles.muted}>Attempts left (24h): {info.attempts_left_24h}</Text>
      </View>

      {info.has_certificate ? (
        <View style={styles.bannerOk}>
          <Text style={styles.bannerTitle}>Passed</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={downloadCertificate} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Download certificate (PDF)</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {result ? (
        <View style={result.status === 'passed' ? styles.bannerOk : styles.bannerBad}>
          <Text style={styles.bannerTitle}>
            {result.status === 'passed' ? 'Test passed' : 'Test failed'}
          </Text>
          <Text style={styles.bannerText}>
            Score: {result.score_percent}% (pass: {result.pass_percent}%)
          </Text>
        </View>
      ) : null}

      {!attemptId ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>10 questions • 1 correct answer</Text>
          <Text style={styles.muted}>Pass score: {info.exam.pass_percent}%</Text>
          <TouchableOpacity
            style={[styles.btnPrimary, !canStart && styles.btnDisabled]}
            onPress={start}
            disabled={!canStart || starting}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>
              {starting ? 'Starting…' : info.attempts_left_24h > 0 ? 'Start test' : 'Limit reached'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.block}>
          {questions.map((q, idx) => (
            <View key={q.id} style={styles.qBlock}>
              <Text style={styles.qTitle}>{idx + 1}. {q.text}</Text>
              {q.choices.map((c) => {
                const active = selected[q.id] === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.choice, active && styles.choiceActive]}
                    onPress={() => setSelected((p) => ({ ...p, [q.id]: c.id }))}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{c.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btnPrimary, submitting && styles.btnDisabled]}
            onPress={submit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>{submitting ? 'Submitting…' : 'Submit answers'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', gap: 12, paddingHorizontal: 24 },
  header: { paddingVertical: 16, gap: 6 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 8 },
  backText: { color: '#3f8cff', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#0d0d0d' },
  muted: { color: '#6b7280', fontSize: 14 },
  block: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 12,
  },
  blockTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  qBlock: { marginTop: 10 },
  qTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 8 },
  choice: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  choiceActive: { backgroundColor: '#0d0d0d', borderColor: '#0d0d0d' },
  choiceText: { color: '#111', fontSize: 14 },
  choiceTextActive: { color: '#fff' },
  btnPrimary: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnOutline: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnOutlineText: { color: '#0d0d0d', fontSize: 16, fontWeight: '700' },
  bannerOk: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  bannerBad: {
    backgroundColor: '#fef2f2',
    borderColor: '#f87171',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#111' },
  bannerText: { fontSize: 14, color: '#374151' },
});

