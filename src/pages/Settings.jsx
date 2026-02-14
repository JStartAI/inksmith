import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ArrowLeft, Globe, Type } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/i18n/LanguageContext';

export default function Settings() {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--ink-bg)]">
      <header className="border-b border-[var(--ink-border)] bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowLeft className="w-3 h-3" />
              {t('common.back')}
            </Button>
          </Link>
          <span className="text-sm font-semibold">{t('settings.title')}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <Card className="border-[var(--ink-border)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-48 border-[var(--ink-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-[var(--ink-border)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Type className="w-4 h-4" />
              {t('settings.editorFont')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => localStorage.setItem('inksmith_font', 'sans')}
                className="p-4 rounded-xl border border-[var(--ink-border)] hover:border-[var(--ink-accent)] text-left transition-all"
              >
                <p className="font-sans text-sm font-medium">{t('settings.sansSerif')}</p>
                <p className="font-sans text-xs text-[var(--ink-text-muted)] mt-1">
                  The quick brown fox jumps over the lazy dog
                </p>
              </button>
              <button
                onClick={() => localStorage.setItem('inksmith_font', 'serif')}
                className="p-4 rounded-xl border border-[var(--ink-border)] hover:border-[var(--ink-accent)] text-left transition-all"
              >
                <p className="font-serif text-sm font-medium">{t('settings.serif')}</p>
                <p className="font-serif text-xs text-[var(--ink-text-muted)] mt-1">
                  The quick brown fox jumps over the lazy dog
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}