import { useCallback, useEffect, useMemo, useState } from 'react';
import { exams } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useExamIntegrity } from '../hooks/useExamIntegrity';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CourseFinalExam({ courseId }) {
  const { locale, t } = useLanguage();
  const cid = useMemo(() => String(courseId || ''), [courseId]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());

  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [integrityViolation, setIntegrityViolation] = useState(false);

  const examInProgress = !!attemptId && !review && !submitting;

  const handleIntegrityViolation = useCallback(() => {
    setSelected({});
    setIntegrityViolation(true);
    setError(t('courseLearn.exam.integrityReset'));
  }, [t]);

  useExamIntegrity({ enabled: examInProgress, onViolation: handleIntegrityViolation });

  useEffect(() => {
    if (!examInProgress) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = t('courseLearn.exam.leaveWarning');
      return e.returnValue;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [examInProgress, t]);

  const refreshInfo = () =>
    exams
      .info(cid, { lang: locale })
      .then((data) => {
        setInfo(data);
        // Если пользователь уже проходил тест — показываем сохранённый результат.
        // (на сервере хранится last_attempt + has_certificate)
        if (!attemptId && !result && data?.has_exam && data?.last_attempt) {
          setResult({
            status: data.last_attempt.status,
            score_percent: data.last_attempt.score_percent,
            pass_percent: data.exam?.pass_percent ?? 80,
          });
        }
        return data;
      })
      .catch(() => setInfo({ has_exam: false }));

  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    refreshInfo()
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const canStart =
    info?.has_exam &&
    info?.attempts_left_24h > 0 &&
    !attemptId &&
    true;

  const showCertificateButton =
    info?.has_certificate ||
    (result?.status === 'passed');

  const start = async () => {
    setError(null);
    setStarting(true);
    try {
      const data = await exams.start(cid, { lang: locale });
      setAttemptId(data.attempt.id);
      setQuestions(data.questions || []);
      setSelected({});
      setResult(null);
      setReview(null);
      setIntegrityViolation(false);
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const detail =
        data?.detail ||
        (typeof data === 'string' ? data : '') ||
        (locale === 'ru' ? 'Не удалось начать тест.' : 'Could not start the test.');
      const extra = status ? ` (HTTP ${status})` : '';
      const payload = data && typeof data === 'object' && !data.detail ? `\n${JSON.stringify(data)}` : '';
      setError(detail + extra + payload);
    } finally {
      setStarting(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!attemptId) return;
    const answers = (questions || []).map((q) => ({
      question_id: q.id,
      choice_id: selected[q.id],
    }));
    if (answers.some((a) => !a.choice_id)) {
      setError(locale === 'ru' ? 'Ответьте на все 10 вопросов перед отправкой.' : 'Please answer all 10 questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await exams.submit(attemptId, { answers });
      setResult(data.attempt);
      setReview(Array.isArray(data.review) ? data.review : null);
      await refreshInfo();
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const detail =
        data?.detail ||
        (typeof data === 'string' ? data : '') ||
        (locale === 'ru' ? 'Не удалось отправить ответы.' : 'Could not submit answers.');
      const extra = status ? ` (HTTP ${status})` : '';
      const payload = data && typeof data === 'object' && !data.detail ? `\n${JSON.stringify(data)}` : '';
      setError(detail + extra + payload);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = async () => {
    setError(null);
    try {
      const blob = await exams.certificatePdf(cid);
      downloadBlob(blob, `certificate_course_${cid}.pdf`);
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const detail =
        data?.detail ||
        (typeof data === 'string' ? data : '') ||
        (locale === 'ru' ? 'Не удалось скачать сертификат.' : 'Could not download certificate.');
      const extra = status ? ` (HTTP ${status})` : '';
      const payload = data && typeof data === 'object' && !data.detail ? `\n${JSON.stringify(data)}` : '';
      setError(detail + extra + payload);
    }
  };

  if (loading) return <div className="exam loading">{locale === 'ru' ? 'Загрузка теста…' : 'Loading exam…'}</div>;
  if (!info?.has_exam) return <div className="exam empty">{locale === 'ru' ? 'Для этого курса тест пока не настроен.' : 'Test is not configured for this course yet.'}</div>;

  const resetAtMs = info?.attempts_reset_at ? new Date(info.attempts_reset_at).getTime() : null;
  const remainingMs = resetAtMs ? Math.max(0, resetAtMs - now) : 0;
  const remaining = resetAtMs
    ? {
        h: Math.floor(remainingMs / 3600000),
        m: Math.floor((remainingMs % 3600000) / 60000),
        s: Math.floor((remainingMs % 60000) / 1000),
      }
    : null;

  const reviewByQuestionId = new Map((review || []).map((r) => [r.question_id, r]));

  return (
    <div className="exam">
      <div className="exam-head">
        <h2 className="exam-title">{locale === 'ru' ? 'Финальный тест' : 'Final Exam'}</h2>
        <div className="exam-meta">
          <span className="exam-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {locale === 'ru' ? 'Попыток осталось: ' : 'Attempts left: '}
            <strong>{info.attempts_left_24h}</strong>
            {resetAtMs && info.attempts_left_24h === 0 && remaining ? (
              <span style={{ color: '#ef4444' }}>
                {' ('}
                {String(remaining.h).padStart(2, '0')}:{String(remaining.m).padStart(2, '0')}:{String(remaining.s).padStart(2, '0')}
                {')'}
              </span>
            ) : null}
          </span>
          <span className="exam-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
            {locale === 'ru' ? 'Порог сдачи: ' : 'Pass threshold: '}
            <strong>{info.exam.pass_percent}%</strong>
          </span>
        </div>
      </div>

      {showCertificateButton && (
        <div className="exam-banner ok">
          <div className="exam-banner-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            {locale === 'ru' ? 'Тест сдан!' : 'Passed!'}
          </div>
          <button type="button" className="exam-cert-btn" onClick={downloadCertificate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {locale === 'ru' ? 'Скачать сертификат (PDF)' : 'Download certificate (PDF)'}
          </button>
        </div>
      )}

      {result && (
        <div className={`exam-banner ${result.status === 'passed' ? 'ok' : 'bad'}`}>
          <div className="exam-banner-title">
            {result.status === 'passed'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            {locale === 'ru' ? 'Последняя попытка' : 'Last attempt'}
          </div>
          <div className="exam-banner-text">
            {locale === 'ru' ? 'Результат: ' : 'Score: '}
            <strong>{result.score_percent}%</strong>
            {locale === 'ru' ? ' / порог: ' : ' / pass: '}{result.pass_percent}%
            {typeof result.correct_answers === 'number' && (
              <> • {locale === 'ru' ? 'Верно: ' : 'Correct: '}<strong>{result.correct_answers}/{result.total_questions}</strong></>
            )}
          </div>
        </div>
      )}

      {examInProgress && (
        <div className="exam-integrity-banner">
          <div className="exam-integrity-banner-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {t('courseLearn.exam.integrityTitle')}
          </div>
          <p className="exam-integrity-banner-text">{t('courseLearn.exam.integrityPolicy')}</p>
        </div>
      )}

      {error && (
        <div className={`exam-error${integrityViolation ? ' exam-error--integrity' : ''}`}>
          {error}
        </div>
      )}

      {!attemptId ? (
        <div className="exam-start">
          <div className="exam-start-text">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            {locale === 'ru' ? '10 вопросов · 1 правильный ответ' : '10 questions · 1 correct answer'}
          </div>
          <button type="button" className="exam-start-btn" onClick={start} disabled={!canStart || starting}>
            {starting ? (
              locale === 'ru' ? 'Запуск…' : 'Starting…'
            ) : info.attempts_left_24h > 0 ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {locale === 'ru' ? 'Начать тест' : 'Start test'}
              </>
            ) : (
              locale === 'ru' ? 'Лимит исчерпан' : 'Limit reached'
            )}
          </button>
        </div>
      ) : (
        <div className="exam-questions">
          {questions.map((q, idx) => {
            const r = reviewByQuestionId.get(q.id);
            const qClass = r ? `exam-q ${r.is_correct ? 'correct' : 'wrong'}` : 'exam-q';
            return (
              <div key={q.id} className={qClass}>
                <div className="exam-q-title">{idx + 1}. {q.text}</div>
                <div className="exam-choices">
                  {q.choices.map((c) => {
                    const active = selected[q.id] === c.id;
                    const isCorrectChoice = r && r.correct_choice_id === c.id;
                    const isSelectedWrong = r && r.selected_choice_id === c.id && !r.is_correct;
                    const isSelectedCorrect = r && r.selected_choice_id === c.id && r.is_correct;
                    const locked = !!r;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={['exam-choice', active ? 'active' : '', isCorrectChoice ? 'correct' : '', isSelectedWrong ? 'wrong' : '', isSelectedCorrect ? 'correct' : ''].filter(Boolean).join(' ')}
                        onClick={() => {
                          if (locked) return;
                          setIntegrityViolation(false);
                          setError(null);
                          setSelected((p) => ({ ...p, [q.id]: c.id }));
                        }}
                        disabled={locked}
                      >
                        {c.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button type="button" className="exam-submit-btn" onClick={submit} disabled={submitting || !!review}>
            {submitting ? (locale === 'ru' ? 'Отправка…' : 'Submitting…') : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                {locale === 'ru' ? 'Отправить ответы' : 'Submit answers'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

