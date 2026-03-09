import React, { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';

export default function PlotView({ documents, characters = [] }) {
  const [selectedChar, setSelectedChar] = useState(null);

  // Filter documents (chapters/scenes)
  const scenes = documents.filter(d => d.type === 'document' && d.category === 'manuscript');

  // Build character relationships based on appearance in scenes
  const getCharacterArcs = () => {
    return characters.map(char => ({
      ...char,
      appearances: scenes.filter(scene => {
        const content = scene.content || '';
        return content.includes(char.name);
      }).length,
    }));
  };

  const charArcs = getCharacterArcs();

  return (
    <div className="flex-1 flex h-full overflow-hidden" style={{ background: '#1a1d1e' }}>
      {/* Timeline / Scene progression */}
      <div className="flex-1 flex flex-col overflow-hidden px-8 py-6">
        <h3 className="text-sm font-bold text-[#d8d4cc] mb-6 uppercase tracking-widest">Línea de Tiempo</h3>

        <div className="flex-1 overflow-y-auto space-y-3 pb-6">
          {scenes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-[#6e6a64] text-sm mb-3">Sin escenas aún</p>
                <p className="text-[#4a4540] text-xs">Crea capítulos en la vista Manuscrito</p>
              </div>
            </div>
          ) : (
            scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="group flex items-start gap-4 pb-4 border-l-2"
                style={{ borderColor: '#404446' }}
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center mt-1">
                  <div
                    className="w-3 h-3 rounded-full -ml-2 transition-all group-hover:scale-150"
                    style={{ background: '#7ba7bc' }}
                  />
                </div>

                {/* Scene card */}
                <div className="flex-1 rounded-lg p-3 transition-all group-hover:bg-[#2a2d2e]" style={{ background: '#262829' }}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-semibold text-[#ccc] truncate">{scene.title}</p>
                    <span className="text-[10px] text-[#6e6a64] ml-2 flex-shrink-0">
                      {scene.word_count || 0}w
                    </span>
                  </div>
                  {scene.synopsis && (
                    <p className="text-xs text-[#9e9a94] line-clamp-2">{scene.synopsis}</p>
                  )}
                  {scene.label && scene.label !== 'none' && (
                    <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-semibold" 
                      style={{ background: `var(--ink-${scene.label})`, opacity: 0.3 }}>
                      {scene.label}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="text-xs text-[#6e6a64] pt-4 border-t" style={{ borderColor: '#363a3b' }}>
          {scenes.length} escenas • {scenes.reduce((sum, s) => sum + (s.word_count || 0), 0).toLocaleString()} palabras
        </div>
      </div>

      {/* Character arcs / Relationships */}
      <div className="w-72 flex flex-col border-l" style={{ background: '#1e2122', borderColor: '#363a3b' }}>
        <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: '#363a3b' }}>
          <h3 className="text-sm font-bold text-[#d8d4cc] uppercase tracking-widest">Personajes</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {charArcs.length === 0 ? (
            <p className="text-xs text-[#6e6a64] py-6 text-center">Sin personajes</p>
          ) : (
            <div className="space-y-2">
              {charArcs.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(selectedChar?.id === char.id ? null : char)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                    selectedChar?.id === char.id
                      ? 'bg-[#4a7a96]/40'
                      : 'hover:bg-[#2a2d2e]'
                  }`}
                >
                  {/* Character avatar placeholder */}
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: '#7ba7bc', color: '#fff' }}
                  >
                    {char.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#d8d4cc] truncate">{char.name}</p>
                    <p className="text-xs text-[#6e6a64] capitalize">{char.role || 'sin rol'}</p>
                    {char.appearances > 0 && (
                      <p className="text-xs text-[#7ba7bc] mt-0.5">
                        {char.appearances} aparición{char.appearances !== 1 ? 'es' : ''}
                      </p>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 text-[#6e6a64] transition-transform flex-shrink-0 ${selectedChar?.id === char.id ? 'rotate-90' : ''}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Character detail */}
        {selectedChar && (
          <div className="px-4 py-3 border-t" style={{ borderColor: '#363a3b' }}>
            <p className="text-xs text-[#6e6a64] mb-2 uppercase tracking-widest">Detalle</p>
            <div className="space-y-2 text-xs">
              {selectedChar.backstory && (
                <div>
                  <p className="text-[#9e9a94] font-semibold mb-1">Trasfondo</p>
                  <p className="text-[#6e6a64] line-clamp-3">{selectedChar.backstory}</p>
                </div>
              )}
              {selectedChar.core_motivation && (
                <div>
                  <p className="text-[#9e9a94] font-semibold mb-1">Motivación</p>
                  <p className="text-[#6e6a64] line-clamp-2">{selectedChar.core_motivation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}