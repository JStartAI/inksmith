import React, { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';

// Simple force-directed graph using SVG + requestAnimationFrame
function useForceSimulation(nodes, links, width, height) {
  const posRef = useRef({});
  const velRef = useRef({});
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!nodes.length) return;

    // Initialize positions
    nodes.forEach((n, i) => {
      if (!posRef.current[n.id]) {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const r = Math.min(width, height) * 0.3;
        posRef.current[n.id] = {
          x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 50,
          y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 50,
        };
        velRef.current[n.id] = { vx: 0, vy: 0 };
      }
    });

    let frame;
    let iter = 0;
    const MAX_ITER = 300;

    const tick = () => {
      if (iter++ > MAX_ITER) return;
      const pos = posRef.current;
      const vel = velRef.current;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = pos[b.id].x - pos[a.id].x;
          const dy = pos[b.id].y - pos[a.id].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -2000 / (dist * dist);
          vel[a.id].vx += (force * dx) / dist;
          vel[a.id].vy += (force * dy) / dist;
          vel[b.id].vx -= (force * dx) / dist;
          vel[b.id].vy -= (force * dy) / dist;
        }
      }

      // Attraction (links)
      links.forEach(({ source, target }) => {
        if (!pos[source] || !pos[target]) return;
        const dx = pos[target].x - pos[source].x;
        const dy = pos[target].y - pos[source].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.05;
        vel[source].vx += (force * dx) / dist;
        vel[source].vy += (force * dy) / dist;
        vel[target].vx -= (force * dx) / dist;
        vel[target].vy -= (force * dy) / dist;
      });

      // Gravity toward center
      nodes.forEach(n => {
        vel[n.id].vx += (width / 2 - pos[n.id].x) * 0.005;
        vel[n.id].vy += (height / 2 - pos[n.id].y) * 0.005;
      });

      // Apply velocity with damping
      nodes.forEach(n => {
        vel[n.id].vx *= 0.85;
        vel[n.id].vy *= 0.85;
        pos[n.id].x = Math.max(40, Math.min(width - 40, pos[n.id].x + vel[n.id].vx));
        pos[n.id].y = Math.max(40, Math.min(height - 40, pos[n.id].y + vel[n.id].vy));
      });

      if (iter % 10 === 0) setPositions({ ...pos });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [nodes.length, links.length, width, height]);

  return positions;
}

export default function WorldGraph({ worldId, onCardSelect }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', worldId],
    queryFn: () => base44.entities.Card.filter({ world_id: worldId }),
    enabled: !!worldId,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(el);
    setDimensions({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Build graph data
  const types = [...new Set(cards.map(c => c.type_name).filter(Boolean))];
  const filteredCards = cards.filter(c =>
    (!filterType || c.type_name === filterType) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Build links from relational properties
  const links = [];
  cards.forEach(card => {
    (card.properties || []).forEach(prop => {
      if (prop.type === 'Referencia' && prop.ref_card_id) {
        const targetExists = filteredCards.find(c => c.id === prop.ref_card_id);
        const sourceExists = filteredCards.find(c => c.id === card.id);
        if (sourceExists && targetExists) {
          links.push({ source: card.id, target: prop.ref_card_id, label: prop.name });
        }
      }
    });
  });

  const nodes = filteredCards.map(c => ({ id: c.id, name: c.name, icon: c.type_icon || '📄', type: c.type_name }));
  const positions = useForceSimulation(nodes, links, dimensions.width, dimensions.height);

  const highlightIds = search
    ? new Set(filteredCards.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => c.id))
    : null;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2 px-2 py-1.5 flex-1 max-w-xs" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '3px' }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ficha..."
            className="flex-1 bg-transparent text-xs focus:outline-none"
            style={{ color: 'var(--text)' }}
          />
          {search && <button onClick={() => setSearch('')}><X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /></button>}
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-xs px-2 py-1.5 focus:outline-none"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '3px' }}
        >
          <option value="">Todos los tipos</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
          {filteredCards.length} fichas · {links.length} conexiones
        </span>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {filteredCards.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-4xl mb-3">🔗</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {cards.length === 0
                  ? 'Crea fichas para ver el grafo de conexiones'
                  : 'Sin resultados para este filtro'}
              </p>
            </div>
          </div>
        ) : (
          <svg width={dimensions.width} height={dimensions.height}>
            {/* Links */}
            {links.map((link, i) => {
              const s = positions[link.source];
              const t = positions[link.target];
              if (!s || !t) return null;
              return (
                <g key={i}>
                  <line
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke="var(--border)"
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                  />
                  <text
                    x={(s.x + t.x) / 2}
                    y={(s.y + t.y) / 2 - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--text-muted)"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = positions[node.id];
              if (!pos) return null;
              const isHighlighted = !highlightIds || highlightIds.has(node.id);
              const isSelected = selectedNode === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNode(isSelected ? null : node.id);
                    if (onCardSelect) onCardSelect(node.id);
                  }}
                  style={{ opacity: isHighlighted ? 1 : 0.3 }}
                >
                  <circle
                    r={isSelected ? 26 : 22}
                    fill="var(--surface)"
                    stroke={isSelected ? 'var(--text)' : 'var(--border)'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text textAnchor="middle" dominantBaseline="middle" fontSize="16">
                    {node.icon}
                  </text>
                  <text
                    y={32}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-secondary)"
                    style={{ fontFamily: 'Lora, serif' }}
                  >
                    {node.name.length > 14 ? node.name.slice(0, 12) + '…' : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}