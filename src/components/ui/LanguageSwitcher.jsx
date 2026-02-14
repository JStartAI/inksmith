import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Button } from './button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-[var(--ink-surface)] rounded-lg p-0.5 border border-[var(--ink-border)]">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLang('es')}
        className={`h-7 px-2.5 text-xs transition-all ${
          lang === 'es'
            ? 'bg-[var(--ink-accent)] text-white hover:bg-[var(--ink-accent-hover)] hover:text-white'
            : 'text-[var(--ink-text-muted)] hover:text-[var(--ink-text-secondary)]'
        }`}
      >
        ES
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLang('en')}
        className={`h-7 px-2.5 text-xs transition-all ${
          lang === 'en'
            ? 'bg-[var(--ink-accent)] text-white hover:bg-[var(--ink-accent-hover)] hover:text-white'
            : 'text-[var(--ink-text-muted)] hover:text-[var(--ink-text-secondary)]'
        }`}
      >
        EN
      </Button>
    </div>
  );
}