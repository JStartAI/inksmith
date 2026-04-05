import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Check, X } from 'lucide-react';

const PRESET_COLORS = ['#8b4513', '#1a5276', '#145a32', '#6c3483', '#784212', '#1b4f72', '#922b21', '#5d6d7e'];
const PRESET_ICONS = ['👤', '🏰', '⚔️', '🌍', '📜', '🐉', '💎', '🗺️', '⚗️', '🌿', '🔮', '🏛️', '👑', '🗡️', '🌊', '🔥'];

function TypeRow({ type, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(type.name);
  const [icon, setIcon] = useState(type.icon || '📄');
  const [color, setColor] = useState(type.color || '#8b4513');
  const qc = useQueryClient();

  const updateType = useMutation({
    mutationFn: (data) => base44.entities.CardType.update(type.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cardTypes', type.world_id] });
      setEditing(false);
    },
  });

  const handleSave = () => {
    updateType.mutate({ name, icon, color });
  };

  if (editing) {
    return (
      <div className="p-3 rounded" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 text-sm font-medium bg-transparent focus:outline-none"
            style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}
            autoFocus
          />
        </div>

        {/* Icon picker */}
        <div className="mb-3">
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>ICONO</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_ICONS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className="w-7 h-7 flex items-center justify-center text-base rounded transition-colors"
                style={{ background: icon === ic ? 'var(--text)' : 'var(--surface)', border: `1px solid ${icon === ic ? 'var(--text)' : 'var(--border)'}` }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-3">
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>COLOR</p>
          <div className="flex gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{ background: c, border: color === c ? '2px solid var(--text)' : '2px solid transparent' }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs"
            style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
          >
            <Check className="w-3 h-3" /> Guardar
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px' }}
          >
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded group cursor-pointer hover:opacity-80 transition-opacity"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      onClick={() => setEditing(true)}
    >
      <span className="text-xl">{type.icon || '📄'}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium" style={{ color: 'var(--text)', fontFamily: 'Lora, serif' }}>{type.name}</span>
        {type.color && (
          <span className="ml-2 inline-block w-3 h-3 rounded-full align-middle" style={{ background: type.color }} />
        )}
      </div>
      <span className="text-xs opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }}>editar</span>
      <button
        onClick={e => { e.stopPropagation(); onDelete(type.id); }}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function CardTypeManager({ worldId }) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📄');
  const [newColor, setNewColor] = useState('#8b4513');
  const qc = useQueryClient();

  const { data: cardTypes = [] } = useQuery({
    queryKey: ['cardTypes', worldId],
    queryFn: () => base44.entities.CardType.filter({ world_id: worldId }),
    enabled: !!worldId,
  });

  const createType = useMutation({
    mutationFn: (data) => base44.entities.CardType.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cardTypes', worldId] });
      setShowNew(false);
      setNewName('');
      setNewIcon('📄');
      setNewColor('#8b4513');
    },
  });

  const deleteType = useMutation({
    mutationFn: (id) => base44.entities.CardType.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cardTypes', worldId] }),
  });

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}>Tipos de fichas</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Define las categorías de tu mundo</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors"
          style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
        >
          <Plus className="w-4 h-4" /> Nuevo tipo
        </button>
      </div>

      {/* New type form */}
      {showNew && (
        <div className="mb-4 p-4 rounded" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{newIcon}</span>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newName.trim() && createType.mutate({ world_id: worldId, name: newName.trim(), icon: newIcon, color: newColor })}
              placeholder="Nombre del tipo..."
              className="flex-1 text-sm font-medium bg-transparent focus:outline-none"
              style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>ICONO</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setNewIcon(ic)}
                  className="w-7 h-7 flex items-center justify-center text-base rounded"
                  style={{ background: newIcon === ic ? 'var(--text)' : 'var(--surface)', border: `1px solid ${newIcon === ic ? 'var(--text)' : 'var(--border)'}` }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>COLOR</p>
            <div className="flex gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                  style={{ background: c, border: newColor === c ? '2px solid var(--text)' : '2px solid transparent' }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => createType.mutate({ world_id: worldId, name: newName.trim(), icon: newIcon, color: newColor })}
              disabled={!newName.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-40"
              style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
            >
              <Check className="w-3 h-3" /> Crear tipo
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Type list */}
      {cardTypes.length === 0 && !showNew ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-3xl mb-3">🏷️</div>
          <p className="text-sm">Aún no has creado ningún tipo de ficha.</p>
          <p className="text-xs mt-1">Los tipos organizan las entidades de tu mundo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cardTypes.map(type => (
            <TypeRow key={type.id} type={type} onDelete={(id) => deleteType.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}