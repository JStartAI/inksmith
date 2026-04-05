import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function CardTypeSelector({ cardTypes, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = cardTypes.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center h-full" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg mx-4">
        <div className="p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ fontFamily: 'Lora, serif' }}>Selecciona un tipo de ficha</h3>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 mb-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '3px' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tipo..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--text)' }}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {filtered.map(type => (
              <button
                key={type.id}
                onClick={() => onSelect(type)}
                className="flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all hover:opacity-80"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                }}
              >
                <span className="text-xl">{type.icon || '📄'}</span>
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                Sin resultados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}