import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Clock, Layers, FileText, Pin, EyeOff } from 'lucide-react';

export default function WorldHome({ world, worldId }) {
  const { data: cards = [] } = useQuery({
    queryKey: ['cards', worldId],
    queryFn: () => base44.entities.Card.filter({ world_id: worldId }),
    enabled: !!worldId,
  });

  const recentCards = [...cards]
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 5);

  const pinnedCards = cards.filter(c => c.pinned);
  const hiddenCount = cards.filter(c => c.wiki_visible === false).length;
  const typeBreakdown = Object.entries(
    cards.reduce((acc, c) => {
      const k = (c.type_icon || '📄') + ' ' + (c.type_name || 'Sin tipo');
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const stats = [
    { label: 'Total fichas', value: cards.length, Icon: FileText },
    { label: 'Tipos activos', value: new Set(cards.map(c => c.type_name).filter(Boolean)).size, Icon: Layers },
    { label: 'Fijadas', value: pinnedCards.length, Icon: Pin },
    { label: 'Ocultas en wiki', value: hiddenCount, Icon: EyeOff },
  ];

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Lora, serif' }}>
            Bienvenido a {world?.name}
          </h1>
          {world?.description && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{world.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>{label}</span>
              </div>
              <span className="text-3xl font-bold" style={{ fontFamily: 'Lora, serif' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Type breakdown */}
        {typeBreakdown.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Layers className="w-3.5 h-3.5" />
              Distribución por tipo
            </h2>
            <div className="space-y-2">
              {typeBreakdown.map(([label, count]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm w-40 truncate" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / cards.length) * 100}%`, background: 'var(--text-muted)' }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned */}
        {pinnedCards.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Pin className="w-3.5 h-3.5" />
              Fijadas
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {pinnedCards.map(card => (
                <div key={card.id} className="flex items-center gap-2 p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <span className="text-base">{card.type_icon || '📄'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ fontFamily: 'Lora, serif' }}>{card.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.type_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recentCards.length > 0 && (
          <div>
            <h2 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Clock className="w-3.5 h-3.5" />
              Recientes
            </h2>
            <div className="space-y-2">
              {recentCards.map(card => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 p-3"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
                >
                  <span className="text-xl">{card.type_icon || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ fontFamily: 'Lora, serif' }}>{card.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.type_name || 'Sin tipo'}</p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(card.updated_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cards.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">Ve a la pestaña <strong style={{ color: 'var(--text)' }}>Fichas</strong> para crear tus primeras fichas</p>
          </div>
        )}
      </div>
    </div>
  );
}