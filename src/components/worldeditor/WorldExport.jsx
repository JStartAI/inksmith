import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Code } from 'lucide-react';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cardToMarkdown(card, allCards) {
  const lines = [];
  lines.push(`# ${card.type_icon || ''} ${card.name}`);
  if (card.type_name) lines.push(`**Tipo:** ${card.type_name}`);
  if (card.aliases?.length) lines.push(`**También conocido como:** ${card.aliases.join(', ')}`);
  lines.push('');

  if (card.synopsis) {
    lines.push(`> ${card.synopsis}`);
    lines.push('');
  }

  const props = card.properties || [];
  if (props.length) {
    props.forEach(p => {
      let val = p.value || '—';
      if (p.type === 'Referencia' && p.ref_card_id) {
        const ref = allCards.find(c => c.id === p.ref_card_id);
        if (ref) val = ref.name;
      }
      lines.push(`**${p.name}:** ${val}`);
    });
    lines.push('');
  }

  if (card.content) {
    lines.push(stripHtml(card.content));
  }

  return lines.join('\n');
}

export default function WorldExport({ worldId, worldName }) {
  const [exporting, setExporting] = useState(false);

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', worldId],
    queryFn: () => base44.entities.Card.filter({ world_id: worldId }),
    enabled: !!worldId,
  });

  const { data: cardTypes = [] } = useQuery({
    queryKey: ['cardTypes', worldId],
    queryFn: () => base44.entities.CardType.filter({ world_id: worldId }),
    enabled: !!worldId,
  });

  const exportJSON = () => {
    const data = {
      world_name: worldName,
      exported_at: new Date().toISOString(),
      card_types: cardTypes,
      cards: cards,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worldName || 'mundo'}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    setExporting(true);
    const sections = [];
    sections.push(`# ${worldName || 'Mi Mundo'}`);
    sections.push(`*Exportado el ${new Date().toLocaleDateString('es-ES')}*\n`);

    // Group by type
    const byType = cards.reduce((acc, c) => {
      const key = c.type_name || 'Sin tipo';
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});

    Object.entries(byType).forEach(([type, typeCards]) => {
      sections.push(`\n---\n\n## ${typeCards[0]?.type_icon || ''} ${type}\n`);
      typeCards.forEach(card => {
        sections.push(cardToMarkdown(card, cards));
        sections.push('\n---\n');
      });
    });

    const md = sections.join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worldName || 'mundo'}-wiki.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}>Exportar mundo</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Descarga tus fichas para hacer una copia de seguridad o compartirlas.
      </p>

      <div className="space-y-3">
        {/* JSON backup */}
        <button
          onClick={exportJSON}
          className="w-full flex items-start gap-4 p-4 rounded text-left hover:opacity-80 transition-opacity"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-subtle)', borderRadius: '3px' }}>
            <Code className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm" style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}>Backup JSON</span>
              <Download className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Exporta todos los tipos y fichas en formato JSON. Ideal para restaurar o transferir datos.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
              {cardTypes.length} tipos · {cards.length} fichas
            </p>
          </div>
        </button>

        {/* Markdown wiki */}
        <button
          onClick={exportMarkdown}
          disabled={exporting}
          className="w-full flex items-start gap-4 p-4 rounded text-left hover:opacity-80 transition-opacity disabled:opacity-40"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-subtle)', borderRadius: '3px' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm" style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}>Wiki en Markdown</span>
              <Download className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Genera un documento Markdown legible con todas las fichas agrupadas por tipo.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
              {cards.filter(c => c.wiki_visible !== false).length} fichas visibles en wiki
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}