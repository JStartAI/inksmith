import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

const GENRES = [
  { name: 'Fantasy', icon: '🧙', color: '#6B8E3A' },
  { name: 'Sci-Fi', icon: '🚀', color: '#4A7DB5' },
  { name: 'Modern', icon: '🏙️', color: '#7A7A7A' },
  { name: 'Horror', icon: '👻', color: '#8B2020' },
  { name: 'Historical', icon: '⚔️', color: '#8B6914' },
  { name: 'Grimdark', icon: '💀', color: '#4A3728' },
  { name: 'Dark-Fantasy', icon: '🌑', color: '#5C2D6B' },
  { name: 'Mythology', icon: '⚡', color: '#B8860B' },
  { name: 'Alternate-History', icon: '🔄', color: '#4A6B8B' },
  { name: 'Dystopian', icon: '🏭', color: '#6B4A20' },
  { name: 'Post-Apocalyptic', icon: '☢️', color: '#7A5C2E' },
  { name: 'Survival', icon: '🌲', color: '#4A6B3A' },
  { name: 'Western', icon: '🤠', color: '#8B6914' },
  { name: 'Cyberpunk', icon: '🤖', color: '#00CED1' },
  { name: 'Solarpunk', icon: '🌻', color: '#5DAD44' },
  { name: 'Steampunk', icon: '⚙️', color: '#8B6914' },
  { name: 'Cozy', icon: '🍵', color: '#C4916A' },
  { name: 'Dark-Academia', icon: '📚', color: '#5C4A2E' },
];

const USE_CASES = [
  { id: 'novel', label: 'Escribir una novela de ficción', icon: '📖' },
  { id: 'wiki', label: 'Crear una wiki de mundo', icon: '🌐' },
  { id: 'share', label: 'Compartir historias', icon: '🤝' },
  { id: 'fanfic', label: 'Escribir fan fiction', icon: '✍️' },
  { id: 'campaign', label: 'Seguimiento de campaña RPG', icon: '🎲' },
  { id: 'monetize', label: 'Monetizar contenido creativo', icon: '💡' },
];

