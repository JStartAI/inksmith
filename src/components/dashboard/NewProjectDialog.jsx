import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, Film, BookOpen } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const templates = [
  { value: 'blank', icon: FileText, labelKey: 'project.blank' },
  { value: 'novel', icon: BookOpen, labelKey: 'project.novel' },
  { value: 'screenplay', icon: Film, labelKey: 'project.screenplay' },
  { value: 'nonfiction', icon: Sparkles, labelKey: 'project.nonfiction' },
];

export default function NewProjectDialog({ open, onClose, onCreate }) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    title: '',
    description: '',
    language: lang,
    template: 'blank',
    target_word_count: null,
  });

  const handleCreate = () => {
    if (!form.title.trim()) return;
    onCreate({
      ...form,
      target_word_count: form.target_word_count ? Number(form.target_word_count) : null,
    });
    setForm({ title: '', description: '', language: lang, template: 'blank', target_word_count: null });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-[var(--ink-border)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('dashboard.newProject')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div>
            <Label className="text-xs font-medium text-[var(--ink-text-secondary)] uppercase tracking-wide">
              {t('project.title')}
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={lang === 'es' ? 'Mi gran novela...' : 'My great novel...'}
              className="mt-1.5 border-[var(--ink-border)] focus:border-[var(--ink-accent)]"
              autoFocus
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-[var(--ink-text-secondary)] uppercase tracking-wide">
              {t('project.description')}
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={lang === 'es' ? 'Breve descripción...' : 'Brief description...'}
              className="mt-1.5 border-[var(--ink-border)] focus:border-[var(--ink-accent)] resize-none h-20"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-[var(--ink-text-secondary)] uppercase tracking-wide mb-2 block">
              {t('project.template')}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => setForm({ ...form, template: tmpl.value })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    form.template === tmpl.value
                      ? 'border-[var(--ink-accent)] bg-[var(--ink-accent-light)] text-[var(--ink-accent)]'
                      : 'border-[var(--ink-border)] hover:border-[var(--ink-text-muted)] text-[var(--ink-text-secondary)]'
                  }`}
                >
                  <tmpl.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t(tmpl.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-[var(--ink-text-secondary)] uppercase tracking-wide">
                {t('project.language')}
              </Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger className="mt-1.5 border-[var(--ink-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[var(--ink-text-secondary)] uppercase tracking-wide">
                {lang === 'es' ? 'Meta de palabras' : 'Word goal'}
              </Label>
              <Input
                type="number"
                value={form.target_word_count || ''}
                onChange={(e) => setForm({ ...form, target_word_count: e.target.value })}
                placeholder="80,000"
                className="mt-1.5 border-[var(--ink-border)]"
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!form.title.trim()}
            className="w-full bg-[var(--ink-accent)] hover:bg-[var(--ink-accent-hover)] text-white rounded-xl h-11"
          >
            {t('project.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}