import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  Plus, MoreHorizontal, BookOpen, Search as SearchIcon, Users, Trash2, StickyNote
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '../i18n/LanguageContext';

const categoryIcons = {
  manuscript: BookOpen,
  research: SearchIcon,
  characters: Users,
  notes: StickyNote,
  front_matter: FileText,
  back_matter: FileText,
  trash: Trash2,
};

const categoryOrder = ['manuscript', 'research', 'notes'];

function TreeNode({ doc, documents, selectedId, onSelect, onAddChild, onDelete, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = doc.type === 'folder';
  const children = documents
    .filter(d => d.parent_id === doc.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const isSelected = selectedId === doc.id;
  const Icon = isFolder
    ? (expanded ? FolderOpen : Folder)
    : FileText;

  return (
    <div className="animate-slideIn">
      <div
        className={`group flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer transition-all text-sm ${
          isSelected
            ? 'bg-[var(--ink-accent-light)] text-[var(--ink-accent)]'
            : 'text-[var(--ink-text-secondary)] hover:bg-[var(--ink-surface-hover)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          onSelect(doc);
        }}
      >
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
        {!isFolder && <span className="w-4" />}
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[var(--ink-accent)]' : 'text-[var(--ink-text-muted)]'}`} />
        <span className="truncate flex-1 text-[13px]">{doc.title}</span>
        {doc.word_count > 0 && !isFolder && (
          <span className="text-[10px] text-[var(--ink-text-muted)] tabular-nums">{doc.word_count}</span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/5 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {isFolder && (
              <>
                <DropdownMenuItem onClick={() => onAddChild(doc.id, 'document')}>
                  <FileText className="w-3 h-3 mr-2" /> New Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild(doc.id, 'folder')}>
                  <Folder className="w-3 h-3 mr-2" /> New Folder
                </DropdownMenuItem>
              </>
            )}
            {!categoryOrder.includes(doc.category) || doc.parent_id ? (
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(doc.id)}>
                <Trash2 className="w-3 h-3 mr-2" /> Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isFolder && expanded && children.map(child => (
        <TreeNode
          key={child.id}
          doc={child}
          documents={documents}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function Binder({ documents, selectedId, onSelect, onAddChild, onDelete, projectTitle }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const rootFolders = documents
    .filter(d => !d.parent_id && d.type === 'folder')
    .sort((a, b) => {
      const orderA = categoryOrder.indexOf(a.category);
      const orderB = categoryOrder.indexOf(b.category);
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });

  const filtered = search
    ? documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="h-full flex flex-col bg-white border-r border-[var(--ink-border)]">
      <div className="p-3 border-b border-[var(--ink-border-subtle)]">
        <h2 className="text-sm font-semibold text-[var(--ink-text)] truncate mb-2">{projectTitle}</h2>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="h-8 pl-8 text-xs border-[var(--ink-border-subtle)] bg-[var(--ink-bg)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {filtered ? (
          filtered.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer text-sm ${
                selectedId === doc.id
                  ? 'bg-[var(--ink-accent-light)] text-[var(--ink-accent)]'
                  : 'text-[var(--ink-text-secondary)] hover:bg-[var(--ink-surface-hover)]'
              }`}
              onClick={() => { onSelect(doc); setSearch(''); }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate">{doc.title}</span>
            </div>
          ))
        ) : (
          rootFolders.map(folder => (
            <TreeNode
              key={folder.id}
              doc={folder}
              documents={documents}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}