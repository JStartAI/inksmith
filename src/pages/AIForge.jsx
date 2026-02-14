import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ArrowLeft, Sparkles, Zap, Search, MessageSquare, Loader2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/i18n/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

const tools = [
  { id: 'plot', icon: Zap, labelKey: 'aiforge.plotGenerator', color: 'text-blue-600 bg-blue-50' },
  { id: 'brainstorm', icon: Sparkles, labelKey: 'aiforge.brainstorm', color: 'text-amber-600 bg-amber-50' },
  { id: 'analyze', icon: Search, labelKey: 'aiforge.sceneAnalyzer', color: 'text-purple-600 bg-purple-50' },
  { id: 'dialogue', icon: MessageSquare, labelKey: 'aiforge.dialoguePolisher', color: 'text-green-600 bg-green-50' },
];

export default function AIForge() {
  const { t, lang } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('projectId');
  const [activeTool, setActiveTool] = useState('plot');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (d) => d[0],
    enabled: !!projectId,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters', projectId],
    queryFn: () => base44.entities.Character.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const charNames = characters.map(c => c.name).join(', ');
  const useLang = project?.language || lang;

  const prompts = {
    plot: useLang === 'es'
      ? `Eres un arquitecto de historias. Crea una estructura de 3 actos para: "${input}". Personajes: ${charNames || 'no definidos'}. Incluye: Gancho, Incidente incitador, Primer punto de giro, Punto medio, Segundo punto de giro, Clímax, Resolución. Sé específico y creativo.`
      : `You are a story architect. Create a 3-act structure for: "${input}". Characters: ${charNames || 'none defined'}. Include: Hook, Inciting incident, First plot point, Midpoint, Second plot point, Climax, Resolution. Be specific and creative.`,
    brainstorm: useLang === 'es'
      ? `Eres un consultor creativo. Genera 7 ideas innovadoras basadas en: "${input}". Personajes disponibles: ${charNames || 'ninguno'}. Incluye giros inesperados, conflictos internos y elementos temáticos.`
      : `You are a creative consultant. Generate 7 innovative ideas based on: "${input}". Available characters: ${charNames || 'none'}. Include unexpected twists, internal conflicts, and thematic elements.`,
    analyze: useLang === 'es'
      ? `Eres un editor literario experto. Analiza esta escena:\n\n${input}\n\nEvalúa: Pacing (lento/medio/rápido), Tensión narrativa (1-10), Claridad de POV, Consistencia de personaje. Da 3 sugerencias concretas de mejora.`
      : `You are an expert literary editor. Analyze this scene:\n\n${input}\n\nEvaluate: Pacing (slow/medium/fast), Narrative tension (1-10), POV clarity, Character consistency. Give 3 concrete improvement suggestions.`,
    dialogue: useLang === 'es'
      ? `Eres un guionista experto. Mejora estos diálogos manteniendo la voz de cada personaje:\n\n${input}\n\nPerfiles de personajes: ${characters.map(c => `${c.name}: ${c.speech_patterns || 'no definido'}`).join('; ')}`
      : `You are an expert screenwriter. Polish these dialogues maintaining each character's voice:\n\n${input}\n\nCharacter profiles: ${characters.map(c => `${c.name}: ${c.speech_patterns || 'undefined'}`).join('; ')}`,
  };

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    const response = await base44.integrations.Core.InvokeLLM({ prompt: prompts[activeTool] });
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--ink-bg)]">
      <header className="border-b border-[var(--ink-border)] bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Workspace') + `?projectId=${projectId}`}>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowLeft className="w-3 h-3" />
              {t('common.back')}
            </Button>
          </Link>
          <span className="text-xs text-[var(--ink-text-muted)]">/ {project?.title} / {t('aiforge.title')}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setResult(''); }}
              className={`flex items-center gap-2 p-4 rounded-xl border transition-all ${
                activeTool === tool.id
                  ? 'border-[var(--ink-accent)] bg-[var(--ink-accent-light)] shadow-sm'
                  : 'border-[var(--ink-border)] bg-white hover:border-[var(--ink-text-muted)]'
              }`}
            >
              <div className={`p-2 rounded-lg ${tool.color}`}>
                <tool.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[var(--ink-text)]">{t(tool.labelKey)}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-[var(--ink-border)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[var(--ink-text-secondary)]">
                {activeTool === 'plot' && (useLang === 'es' ? 'Idea semilla' : 'Seed idea')}
                {activeTool === 'brainstorm' && (useLang === 'es' ? 'Contexto' : 'Context')}
                {activeTool === 'analyze' && (useLang === 'es' ? 'Escena a analizar' : 'Scene to analyze')}
                {activeTool === 'dialogue' && (useLang === 'es' ? 'Diálogos a pulir' : 'Dialogues to polish')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('aiforge.seedIdea')}
                className="min-h-[250px] resize-none border-[var(--ink-border-subtle)] text-sm"
              />
              <Button
                onClick={generate}
                disabled={loading || !input.trim()}
                className="w-full mt-4 bg-[var(--ink-accent)] text-white rounded-xl h-10"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('aiforge.generating')}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />{t('aiforge.generate')}</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[var(--ink-border)]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--ink-text-secondary)]">
                {useLang === 'es' ? 'Resultado' : 'Result'}
              </CardTitle>
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
                  className="h-7 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="min-h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--ink-accent)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--ink-text-muted)]">{t('aiforge.generating')}</p>
                  </div>
                </div>
              ) : result ? (
                <div className="prose prose-sm max-w-none text-[var(--ink-text)] min-h-[250px]">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="min-h-[250px] flex items-center justify-center text-[var(--ink-text-muted)]">
                  <p className="text-sm">{useLang === 'es' ? 'Los resultados aparecerán aquí' : 'Results will appear here'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}