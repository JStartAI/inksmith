import React from 'react';
import { FileText, Folder } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const statusConfig = {
  todo: { label: 'To Do', bg: '#f3f4f6', text: '#6b7280' },
  draft: { label: 'Draft', bg: '#dbeafe', text: '#1d4ed8' },
  revised: { label: 'Revised', bg: '#ede9fe', text: '#6d28d9' },
  final: { label: 'Final', bg: '#d1fae5', text: '#065f46' },
};

const labelDots = {
  none: '',
  red: '#f87171',
  orange: '#fb923c',
  yellow: '#fbbf24',
  green: '#34d399',
  blue: '#60a5fa',
  purple: '#c084fc',
};

export default function OutlinerView({ documents, parentId, onSelect, selectedId }) {
  const { t } = useLanguage();
  const children = documents
    .filter(d => d.parent_id === parentId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="flex-1 overflow-auto" style={{ background: '#faf9f7' }}>
      {/* Header */}
      <div
        className="grid text-[11px] font-semibold uppercase tracking-wider text-[#9c9690] px-4 py-2 sticky top-0"
        style={{ 
          gridTemplateColumns: '2fr 1fr 90px 60px 80px',
          background: '#f0ede8',
          borderBottom: '1px solid #e0ddd8',
        }}
      >
        <span>Título</span>
        <span>Sinopsis</span>
        <span>Estado</span>
        <span className="text-center">Label</span>
        <span className="text-right">Palabras</span>
      </div>

      {/* Rows */}
      <div>
        {children.length === 0 && (
          <div className="text-center py-12 text-[#9c9690] text-sm">Sin documentos</div>
        )}
        {children.map((doc, i) => {
          const isSelected = selectedId === doc.id;
          const status = statusConfig[doc.status || 'todo'];
          const isFolder = doc.type === 'folder';

          return (
            <div
              key={doc.id}
              onClick={() => onSelect(doc)}
              className="grid items-center px-4 py-2.5 cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: '2fr 1fr 90px 60px 80px',
                background: isSelected ? '#dbeafe' : i % 2 === 0 ? '#ffffff' : '#faf9f7',
                borderBottom: '1px solid #f0ede8',
              }}
            >
              {/* Title */}
              <div className="flex items-center gap-2 min-w-0">
                {isFolder
                  ? <Folder className="w-3.5 h-3.5 flex-shrink-0 text-[#aaa]" />
                  : <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#bbb]" />
                }
                <span className={`text-[13px] truncate ${isFolder ? 'font-semibold text-[#333]' : 'text-[#1a1a1a]'}`}>
                  {doc.title}
                </span>
              </div>

              {/* Synopsis */}
              <span className="text-[11.5px] text-[#888] truncate pr-3">
                {doc.synopsis || '—'}
              </span>

              {/* Status */}
              <div>
                {!isFolder && (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                )}
              </div>

              {/* Label dot */}
              <div className="flex justify-center">
                {doc.label && doc.label !== 'none' && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: labelDots[doc.label] }}
                  />
                )}
              </div>

              {/* Word count */}
              <div className="text-right text-[11px] text-[#aaa] tabular-nums">
                {!isFolder && doc.word_count ? doc.word_count.toLocaleString() : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}