export default function WorldOnboarding({ onComplete, onCancel }) {
  const [step, setStep] = useState(0); // 0: casos de uso, 1: género, 2: nombre
  const [selectedUseCases, setSelectedUseCases] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [worldName, setWorldName] = useState('');
  const [worldDescription, setWorldDescription] = useState('');

  const createWorld = useMutation({
    mutationFn: async () => {
      const world = await base44.entities.World.create({
        name: worldName || 'Mi Mundo',
        description: worldDescription,
        genre: selectedGenre,
        onboarding_completed: true,
      });

      // Crear tipos de ficha por defecto según género
      const defaultTypes = getDefaultTypes(selectedGenre);
      await Promise.all(defaultTypes.map(t =>
        base44.entities.CardType.create({ world_id: world.id, ...t })
      ));

      return world;
    },
    onSuccess: (world) => onComplete(world.id),
  });

  const toggleUseCase = (id) => {
    setSelectedUseCases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const steps = ['Casos de uso', 'Género', 'Nombre'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i <= step ? 'var(--text)' : 'var(--border)' }}
                />
                {i < steps.length - 1 && <div className="w-8 h-px" style={{ background: 'var(--border)' }} />}
              </div>
            ))}
          </div>
          <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 0: Casos de uso */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Lora, serif' }}>¿Con qué esperas que te ayude?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Selecciona todo lo que aplique</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {USE_CASES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => toggleUseCase(id)}
                  className="flex items-center gap-3 px-4 py-3 text-left text-sm transition-all"
                  style={{
                    background: selectedUseCases.includes(id) ? 'var(--text)' : 'var(--surface)',
                    color: selectedUseCases.includes(id) ? 'var(--accent-fg)' : 'var(--text)',
                    border: `1px solid ${selectedUseCases.includes(id) ? 'var(--text)' : 'var(--border)'}`,
                    borderRadius: '4px',
                  }}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Género */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Lora, serif' }}>¿Cuál es el género de tu mundo?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Define la atmósfera y los tipos de fichas por defecto</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8">
              {GENRES.map(({ name, icon, color }) => (
                <button
                  key={name}
                  onClick={() => setSelectedGenre(name)}
                  className="flex flex-col items-center gap-1.5 p-3 text-xs font-medium transition-all"
                  style={{
                    background: selectedGenre === name ? color + '33' : 'var(--surface)',
                    border: `1px solid ${selectedGenre === name ? color : 'var(--border)'}`,
                    color: selectedGenre === name ? 'var(--text)' : 'var(--text-muted)',
                    borderRadius: '4px',
                  }}
                >
                  <span className="text-2xl">{icon}</span>
                  {name}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1 px-4 py-2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedGenre}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
                style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Nombre */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Lora, serif' }}>Nombra tu mundo</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Puedes cambiarlo en cualquier momento</p>
            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              placeholder="El nombre de tu mundo..."
              className="w-full px-4 py-3 text-lg mb-4 focus:outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
                fontFamily: 'Lora, serif',
              }}
              autoFocus
            />
            <textarea
              value={worldDescription}
              onChange={(e) => setWorldDescription(e.target.value)}
              placeholder="Una breve descripción (opcional)..."
              rows={3}
              className="w-full px-4 py-3 text-sm mb-6 focus:outline-none resize-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '4px',
              }}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-4 py-2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <button
                onClick={() => createWorld.mutate()}
                disabled={!worldName.trim() || createWorld.isPending}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium disabled:opacity-40"
                style={{ background: 'var(--text)', color: 'var(--accent-fg)', borderRadius: '3px' }}
              >
                {createWorld.isPending ? 'Creando...' : 'Crear mundo ✨'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultTypes(genre) {
  const common = [
    { name: 'Character', icon: '👤', color: '#4A7DB5', sort_order: 0 },
    { name: 'Location', icon: '📍', color: '#6B8E3A', sort_order: 1 },
    { name: 'Event', icon: '📅', color: '#B8860B', sort_order: 2 },
    { name: 'Lore', icon: '📜', color: '#8B6914', sort_order: 3 },
  ];

  const byGenre = {
    Fantasy: [
      { name: 'Faction', icon: '⚔️', color: '#8B2020', sort_order: 4 },
      { name: 'Artifact', icon: '💎', color: '#9B59B6', sort_order: 5 },
      { name: 'Creature', icon: '🐉', color: '#27AE60', sort_order: 6 },
      { name: 'Magic', icon: '✨', color: '#3498DB', sort_order: 7 },
    ],
    'Sci-Fi': [
      { name: 'Faction', icon: '🏛️', color: '#8B2020', sort_order: 4 },
      { name: 'Technology', icon: '🤖', color: '#00CED1', sort_order: 5 },
      { name: 'Planet', icon: '🌍', color: '#27AE60', sort_order: 6 },
      { name: 'Ship', icon: '🚀', color: '#3498DB', sort_order: 7 },
    ],
    Horror: [
      { name: 'Creature', icon: '👻', color: '#8B2020', sort_order: 4 },
      { name: 'Artifact', icon: '🔮', color: '#9B59B6', sort_order: 5 },
      { name: 'Faction', icon: '💀', color: '#555', sort_order: 6 },
    ],
    Cyberpunk: [
      { name: 'Corporation', icon: '🏭', color: '#8B2020', sort_order: 4 },
      { name: 'Technology', icon: '💻', color: '#00CED1', sort_order: 5 },
      { name: 'Implant', icon: '🔧', color: '#9B59B6', sort_order: 6 },
    ],
  };

  return [...common, ...(byGenre[genre] || [
    { name: 'Faction', icon: '🏛️', color: '#8B2020', sort_order: 4 },
    { name: 'Item', icon: '🎒', color: '#9B59B6', sort_order: 5 },
  ])];
}