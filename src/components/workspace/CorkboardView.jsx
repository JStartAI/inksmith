import React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const labelTopColors = {
  none: '#e8c96d',
  red: '#f87171',
  orange: '#fb923c',
  yellow: '#facc15',
  green: '#4ade80',
  blue: '#60a5fa',
  purple: '#c084fc',
};

const cardBg = {
  none: '#fffdf0',
  red: '#fff5f5',
  orange: '#fff8f0',
  yellow: '#fffdf0',
  green: '#f0fff4',
  blue: '#f0f8ff',
  purple: '#faf0ff',
};

const statusText = {
  todo: { label: 'To Do', color: '#9ca3af' },
  draft: { label: 'Draft', color: '#60a5fa' },
  revised: { label: 'Revised', color: '#a78bfa' },
  final: { label: 'Final', color: '#34d399' },
};

export default function CorkboardView({ documents, parentId, onSelect, selectedId }) {
  const { t } = useLanguage();
  const children = documents
    .filter(d => d.parent_id === parentId && d.type === 'document')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  if (children.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#e8e4dd' }}>
        <div className="text-center text-[#9c9690]">
          <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-sm">{t('common.noResults')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: '#e8e4dd' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children.map(doc => {
          const label = doc.label || 'none';
          const status = statusText[doc.status || 'todo'];
          const isSelected = selectedId === doc.id;

          return (
            <div
              key={doc.id}
              onClick={() => onSelect(doc)}
              className="group cursor-pointer rounded-sm shadow-sm hover:shadow-md transition-all duration-150"
              style={{
                background: cardBg[label],
                border: isSelected ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.08)',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Color top bar */}
              <div
                className="h-1.5 rounded-t-sm flex-shrink-0"
                style={{ background: labelTopColors[label] }}
              />

              {/* Card content */}
              <div className="flex-1 p-3.5">
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#aaa]" />
                  <h4 className="text-[13px] font-semibold text-[#1a1a1a] line-clamp-2 leading-snug">
                    {doc.title}
                  </h4>
                </div>
                <p className="text-[11.5px] text-[#666] line-clamp-5 leading-relaxed">
                  {doc.synopsis || doc.content?.replace(/<[^>]*>/g, '').slice(0, 180) || '—'}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3.5 py-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[10px] font-medium" style={{ color: status.color }}>
                  {status.label}
                </span>
                <span className="text-[10px] text-[#aaa] tabular-nums">
                  {doc.word_count || 0}w
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}