import { useEffect, useRef } from 'react';

/**
 * Следит за уходом со страницы теста (другая вкладка, свёрнутое окно, потеря фокуса).
 * Вызывает onViolation после короткой «армировки», чтобы не срабатывать при старте.
 */
export function useExamIntegrity({ enabled, onViolation }) {
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  useEffect(() => {
    if (!enabled) return undefined;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 800);

    const trigger = (reason) => {
      if (!armed) return;
      armed = false;
      onViolationRef.current?.(reason);
      window.setTimeout(() => {
        armed = true;
      }, 1200);
    };

    const handleVisibility = () => {
      if (document.hidden) trigger('visibility');
    };

    const handleBlur = () => {
      window.requestAnimationFrame(() => {
        if (document.hidden || !document.hasFocus()) {
          trigger('blur');
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled]);
}
