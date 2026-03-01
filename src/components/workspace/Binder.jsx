import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  Plus, MoreHorizontal, BookOpen, Search as SearchIcon, StickyNote, Trash2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '../i18n/LanguageContext';

const categoryIcons = {
  manuscript: BookOpen,
  research: SearchIcon,
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
  const Icon = isFolder ? (expanded ? FolderOpen : Folder) : FileText;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-[5px] px-2 cursor-pointer transition-colors text-sm rounded-sm ${
          isSelected
            ? 'text-white'
            : 'text-[#b0aca4] hover:text-[#d8d4cc]'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          onSelect(doc);
        }}
      >
        {isFolder ? (
          <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 opacity-60">
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#6e6a64]'}`} />
        <span className={`truncate flex-1 text-[12.5px] leading-none ${isFolder ? 'font-medium' : ''}`}>
          {doc.title}
        </span>
        {doc.word_count > 0 && !isFolder && (
          <span className={`text-[10px] tabular-nums flex-shrink-0 ${isSelected ? 'text-blue-200' : 'text-[#555]'}`}>
            {doc.word_count}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {isFolder && (
              <>
                <DropdownMenuItem onClick={() => onAddChild(doc.id, 'document')}>
                  <FileText className="w-3 h-3 mr-2" /> Nuevo documento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild(doc.id, 'folder')}>
                  <Folder className="w-3 h-3 mr-2" /> Nueva carpeta
                </DropdownMenuItem>
              </>
            )}
            {(!categoryOrder.includes(doc.category) || doc.parent_id) ? (
              <DropdownMenuItem className="text-red-500" onClick={() => onDelete(doc.id)}>
                <Trash2 className="w-3 h-3 mr-2" /> Eliminar
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
    <div className="h-full flex flex-col" style={{ background: '#2a2d2e', borderRight: '1px solid #404446' }}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2" style={{ borderBottom: '1px solid #404446' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6e6a64] mb-2 px-1">Binder</p>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-7 pl-7 pr-2 text-[12px] rounded-sm outline-none text-[#b0aca4] placeholder-[#6e6a64] bg-[#333638] border border-[#505558]"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1 px-1">
        {filtered ? (
          filtered.map(doc => (
            <div
              key={doc.id}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-sm cursor-pointer text-[12.5px] ${
                selectedId === doc.id
                  ? 'bg-[#4a7a96] text-white'
                  : 'text-[#b0aca4] hover:bg-[#333638] hover:text-[#d8d4cc]'
              }`}
              onClick={() => { onSelect(doc); setSearch(''); }}
            >
              <FileText className="w-3.5 h-3.5 text-[#6e6a64]" />
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

      {/* Footer word count */}
      <div style={{ borderTop: '1px solid #404446' }} className="px-3 py-2">
        <p className="text-[10px] text-[#6e6a64]">
          {documents.filter(d => d.type === 'document').length} documentos
        </p>
      </div>
    </div>
  );
}