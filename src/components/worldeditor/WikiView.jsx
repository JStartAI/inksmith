import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function WikiCard({ card, allCards, onSelect }) {
  // Resolve references in properties
  const resolvedProps = (card.properties || []).map(prop => {
    if (prop.type === 'Referencia' && prop.ref_card_id) {
      const ref = allCards.find(c => c.id === prop.ref_card_id);
      return { ...prop, resolvedName: ref?.name, resolvedIcon: ref?.type_icon };
    }
    return prop;
  });

  return (
    <div className="rounded p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{card.type_icon || '📄'}</span>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}>{card.name}</h2>
          {card.aliases?.length > 0 && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              También: {card.aliases.join(', ')}
            </p>
          )}
          <span className="text-xs mt-1 inline-block" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>{card.type_name}</span>
        </div>
      </div>

      {/* Synopsis */}
      {card.synopsis && (
        <blockquote className="mb-4 pl-4 text-sm italic" style={{ color: 'var(--text-secondary)', borderLeft: '3px solid var(--border)' }}>
          {card.synopsis}
        </blockquote>
      )}

      {/* Properties table */}
      {resolvedProps.length > 0 && (
        <div className="mb-5">
          <table className="w-full text-sm">
            <tbody>
              {resolvedProps.map((prop, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="py-1.5 pr-4 font-medium w-1/3" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {prop.name}
                  </td>
                  <td className="py-1.5" style={{ color: 'var(--text)' }}>
                    {prop.type === 'Referencia' && prop.resolvedName ? (
                      <button
                        onClick={() => onSelect(prop.ref_card_id)}
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--accent-warm)' }}
                      >
                        {prop.resolvedIcon} {prop.resolvedName}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : prop.type === 'Enlace' && prop.value ? (
                      <a href={prop.value} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--accent-warm)' }}>
                        {prop.value}
                      </a>
                    ) : (
                      prop.value || <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Content */}
      {card.content && stripHtml(card.content) && (
        <div
          className="prose prose-sm max-w-none text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Lora, serif' }}
          dangerouslySetInnerHTML={{ __html: card.content }}
        />
      )}
    </div>
  );
}

export default function WikiView({ worldId }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(null);

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', worldId],
    queryFn: () => base44.entities.Card.filter({ world_id: worldId }),
    enabled: !!worldId,
  });

  const visibleCards = cards.filter(c => c.wiki_visible !== false);
  const types = [...new Set(visibleCards.map(c => c.type_name).filter(Boolean))];

  const filtered = visibleCards.filter(c =>
    (!filterType || c.type_name === filterType) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.synopsis || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.aliases || []).some(a => a.toLowerCase().includes(search.toLowerCase())))
  );

  const groupedByType = filtered.reduce((acc, card) => {
    const key = card.type_name || 'Sin tipo';
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
    return acc;
  }, {});

  const selectedCard = selectedCardId ? cards.find(c => c.id === selectedCardId) : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col overflow-hidden" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="p-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '3px' }}>
            <Search className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 text-xs bg-transparent focus:outline-none"
              style={{ color: 'var(--text)' }}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /></button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <button
            onClick={() => { setFilterType(''); setSelectedCardId(null); }}
            className="w-full text-left px-4 py-1.5 text-xs hover:opacity-70 transition-opacity"
            style={{ color: filterType === '' ? 'var(--text)' : 'var(--text-muted)', fontWeight: filterType === '' ? 600 : 400 }}
          >
            Todas las fichas ({visibleCards.length})
          </button>

          {types.map(type => {
            const typeCards = visibleCards.filter(c => c.type_name === type);
            const icon = typeCards[0]?.type_icon || '📄';
            return (
              <div key={type}>
                <button
                  onClick={() => { setFilterType(type); setSelectedCardId(null); }}
                  className="w-full text-left px-4 py-1.5 text-xs flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  style={{ color: filterType === type ? 'var(--text)' : 'var(--text-muted)', fontWeight: filterType === type ? 600 : 400 }}
                >
                  <span>{icon}</span> {type} ({typeCards.length})
                </button>
                {(filterType === type || filterType === '') && filtered.filter(c => c.type_name === type).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    className="w-full text-left pl-8 pr-4 py-1 text-xs hover:opacity-70 transition-opacity truncate"
                    style={{ color: selectedCardId === c.id ? 'var(--text)' : 'var(--text-muted)', background: selectedCardId === c.id ? 'var(--bg-subtle)' : 'transparent' }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
        {selectedCard ? (
          <div className="max-w-3xl mx-auto p-8">
            <button
              onClick={() => setSelectedCardId(null)}
              className="flex items-center gap-1 text-xs mb-6 hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Volver
            </button>
            <WikiCard card={selectedCard} allCards={cards} onSelect={setSelectedCardId} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-8">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">📖</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {cards.length === 0 ? 'Aún no hay fichas en este mundo' : 'Sin resultados'}
                </p>
              </div>
            ) : (
              Object.entries(groupedByType).map(([type, typeCards]) => (
                <div key={type} className="mb-10">
                  <h3 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    {typeCards[0]?.type_icon} {type}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {typeCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className="text-left p-4 rounded hover:opacity-80 transition-opacity"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{card.type_icon || '📄'}</span>
                          <span className="font-semibold text-sm" style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}>{card.name}</span>
                          {card.aliases?.length > 0 && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {card.aliases.join(', ')}</span>
                          )}
                        </div>
                        {card.synopsis && (
                          <p className="text-xs italic ml-7" style={{ color: 'var(--text-muted)' }}>{card.synopsis}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}