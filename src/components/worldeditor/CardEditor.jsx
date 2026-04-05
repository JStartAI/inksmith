import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Trash2, Plus, Eye, EyeOff, X, Check } from 'lucide-react';
import ReactQuill from 'react-quill';

const PROPERTY_TYPES = ['Texto', 'Número', 'Enlace', 'Referencia'];

function AliasTag({ alias, onRemove }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-secondary)' }}>
      {alias}
      <button onClick={onRemove} className="hover:opacity-70"><X className="w-3 h-3" /></button>
    </span>
  );
}

export default function CardEditor({ card, worldId, cardTypes, onUpdate, onDelete }) {
  const [name, setName] = useState(card.name || '');
  const [content, setContent] = useState(card.content || '');
  const [synopsis, setSynopsis] = useState(card.synopsis || '');
  const [aliases, setAliases] = useState(card.aliases || []);
  const [newAlias, setNewAlias] = useState('');
  const [properties, setProperties] = useState(card.properties || []);
  const [wikiVisible, setWikiVisible] = useState(card.wiki_visible !== false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const saveTimer = useRef(null);

  const updateCard = useMutation({
    mutationFn: (data) => base44.entities.Card.update(card.id, data),
    onSuccess: (updated) => {
      setSaveStatus('saved');
      onUpdate(updated);
    },
  });

  const triggerSave = (patch) => {
    setSaveStatus('unsaved');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus('saving');
      updateCard.mutate({ name, content, synopsis, aliases, properties, wiki_visible: wikiVisible, ...patch });
    }, 1200);
  };

  // Sync when card changes from outside
  useEffect(() => {
    setName(card.name || '');
    setContent(card.content || '');
    setSynopsis(card.synopsis || '');
    setAliases(card.aliases || []);
    setProperties(card.properties || []);
    setWikiVisible(card.wiki_visible !== false);
  }, [card.id]);

  useEffect(() => { return () => clearTimeout(saveTimer.current); }, []);

  const addAlias = () => {
    if (!newAlias.trim()) return;
    const updated = [...aliases, newAlias.trim()];
    setAliases(updated);
    setNewAlias('');
    triggerSave({ aliases: updated });
  };

  const removeAlias = (i) => {
    const updated = aliases.filter((_, idx) => idx !== i);
    setAliases(updated);
    triggerSave({ aliases: updated });
  };

  const addProperty = () => {
    const updated = [...properties, { name: 'Nueva propiedad', type: 'Texto', value: '' }];
    setProperties(updated);
    triggerSave({ properties: updated });
  };

  const updateProperty = (i, field, value) => {
    const updated = properties.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
    setProperties(updated);
    triggerSave({ properties: updated });
  };

  const removeProperty = (i) => {
    const updated = properties.filter((_, idx) => idx !== i);
    setProperties(updated);
    triggerSave({ properties: updated });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Card header bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{card.type_icon || '📄'}</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{card.type_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
            {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? '✓ Guardado' : '•••'}
          </span>
          <button
            onClick={() => { setWikiVisible(!wikiVisible); triggerSave({ wiki_visible: !wikiVisible }); }}
            title={wikiVisible ? 'Visible en wiki' : 'Oculto en wiki'}
            style={{ color: 'var(--text-muted)' }}
          >
            {wikiVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={onDelete} style={{ color: 'var(--text-muted)' }} className="hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Title */}
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); triggerSave({ name: e.target.value }); }}
          className="w-full text-3xl font-bold bg-transparent focus:outline-none mb-4"
          style={{ fontFamily: 'Lora, serif', color: 'var(--text)' }}
          placeholder="Nombre de la ficha..."
        />

        {/* Aliases */}
        <div className="mb-5">
          <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aliases</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {aliases.map((alias, i) => (
              <AliasTag key={i} alias={alias} onRemove={() => removeAlias(i)} />
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newAlias}
                onChange={e => setNewAlias(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAlias()}
                placeholder="+ Añadir alias"
                className="text-xs bg-transparent focus:outline-none"
                style={{ color: 'var(--text-muted)', width: '100px' }}
              />
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <div className="mb-5">
          <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sinopsis</p>
          <textarea
            value={synopsis}
            onChange={(e) => { setSynopsis(e.target.value); triggerSave({ synopsis: e.target.value }); }}
            placeholder="Una breve sinopsis..."
            rows={2}
            className="w-full text-sm bg-transparent focus:outline-none resize-none"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Lora, serif', fontStyle: 'italic' }}
          />
        </div>

        {/* Properties */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Propiedades</p>
            <button onClick={addProperty} className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
              <Plus className="w-3 h-3" /> Añadir
            </button>
          </div>
          {properties.length === 0 && (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Sin propiedades</p>
          )}
          <div className="space-y-2">
            {properties.map((prop, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={prop.name}
                  onChange={e => updateProperty(i, 'name', e.target.value)}
                  className="text-xs font-medium bg-transparent focus:outline-none w-28 flex-shrink-0"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <span style={{ color: 'var(--border)' }}>·</span>
                <input
                  type="text"
                  value={prop.value}
                  onChange={e => updateProperty(i, 'value', e.target.value)}
                  placeholder="Valor..."
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: 'var(--text)' }}
                />
                <button onClick={() => removeProperty(i)} className="flex-shrink-0 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content editor */}
        <div>
          <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contenido</p>
          <div className="ink-editor" style={{ minHeight: '300px' }}>
            <ReactQuill
              value={content}
              onChange={(val) => { setContent(val); triggerSave({ content: val }); }}
              placeholder="Escribe el contenido de esta ficha..."
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ header: [1, 2, 3, false] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['blockquote'],
                  ['clean'],
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}