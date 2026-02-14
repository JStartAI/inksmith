import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ImageIcon, Save, Trash2, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { base44 } from '@/api/base44Client';

const roleColors = {
  protagonist: 'bg-blue-100 text-blue-700',
  antagonist: 'bg-red-100 text-red-700',
  supporting: 'bg-green-100 text-green-700',
  minor: 'bg-gray-100 text-gray-600',
  mentor: 'bg-purple-100 text-purple-700',
  love_interest: 'bg-pink-100 text-pink-700',
};

export default function CharacterDetail({ character, open, onClose, onUpdate, onDelete }) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState(character || {});
  const [regenerating, setRegenerating] = useState(false);
  const [genImage, setGenImage] = useState(false);

  React.useEffect(() => {
    if (character) setForm(character);
  }, [character?.id]);

  const handleSave = () => {
    onUpdate(form);
  };

  const regenerateProfile = async () => {
    setRegenerating(true);
    const sourcesText = (form.personality_sources || []).map((s, i) =>
      `Source ${i + 1} (${s.type}): ${s.content?.slice(0, 1000)}`
    ).join('\n\n');
    const useLang = lang;
    const prompt = useLang === 'es'
      ? `Eres un psicólogo narrativo. Crea un perfil para "${form.name}" (${form.role}, ${form.age || 'edad desconocida'}). Fuentes: ${sourcesText || 'ninguna'}. Notas del autor: ${form.custom_notes || 'ninguna'}. Responde SOLO JSON: {"backstory":"500 palabras","core_motivation":"","fears":"","speech_patterns":"","relationships":"","arc":""}`
      : `You are a narrative psychologist. Create a profile for "${form.name}" (${form.role}, ${form.age || 'unknown age'}). Sources: ${sourcesText || 'none'}. Author notes: ${form.custom_notes || 'none'}. Respond ONLY JSON: {"backstory":"500 words","core_motivation":"","fears":"","speech_patterns":"","relationships":"","arc":""}`;

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
    setForm({ ...form, ...result, profile_generated: true });
    setRegenerating(false);
  };

  const regeneratePortrait = async () => {
    setGenImage(true);
    const prompt = `Cinematic character portrait, professional studio lighting, 1:1 ratio. Character: ${form.name}, ${form.role}, ${form.age || ''} years old. Appearance: ${form.appearance || ''}. ${form.core_motivation || ''}`;
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    setForm({ ...form, image_url: result.url });
    setGenImage(false);
  };

  if (!character) return null;

  const profileFields = [
    { key: 'backstory', label: t('characters.backstory') },
    { key: 'core_motivation', label: t('characters.motivation') },
    { key: 'fears', label: t('characters.fears') },
    { key: 'speech_patterns', label: t('characters.speech') },
    { key: 'relationships', label: t('characters.relationships') },
    { key: 'arc', label: t('characters.arc') },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-[var(--ink-border)]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ink-warm)] overflow-hidden flex-shrink-0 flex items-center justify-center">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-[var(--ink-text-muted)] opacity-30" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">{form.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={`text-[10px] ${roleColors[form.role] || ''}`}>
                  {t(`characters.${form.role}`)}
                </Badge>
                {form.age && <span className="text-xs text-[var(--ink-text-muted)]">{form.age}</span>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={regenerateProfile} disabled={regenerating} className="text-xs">
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
              {t('characters.generateProfile')}
            </Button>
            <Button variant="outline" size="sm" onClick={regeneratePortrait} disabled={genImage} className="text-xs">
              {genImage ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <ImageIcon className="w-3 h-3 mr-1.5" />}
              {t('characters.generatePortrait')}
            </Button>
          </div>

          {profileFields.map(({ key, label }) => (
            <div key={key}>
              <Label className="text-xs text-[var(--ink-text-muted)]">{label}</Label>
              <Textarea
                value={form[key] || ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 text-sm resize-none"
                rows={key === 'backstory' ? 4 : 2}
              />
            </div>
          ))}

          <div>
            <Label className="text-xs text-[var(--ink-text-muted)]">{lang === 'es' ? 'Notas del autor' : 'Author notes'}</Label>
            <Textarea
              value={form.custom_notes || ''}
              onChange={e => setForm({ ...form, custom_notes: e.target.value })}
              className="mt-1 text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onDelete(character.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t('common.delete')}
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} className="bg-[var(--ink-accent)] text-white rounded-xl">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}