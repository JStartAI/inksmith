import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronRight, Trash2, Eye, EyeOff } from 'lucide-react';
import CardEditor from './CardEditor';
import CardTypeSelector from './CardTypeSelector';

export default function WorldCards({ worldId }) {
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [search, setSearch] = useState('');

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

  const deleteCard = useMutation({
    mutationFn: (id) => base44.entities.Card.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', worldId] });
      setSelectedCard(null);
    },
  });

  const createCard = useMutation({
    mutationFn: ({ type }) => base44.entities.Card.create({
      world_id: worldId,
      type_id: type.id,
      type_name: type.name,
      type_icon: type.icon,
      name: `Nueva ${type.name}`,
      sort_order: cards.length,
    }),
    onSuccess: (newCard) => {
      queryClient.invalidateQueries({ queryKey: ['cards', worldId] });
      setSelectedCard(newCard);
      setShowTypeSelector(false);
    },
  });

  // Group by type
  const filtered = cards.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.type_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, card) => {
    const key = card.type_name || 'Sin tipo';
    if (!acc[key]) acc[key] = { icon: card.type_icon || '📄', cards: [] };
    acc[key].cards.push(card);
    return acc;
  }, {});

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5" style={{ background: 'var(--bg-subtle)', borderRadius: '3px' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar fichas..."
              className="flex-1 bg-transparent text-xs focus:outline-none"
              style={{ color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* New Card Button */}
        <button
          onClick={() => setShowTypeSelector(true)}
          className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-subtle)', border: '1px dashed var(--border)', borderRadius: '3px', color: 'var(--text-muted)' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva ficha
        </button>

        {/* Card list grouped by type */}
        <div className="flex-1 overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {search ? 'Sin resultados' : 'Crea tu primera ficha'}
              </p>
            </div>
          )}
          {Object.entries(grouped).map(([typeName, { icon, cards: typeCards }]) => (
            <div key={typeName} className="mb-2">
              <div className="px-3 py-1 flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {typeName}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{typeCards.length}</span>
              </div>
              {typeCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="w-full flex items-center gap-2 px-4 py-1.5 text-left transition-colors text-sm"
                  style={{
                    background: selectedCard?.id === card.id ? 'var(--bg-subtle)' : 'transparent',
                    color: selectedCard?.id === card.id ? 'var(--text)' : 'var(--text-secondary)',
                    borderLeft: selectedCard?.id === card.id ? '2px solid var(--text)' : '2px solid transparent',
                  }}
                >
                  <span className="truncate flex-1">{card.name}</span>
                  {!card.wiki_visible && <EyeOff className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-hidden">
        {showTypeSelector && (
          <CardTypeSelector
            cardTypes={cardTypes}
            onSelect={(type) => createCard.mutate({ type })}
            onClose={() => setShowTypeSelector(false)}
          />
        )}

        {!showTypeSelector && selectedCard ? (
          <CardEditor
            key={selectedCard.id}
            card={selectedCard}
            worldId={worldId}
            cardTypes={cardTypes}
            onUpdate={(updated) => {
              setSelectedCard(updated);
              queryClient.invalidateQueries({ queryKey: ['cards', worldId] });
            }}
            onDelete={() => deleteCard.mutate(selectedCard.id)}
          />
        ) : !showTypeSelector && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🃏</div>
              <h3 className="text-lg mb-2" style={{ fontFamily: 'Lora, serif' }}>Empieza con una Ficha</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Las fichas son las unidades atómicas de tu mundo</p>
              <button
                onClick={() => setShowTypeSelector(true)}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 text-sm font-medium"
                style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
              >
                <Plus className="w-4 h-4" />
                Crear ficha
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}