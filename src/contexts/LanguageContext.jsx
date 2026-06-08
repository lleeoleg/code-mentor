import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translate } from '../translations';

const STORAGE_KEY = 'codementor_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'ru';
    } catch {
      return 'ru';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale === 'en' ? 'en' : 'ru';
    } catch (e) {
      // ignore
    }
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      return value === 'en' ? 'en' : 'ru';
    });
  }, []);

  const t = useCallback(
    (key, params) => translate(locale, key, params),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
