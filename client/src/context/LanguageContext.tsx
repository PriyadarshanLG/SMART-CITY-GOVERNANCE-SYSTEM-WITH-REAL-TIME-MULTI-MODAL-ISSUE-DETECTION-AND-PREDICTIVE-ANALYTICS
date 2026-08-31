import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations, type AppLang, type TranslationKey } from '../i18n/translations';

type Vars = Record<string, string | number>;

interface LanguageContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'janseva_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLang>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'kn' ? 'kn' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'kn' ? 'kn' : 'en';
    document.documentElement.classList.toggle('lang-kn', lang === 'kn');
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => {
    const setLang = (next: AppLang) => setLangState(next);
    const t = (key: TranslationKey, vars?: Vars) => {
      let text: string = (translations[lang][key] || translations.en[key] || key) as string;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
