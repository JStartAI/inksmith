import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Globe, Home, BookOpen } from 'lucide-react';
import WorldHome from '../components/worldeditor/WorldHome';
import WorldCards from '../components/worldeditor/WorldCards';

export default function WorldEditor() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const worldId = params.get('worldId');
  const [activeTab, setActiveTab] = useState('home');

  const { data: world } = useQuery({
    queryKey: ['world', worldId],
    queryFn: () => base44.entities.World.filter({ id: worldId }).then(r => r[0]),
    enabled: !!worldId,
  });

  if (!worldId) {
    navigate('/worlds');
    return null;
  }

  const tabs = [
    { id: 'home', label: 'Inicio', Icon: Home },
    { id: 'world', label: 'Mundo', Icon: Globe },
    { id: 'writing', label: 'Escritura', Icon: BookOpen },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Bar */}
      <header className="h-11 flex-shrink-0 flex items-center justify-between px-4" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {/* Left: World name */}
        <button
          onClick={() => navigate('/worlds')}
          className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'Lora, serif' }}
        >
          <Globe className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <span className="font-medium">{world?.name || '...'}</span>
          {world?.genre && (
            <span className="text-xs px-1.5 py-0.5" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', borderRadius: '2px', fontFamily: "'Space Mono', monospace" }}>
              {world.genre}
            </span>
          )}
        </button>

        {/* Center: Tabs */}
        <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                color: activeTab === id ? 'var(--text)' : 'var(--text-muted)',
                background: activeTab === id ? 'var(--bg-subtle)' : 'transparent',
                borderRadius: '3px',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Right: empty for now */}
        <div className="w-32" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && <WorldHome world={world} worldId={worldId} />}
        {activeTab === 'world' && <WorldCards worldId={worldId} />}
        {activeTab === 'writing' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p style={{ color: 'var(--text-muted)' }}>Próximamente — Editor de escritura</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}