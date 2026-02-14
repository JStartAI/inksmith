import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Plus, X, Loader2, ImageIcon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function CharacterWizard({ open, onClose, onCreate, projectLang }) {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: 'supporting',
    age: '',
    appearance: '',
    personality_sources: [],
    backstory: '',
    core_motivation: '',
    fears: '',
    speech_patterns: '',
    relationships: '',
    arc: '',
    custom_notes: '',
    image_url: '',
    profile_generated: false,
  });
  const [newSource, setNewSource] = useState({ type: 'text', content: '' });

  const addSource = () => {
    if (!newSource.content.trim()) return;
    setForm({
      ...form,
      personality_sources: [...form.personality_sources, { ...newSource }],
    });
    setNewSource({ type: 'text', content: '' });
  };

  const removeSource = (idx) => {
    setForm({
      ...form,
      personality_sources: form.personality_sources.filter((_, i) => i !== idx),
    });
  };

  const generateProfile = async () => {
    setGenerating(true);
    const sourcesText = form.personality_sources.map((s, i) =>
      `Source ${i + 1} (${s.type}): ${s.content.slice(0, 1000)}`
    ).join('\n\n');

    const useLang = projectLang || lang;
    const prompt = useLang === 'es'
      ? `Eres un psicólogo narrativo. Crea un perfil para "${form.name}" (${form.role}, ${form.age || 'edad desconocida'}). Apariencia: ${form.appearance || 'no especificada'}. Fuentes: ${sourcesText || 'ninguna'}. Responde SOLO JSON: {"backstory":"500 palabras","core_motivation":"","fears":"","speech_patterns":"","relationships":"","arc":""}`
      : `You are a narrative psychologist. Create a profile for "${form.name}" (${form.role}, ${form.age || 'unknown age'}). Appearance: ${form.appearance || 'unspecified'}. Sources: ${sourcesText || 'none'}. Respond ONLY JSON: {"backstory":"500 words","core_motivation":"","fears":"","speech_patterns":"","relationships":"","arc":""}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          backstory: { type: 'string' },
          core_motivation: { type: 'string' },
          fears: { type: 'string' },
          speech_patterns: { type: 'string' },
          relationships: { type: 'string' },
          arc: { type: 'string' },
        },
      },
    });

    setForm({
      ...form,
      ...result,
      profile_generated: true,
    });
    setGenerating(false);
    setStep(3);
  };

  const generatePortrait = async () => {
    setGeneratingImage(true);
    const prompt = `Cinematic character portrait, professional studio lighting, 1:1 ratio, photorealistic style. Character: ${form.name}, ${form.role}, ${form.age || ''} years old. Appearance: ${form.appearance || 'undefined'}. Personality: ${form.core_motivation || ''}. High-end editorial photography style.`;
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    setForm({ ...form, image_url: result.url });
    setGeneratingImage(false);
  };

  const handleCreate = () => {
    onCreate(form);
    setForm({
      name: '', role: 'supporting', age: '', appearance: '',
      personality_sources: [], backstory: '', core_motivation: '',
      fears: '', speech_patterns: '', relationships: '', arc: '',
      custom_notes: '', image_url: '', profile_generated: false,
    });
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-[var(--ink-border)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('characters.forge')}
          </DialogTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-[var(--ink-accent)]' : 'bg-[var(--ink-border)]'}`} />
            ))}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-[var(--ink-text-muted)]">{t('characters.name')}</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" autoFocus />
              </div>
              <div>
                <Label className="text-xs text-[var(--ink-text-muted)]">{t('characters.role')}</Label>
                <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['protagonist', 'antagonist', 'supporting', 'minor', 'mentor', 'love_interest'].map(r => (
                      <SelectItem key={r} value={r}>{t(`characters.${r}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-[var(--ink-text-muted)]">{t('characters.age')}</Label>
                <Input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[var(--ink-text-muted)]">{t('characters.appearance')}</Label>
                <Input value={form.appearance} onChange={e => setForm({ ...form, appearance: e.target.value })} className="mt-1" />
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!form.name.trim()} className="w-full bg-[var(--ink-accent)] text-white rounded-xl h-10">
              {lang === 'es' ? 'Siguiente' : 'Next'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[var(--ink-text-secondary)]">
              {lang === 'es'
                ? 'Agrega fuentes de personalidad para que la IA genere un perfil más profundo (opcional).'
                : 'Add personality sources so AI can generate a deeper profile (optional).'}
            </p>
            <div className="flex gap-2">
              <Select value={newSource.type} onValueChange={v => setNewSource({ ...newSource, type: v })}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newSource.content}
                onChange={e => setNewSource({ ...newSource, content: e.target.value })}
                placeholder={newSource.type === 'youtube' ? 'YouTube URL...' : 'Describe personality...'}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addSource} disabled={!newSource.content.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.personality_sources.map((src, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-[var(--ink-bg)] border border-[var(--ink-border-subtle)]">
                <span className="font-medium text-[var(--ink-text-secondary)]">{src.type}</span>
                <span className="flex-1 truncate text-[var(--ink-text-muted)]">{src.content}</span>
                <button onClick={() => removeSource(i)}><X className="w-3 h-3" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t('common.back')}</Button>
              <Button onClick={generateProfile} disabled={generating} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {t('characters.generateProfile')}
              </Button>
            </div>
            <button onClick={() => setStep(3)} className="text-xs text-[var(--ink-text-muted)] underline w-full text-center">
              {lang === 'es' ? 'Saltar y crear manualmente' : 'Skip & create manually'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 pt-2">
            {/* Portrait section */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--ink-warm)] flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[var(--ink-text-muted)] opacity-30" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePortrait}
                disabled={generatingImage}
                className="text-xs"
              >
                {generatingImage ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <ImageIcon className="w-3 h-3 mr-1.5" />}
                {t('characters.generatePortrait')}
              </Button>
            </div>

            {[
              { key: 'backstory', label: t('characters.backstory'), rows: 3 },
              { key: 'core_motivation', label: t('characters.motivation'), rows: 2 },
              { key: 'fears', label: t('characters.fears'), rows: 2 },
              { key: 'speech_patterns', label: t('characters.speech'), rows: 2 },
              { key: 'relationships', label: t('characters.relationships'), rows: 2 },
              { key: 'arc', label: t('characters.arc'), rows: 2 },
            ].map(({ key, label, rows }) => (
              <div key={key}>
                <Label className="text-xs text-[var(--ink-text-muted)]">{label}</Label>
                <Textarea
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 text-sm resize-none"
                  rows={rows}
                />
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">{t('common.back')}</Button>
              <Button onClick={handleCreate} disabled={!form.name.trim()} className="flex-1 bg-[var(--ink-accent)] text-white rounded-xl">
                {t('common.create')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}