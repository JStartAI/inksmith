import React from 'react';
import { FileText, GripVertical } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const labelBorders = {
  none: 'border-[var(--ink-border)]',
  red: 'border-red-300',
  orange: 'border-orange-300',
  yellow: 'border-yellow-300',
  green: 'border-green-300',
  blue: 'border-blue-300',
  purple: 'border-purple-300',
};

const statusDots = {
  todo: 'bg-gray-300',
  draft: 'bg-blue-400',
  revised: 'bg-purple-400',
  final: 'bg-green-400',
};

export default function CorkboardView({ documents, parentId, onSelect, selectedId }) {
  const { t } = useLanguage();
  const children = documents
    .filter(d => d.parent_id === parentId && d.type === 'document')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  if (children.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-[var(--ink-text-muted)]">
          <div className="w-12 h-12 rounded-xl bg-[var(--ink-warm)] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-sm">{t('common.noResults')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children.map(doc => (
          <div
            key={doc.id}
            onClick={() => onSelect(doc)}
            className={`group relative bg-[#fffdf7] rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedId === doc.id
                ? 'border-[var(--ink-accent)] shadow-md'
                : labelBorders[doc.label || 'none']
            }`}
            style={{ minHeight: '140px' }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-[var(--ink-text)] line-clamp-1 flex-1">
                {doc.title}
              </h4>
              <div className={`w-2 h-2 rounded-full ${statusDots[doc.status || 'todo']} flex-shrink-0 mt-1.5`} />
            </div>
            <p className="text-xs text-[var(--ink-text-secondary)] line-clamp-5 leading-relaxed">
              {doc.synopsis || (doc.content?.replace(/<[^>]*>/g, '').slice(0, 150)) || '...'}
            </p>
            <div className="absolute bottom-3 right-3 text-[10px] text-[var(--ink-text-muted)] tabular-nums">
              {doc.word_count || 0}w
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}