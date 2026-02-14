import React from 'react';

export default function StatsCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`rounded-2xl border p-6 transition-all duration-200 hover:shadow-md ${
      accent 
        ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white' 
        : 'bg-white border-[var(--ink-border)] hover:border-[var(--ink-text-muted)]'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${accent ? 'bg-white/20' : 'bg-[var(--ink-warm)]'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-white' : 'text-[var(--ink-text-secondary)]'}`} />
        </div>
        <span className={`text-xs font-medium tracking-wide uppercase ${
          accent ? 'text-blue-100' : 'text-[var(--ink-text-muted)]'
        }`}>
          {label}
        </span>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-white' : 'text-[var(--ink-text)]'}`}>
        {value}
      </p>
    </div>
  );
}