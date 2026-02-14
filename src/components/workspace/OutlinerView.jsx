import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../i18n/LanguageContext';

const statusColors = {
  todo: 'bg-gray-100 text-gray-600',
  draft: 'bg-blue-100 text-blue-700',
  revised: 'bg-purple-100 text-purple-700',
  final: 'bg-green-100 text-green-700',
};

const labelDots = {
  none: '',
  red: 'bg-red-400',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
};

export default function OutlinerView({ documents, parentId, onSelect, selectedId }) {
  const { t } = useLanguage();
  const children = documents
    .filter(d => d.parent_id === parentId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="flex-1 overflow-auto p-4">
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--ink-border-subtle)]">
            <TableHead className="text-xs font-medium text-[var(--ink-text-muted)]">Title</TableHead>
            <TableHead className="text-xs font-medium text-[var(--ink-text-muted)] w-24">Words</TableHead>
            <TableHead className="text-xs font-medium text-[var(--ink-text-muted)] w-24">Status</TableHead>
            <TableHead className="text-xs font-medium text-[var(--ink-text-muted)] w-20">Label</TableHead>
            <TableHead className="text-xs font-medium text-[var(--ink-text-muted)]">Synopsis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {children.map(doc => (
            <TableRow
              key={doc.id}
              onClick={() => onSelect(doc)}
              className={`cursor-pointer transition-colors ${
                selectedId === doc.id ? 'bg-[var(--ink-accent-light)]' : 'hover:bg-[var(--ink-surface-hover)]'
              }`}
            >
              <TableCell className="text-sm font-medium">{doc.title}</TableCell>
              <TableCell className="text-xs tabular-nums text-[var(--ink-text-muted)]">
                {(doc.word_count || 0).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={`text-[10px] ${statusColors[doc.status || 'todo']}`}>
                  {doc.status || 'todo'}
                </Badge>
              </TableCell>
              <TableCell>
                {doc.label && doc.label !== 'none' && (
                  <div className={`w-4 h-4 rounded-full ${labelDots[doc.label]}`} />
                )}
              </TableCell>
              <TableCell className="text-xs text-[var(--ink-text-muted)] truncate max-w-[200px]">
                {doc.synopsis || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}