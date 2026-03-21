import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Globe, Type, Sun, Moon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/i18n/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import GoogleDriveConnector from '../components/backup/GoogleDriveConnector';

function Section({ title, children }) {
  return (
    <div className="py-6" style={{ borderBottom: '1px solid var(--border)' }}>
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const { t, lang, setLang } = useLanguage();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Dashboard')}>
            <button className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('common.back')}
            </button>
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('settings.title')}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">

        <Section title="Apariencia">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Tema</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {dark ? 'Modo oscuro — negro mate' : 'Modo claro — blanco'}
              </p>
            </div>
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded border transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              {dark ? <><Sun className="w-4 h-4" /> Modo claro</> : <><Moon className="w-4 h-4" /> Modo oscuro</>}
            </button>
          </div>
        </Section>

        <Section title={t('settings.language')}>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-48" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="es">🇪🇸 Español</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        <Section title={t('settings.editorFont')}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'serif', label: 'Serif', sample: 'El zorro marrón salta', family: 'Lora, Georgia, serif' },
              { key: 'sans', label: 'Sin serif', sample: 'El zorro marrón salta', family: 'system-ui, sans-serif' },
            ].map(({ key, label, sample, family }) => {
              const active = (localStorage.getItem('inksmith_font') || 'serif') === key;
              return (
                <button
                  key={key}
                  onClick={() => localStorage.setItem('inksmith_font', key)}
                  className="p-4 rounded text-left transition-colors"
                  style={{
                    border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
                    background: active ? 'var(--bg-subtle)' : 'var(--surface)',
                  }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)', fontFamily: family }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: family }}>{sample}</p>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Copia de seguridad">
          <GoogleDriveConnector />
        </Section>
      </main>
    </div>
  );
}