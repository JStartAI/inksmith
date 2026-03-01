import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, ChevronRight, CheckCircle2, RefreshCw, X } from 'lucide-react';

const typeColors = {
  grammar:     { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  style:       { bg: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' },
  word_choice: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  clarity:     { bg: '#dcfce7', text: '#14532d', dot: '#22c55e' },
};

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function HighlightedText({ text, corrections, activeId, onSelect }) {
  if (!corrections.length) {
    return (
      <div className="text-[15px] leading-8 text-[#1a1a1a] whitespace-pre-wrap font-serif">
        {text}
      </div>
    );
  }

  // Build segments with highlights
  const positioned = corrections
    .map((c, i) => {
      const idx = text.toLowerCase().indexOf(c.original.toLowerCase());
      return { ...c, idx, id: i };
    })
    .filter(c => c.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  const segments = [];
  let last = 0;
  positioned.forEach(c => {
    if (c.idx > last) segments.push({ type: 'text', content: text.slice(last, c.idx) });
    segments.push({ type: 'correction', ...c });
    last = c.idx + c.original.length;
  });
  if (last < text.length) segments.push({ type: 'text', content: text.slice(last) });

  return (
    <div className="text-[15px] leading-8 text-[#1a1a1a] whitespace-pre-wrap font-serif">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.content}</span>;
        const isActive = seg.id === activeId;
        const colors = typeColors[seg.type] || typeColors.grammar;
        return (
          <span
            key={i}
            onClick={() => onSelect(seg.id)}
            className="cursor-pointer rounded px-0.5 transition-all"
            style={{
              background: isActive ? colors.bg : '#fff3c4',
              borderBottom: `2px solid ${isActive ? colors.dot : '#f59e0b'}`,
              outline: isActive ? `2px solid ${colors.dot}` : 'none',
            }}
            title={seg.suggestion}
          >
            {seg.original}
          </span>
        );
      })}
    </div>
  );
}

function CorrectionCard({ correction, index, isActive, onSelect }) {
  const colors = typeColors[correction.type] || typeColors.grammar;
  return (
    <div
      onClick={() => onSelect(isActive ? null : index)}
      className="rounded-xl p-4 cursor-pointer transition-all border"
      style={{
        background: isActive ? '#1a1a22' : '#13131a',
        borderColor: isActive ? colors.dot : '#22222e',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-semibold text-[#888] line-through">{correction.original}</span>
        <ChevronRight className="w-3 h-3 text-[#444] flex-shrink-0" />
        <span
          className="text-[12px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: colors.bg, color: colors.text }}
        >
          {correction.suggestion}
        </span>
      </div>
      <p className="text-[12px] text-[#8888a2] leading-relaxed">{correction.explanation}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
        <span className="text-[10px] text-[#52526a] capitalize">{correction.type?.replace('_', ' ')}</span>
      </div>
    </div>
  );
}

export default function CorrectionMode({ document }) {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const plainText = stripHtml(document?.content);

  const analyze = async () => {
    if (!plainText) return;
    setLoading(true);
    setCorrections([]);
    setActiveId(null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional writing editor. Analyze the following text and identify corrections for grammar, style, word choice, and clarity. Find 5-12 specific corrections. For each correction, identify the EXACT phrase from the text (as short as possible), suggest a better alternative, and give a brief explanation (1-2 sentences max). Text to analyze:\n\n"${plainText.slice(0, 3000)}"`,
      response_json_schema: {
        type: 'object',
        properties: {
          corrections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                original:    { type: 'string', description: 'exact phrase from text' },
                suggestion:  { type: 'string', description: 'improved replacement' },
                explanation: { type: 'string', description: 'brief explanation' },
                type:        { type: 'string', enum: ['grammar', 'style', 'word_choice', 'clarity'] },
              },
              required: ['original', 'suggestion', 'explanation', 'type'],
            },
          },
        },
        required: ['corrections'],
      },
    });

    setCorrections(result.corrections || []);
    setAnalyzed(true);
    setLoading(false);
  };

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0d0d10' }}>
        <p className="text-[#52526a] text-sm">Selecciona un documento para analizar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: '#0d0d10' }}>
      {/* Text with highlights */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        <div
          className="mx-auto bg-white rounded-lg shadow-2xl"
          style={{ maxWidth: '680px', minHeight: '80vh', padding: '40px 48px' }}
        >
          {!analyzed ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#1a2844' }}>
                <Sparkles className="w-6 h-6 text-[#4f7ef7]" />
              </div>
              <div className="text-center">
                <p className="text-[#333] font-semibold mb-1">Modo Corrección</p>
                <p className="text-[13px] text-[#888] mb-6">La IA analizará tu texto y sugerirá mejoras</p>
                <button
                  onClick={analyze}
                  disabled={loading || !plainText}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ background: '#4f7ef7' }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? 'Analizando...' : 'Analizar texto'}
                </button>
              </div>
            </div>
          ) : (
            <HighlightedText
              text={plainText}
              corrections={corrections}
              activeId={activeId}
              onSelect={setActiveId}
            />
          )}
        </div>
      </div>

      {/* Corrections panel */}
      {analyzed && (
        <div
          className="w-80 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid #1e1e28', background: '#0f0f14' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e1e28' }}>
            <div>
              <p className="text-[13px] font-semibold text-[#e2e2ea]">Correcciones</p>
              <p className="text-[11px] text-[#52526a]">{corrections.length} sugerencias</p>
            </div>
            <button
              onClick={analyze}
              className="p-1.5 rounded-lg hover:bg-[#1e1e28] text-[#52526a] hover:text-[#e2e2ea] transition-colors"
              title="Reanalizar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {corrections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <CheckCircle2 className="w-8 h-8 text-[#34d399]" />
                <p className="text-[12px] text-[#8888a2]">No se encontraron correcciones</p>
              </div>
            ) : (
              corrections.map((c, i) => (
                <CorrectionCard
                  key={i}
                  correction={c}
                  index={i}
                  isActive={activeId === i}
                  onSelect={setActiveId}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}