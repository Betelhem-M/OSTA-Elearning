import { Globe2 } from 'lucide-react';
import { useLanguage } from '@context/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <label
        className="relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
        aria-label="Language preference"
        title="Language preference"
      >
        <div className="rounded-full p-1 text-ink-faint">
          <Globe2 size={22} />
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Language preference"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
          <option value="om">Afaan Oromo</option>
        </select>
      </label>
    );
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <Globe2 size={15} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Language preference"
        className="bg-transparent outline-none"
      >
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
        <option value="om">Afaan Oromo</option>
      </select>
    </label>
  );
}
