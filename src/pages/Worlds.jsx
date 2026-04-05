import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Globe, Trash2, Clock, FileText } from 'lucide-react';
import WorldOnboarding from '../components/worlds/WorldOnboarding';

const GENRE_COLORS = {
  Fantasy: '#6B8E3A', 'Sci-Fi': '#4A7DB5', Modern: '#7A7A7A', Horror: '#8B2020',
  Historical: '#8B6914', Grimdark: '#4A3728', 'Dark-Fantasy': '#5C2D6B',
  Mythology: '#B8860B', 'Alternate-History': '#4A6B8B', Dystopian: '#6B4A20',
  'Post-Apocalyptic': '#7A5C2E', Survival: '#4A6B3A', Western: '#8B6914',
  Cyberpunk: '#00CED1', Solarpunk: '#5DAD44', Steampunk: '#8B6914',
  Cozy: '#C4916A', 'Dark-Academia': '#5C4A2E',
};

export default function Worlds() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: allCards = [] } = useQuery({
    queryKey: ['allCards'],
    queryFn: () => base44.entities.Card.list('-created_date', 500),
  });

  const cardCountByWorld = allCards.reduce((acc, c) => {
    acc[c.world_id] = (acc[c.world_id] || 0) + 1;
    return acc;
  }, {});

  const { data: worlds = [], isLoading } = useQuery({
    queryKey: ['worlds'],
    queryFn: () => base44.entities.World.list('-created_date'),
  });

  const deleteWorld = useMutation({
    mutationFn: (id) => base44.entities.World.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worlds'] }),
  });

  const handleWorldCreated = (worldId) => {
    setShowOnboarding(false);
    queryClient.invalidateQueries({ queryKey: ['worlds'] });
    navigate(`/world-editor?worldId=${worldId}`);
  };

  if (showOnboarding) {
    return <WorldOnboarding onComplete={handleWorldCreated} onCancel={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Tus Mundos</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cada mundo es un universo narrativo propio</p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: '8px' }}
          >
            <Plus className="w-4 h-4" />
            Nuevo mundo
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text)' }} />
          </div>
        ) : worlds.length === 0 ? (
          <div className="text-center py-24">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--text)' }} />
            <h2 className="text-xl mb-2">No hay mundos aún</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Crea tu primer universo narrativo</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-6 py-2.5 text-sm font-medium transition-colors"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: '8px' }}
            >
              Crear mi primer mundo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {worlds.map((world) => (
              <div
                key={world.id}
                onClick={() => navigate(`/world-editor?worldId=${world.id}`)}
                className="group relative cursor-pointer overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
              >
                <div
                  className="h-32 flex items-center justify-center relative"
                  style={{
                    background: world.cover_image
                      ? `url(${world.cover_image}) center/cover`
                      : `linear-gradient(135deg, ${GENRE_COLORS[world.genre] || '#4A3728'}22, ${GENRE_COLORS[world.genre] || '#4A3728'}55)`,
                  }}
                >
                  {!world.cover_image && (
                    <Globe className="w-10 h-10 opacity-30" style={{ color: GENRE_COLORS[world.genre] || 'var(--text)' }} />
                  )}
                  <span
                    className="absolute top-2 left-2 text-xs px-2 py-0.5 font-medium"
                    style={{ background: GENRE_COLORS[world.genre] || '#555', color: '#fff', borderRadius: '2px', fontFamily: "'Space Mono', monospace" }}
                  >
                    {world.genre}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{world.name}</h3>
                  {world.description && (
                    <p className="text-xs line-clamp-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>{world.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(world.created_date).toLocaleDateString('es-ES')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {cardCountByWorld[world.id] || 0} fichas
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWorld.mutate(world.id); }}
                  className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '2px', color: '#fff' }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}