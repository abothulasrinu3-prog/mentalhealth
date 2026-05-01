import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ className = '', compact = false }) => {
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 ${className}`}
    >
      <Languages className="h-4 w-4 text-primary-500" />
      {!compact && <span className="hidden sm:inline">{t('common.language')}</span>}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="bg-transparent pr-1 outline-none"
        aria-label={t('common.language')}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code} className="text-gray-900">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;
