import React from 'react';
import { PenLine, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../i18n/LanguageContext';

export default function EmptyDashboard({ onNewProject }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 animate-fadeIn">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <PenLine className="w-10 h-10 text-blue-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-[var(--ink-text)] mb-2 text-center">
        {t('dashboard.emptyTitle')}
      </h2>
      <p className="text-[var(--ink-text-muted)] text-center max-w-sm mb-8 leading-relaxed">
        {t('dashboard.emptyDesc')}
      </p>
      <Button
        onClick={onNewProject}
        className="bg-[var(--ink-accent)] hover:bg-[var(--ink-accent-hover)] text-white rounded-xl px-6 h-11 shadow-lg shadow-blue-500/20"
      >
        <PenLine className="w-4 h-4 mr-2" />
        {t('dashboard.newProject')}
      </Button>
    </div>
  );
}