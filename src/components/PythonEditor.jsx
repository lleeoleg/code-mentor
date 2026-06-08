import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './PythonEditor.css';

export default function PythonEditor({ lessonData }) {
  const { t } = useLanguage();
  const parsed = (() => {
    try { return JSON.parse(lessonData); } catch { return null; }
  })();

  const [code, setCode] = useState(parsed?.starter_code?.replace(/\\n/g, '\n') || '');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ok | error
  const [showHint, setShowHint] = useState(false);
  const pyodideRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setStatus('loading');

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
          stdout: (msg) => setOutput((p) => p + msg + '\n'),
          stderr: (msg) => setOutput((p) => p + msg + '\n'),
        });
        pyodideRef.current = pyodide;
        setStatus('idle');
      } catch {
        setStatus('error');
      }
    };
    document.head.appendChild(script);
  }, []);

  const prepareCode = (src) => {
    // Pyodide already runs inside the browser's event loop.
    // asyncio.run() raises RuntimeError in that context.
    // Walk the source and replace each asyncio.run(<balanced-expr>) with await <expr>.
    let result = '';
    let i = 0;
    const marker = 'asyncio.run(';
    while (i < src.length) {
      const idx = src.indexOf(marker, i);
      if (idx === -1) { result += src.slice(i); break; }
      result += src.slice(i, idx) + 'await ';
      // skip past 'asyncio.run('
      let j = idx + marker.length;
      let depth = 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '(') depth++;
        else if (src[j] === ')') depth--;
        if (depth > 0) result += src[j];
        j++;
      }
      i = j;
    }
    return result;
  };

  const run = async () => {
    if (!pyodideRef.current) return;
    setOutput('');
    setStatus('running');
    try {
      await pyodideRef.current.runPythonAsync(prepareCode(code));
      setStatus('ok');
    } catch (err) {
      let msg = String(err);
      // Filter out Pyodide internal noise for known async issues
      if (msg.includes('cannot be called from a running event loop')) {
        msg = t('pyEditor.asyncioError');
      }
      setOutput((p) => p + msg);
      setStatus('error');
    }
  };

  const reset = () => {
    setCode(parsed?.starter_code?.replace(/\\n/g, '\n') || '');
    setOutput('');
    setStatus(pyodideRef.current ? 'idle' : 'loading');
  };

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.substring(0, start) + '    ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  };

  if (!parsed) {
    return (
      <div className="py-editor">
        <p className="py-editor-desc">
          {t('pyEditor.loadError')}
        </p>
        <pre className="py-editor-output" style={{ whiteSpace: 'pre-wrap' }}>{String(lessonData || '').slice(0, 2000)}</pre>
      </div>
    );
  }

  return (
    <div className="py-editor">
      {parsed.description && (
        <div
          className="py-editor-desc"
          dangerouslySetInnerHTML={{ __html: parsed.description }}
        />
      )}

      <div className="py-editor-shell">
        <div className="py-editor-toolbar">
          <span className="py-editor-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            Python
          </span>
          <div className="py-editor-actions">
            {parsed.hint && (
              <button
                type="button"
                className="py-editor-btn py-editor-btn--hint"
                onClick={() => setShowHint((v) => !v)}
                title={t('pyEditor.hint')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                </svg>
                {t('pyEditor.hint')}
              </button>
            )}
            <button
              type="button"
              className="py-editor-btn py-editor-btn--reset"
              onClick={reset}
              title={t('pyEditor.reset')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              {t('pyEditor.reset')}
            </button>
            <button
              type="button"
              className="py-editor-btn py-editor-btn--run"
              onClick={run}
              disabled={status === 'loading' || status === 'running'}
              title="Ctrl+Enter"
            >
              {status === 'loading' ? (
                <span className="py-editor-spinner" />
              ) : status === 'running' ? (
                <span className="py-editor-spinner" />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
              {status === 'loading' ? t('pyEditor.loading') : status === 'running' ? t('pyEditor.running') : t('pyEditor.run')}
            </button>
          </div>
        </div>

        {showHint && parsed.hint && (
          <div className="py-editor-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
            </svg>
            {parsed.hint}
          </div>
        )}

        <textarea
          className="py-editor-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKey}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          rows={Math.max(8, code.split('\n').length + 1)}
        />

        <div className="py-editor-output-wrap">
          <div className="py-editor-output-label">
            {t('pyEditor.output')}
            {status === 'ok' && <span className="py-editor-badge py-editor-badge--ok">{t('pyEditor.done')}</span>}
            {status === 'error' && <span className="py-editor-badge py-editor-badge--err">{t('pyEditor.error')}</span>}
          </div>
          <pre className={`py-editor-output ${status === 'error' ? 'py-editor-output--err' : ''}`}>
            {output || <span className="py-editor-placeholder">{t('pyEditor.outputPlaceholder')}</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
