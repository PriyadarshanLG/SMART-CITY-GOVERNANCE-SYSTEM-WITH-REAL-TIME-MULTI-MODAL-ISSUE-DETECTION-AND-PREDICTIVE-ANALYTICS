import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'dark' | 'light';
}

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useLanguage();
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl p-1 shrink-0 border transition-all shadow-sm ${
        isDark
          ? 'bg-slate-900/90 border-white/20 text-white'
          : 'bg-white border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white'
      }`}
      role="group"
      aria-label={t('lang.switch')}
      title="Switch Portal Language / ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಿ"
    >
      <div className={`flex items-center justify-center px-1.5 ${isDark ? 'text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
        <Languages className="h-4 w-4" />
      </div>

      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
          lang === 'en'
            ? 'bg-blue-600 text-white shadow-sm font-extrabold'
            : isDark
            ? 'text-slate-300 hover:text-white hover:bg-white/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('kn')}
        className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
          lang === 'kn'
            ? 'bg-orange-500 text-white shadow-sm font-extrabold'
            : isDark
            ? 'text-slate-300 hover:text-white hover:bg-white/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}
