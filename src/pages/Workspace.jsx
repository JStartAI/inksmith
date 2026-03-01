import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Menu, X, ArrowLeft, Layout, Grid3X3, List, PenLine, Users, Sparkles, Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/i18n/LanguageContext';
import Binder from '../components/workspace/Binder';
import Editor from '../components/workspace/Editor';
import Inspector from '../components/workspace/Inspector';
import CorkboardView from '../components/workspace/CorkboardView';
import OutlinerView from '../components/workspace/OutlinerView';
import BackupManager from '../components/backup/BackupManager';

export default function Workspace() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('projectId');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // editor, corkboard, outliner
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => base44.entities.Document.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: snapshots = [] } = useQuery({
    queryKey: ['snapshots', selectedDoc?.id],
    queryFn: () => base44.entities.Snapshot.filter({ document_id: selectedDoc.id }),
    enabled: !!selectedDoc?.id,
  });

  const updateDoc = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', projectId] }),
  });

  const addChild = useMutation({
    mutationFn: ({ parentId, type }) => {
      const siblings = documents.filter(d => d.parent_id === parentId);
      return base44.entities.Document.create({
        project_id: projectId,
        parent_id: parentId,
        title: type === 'folder' ? 'New Folder' : 'Untitled',
        type,
        category: 'manuscript',
        sort_order: siblings.length,
      });
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      if (newDoc.type === 'document') setSelectedDoc(newDoc);
    },
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      if (selectedDoc?.id === deleteDoc.variables) setSelectedDoc(null);
    },
  });

  const createSnapshot = useMutation({
    mutationFn: () => base44.entities.Snapshot.create({
      document_id: selectedDoc.id,
      project_id: projectId,
      title: `Snapshot ${new Date().toLocaleString()}`,
      content: selectedDoc.content || '',
      word_count: selectedDoc.word_count || 0,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['snapshots', selectedDoc?.id] }),
  });

  const handleSaveDoc = useCallback((docId, data) => {
    updateDoc.mutate({ id: docId, data });
  }, []);

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    if (doc.type === 'document') setViewMode('editor');
    setMobileSidebar(false);
  };

  // Find the active parent folder for corkboard/outliner
  const activeParentId = selectedDoc?.type === 'folder' ? selectedDoc.id :
    selectedDoc?.parent_id || documents.find(d => d.category === 'manuscript' && !d.parent_id)?.id;

  // Recalculate total word count
  useEffect(() => {
    if (project && documents.length > 0) {
      const totalWords = documents.reduce((sum, d) => sum + (d.word_count || 0), 0);
      if (totalWords !== project.word_count) {
        base44.entities.Project.update(project.id, { word_count: totalWords });
      }
    }
  }, [documents]);

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to={createPageUrl('Dashboard')}>
          <Button>{t('common.back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#1c1c1e' }}>
      {/* Toolbar */}
      <header className="h-11 flex items-center justify-between px-2 flex-shrink-0" style={{ background: '#2c2c2e', borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-white/10 text-[#aaa] hover:text-white transition-colors md:hidden"
            onClick={() => setMobileSidebar(!mobileSidebar)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-[#aaa] hover:text-white transition-colors hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <Link to={createPageUrl('Dashboard')}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[#aaa] hover:text-white text-[12px] transition-colors">
              <ArrowLeft className="w-3 h-3" />
              {t('common.back')}
            </button>
          </Link>
          <span className="text-[12px] text-[#555] hidden md:inline ml-1">/ {project?.title}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* View mode */}
          <div className="flex items-center rounded overflow-hidden mr-2" style={{ border: '1px solid #444' }}>
            {[
              { mode: 'editor', icon: PenLine, label: t('workspace.editor') },
              { mode: 'corkboard', icon: Grid3X3, label: t('workspace.corkboard') },
              { mode: 'outliner', icon: List, label: t('workspace.outliner') },
            ].map(({ mode, icon: Icon, label }, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className="p-1.5 transition-colors"
                style={{
                  background: viewMode === mode ? '#2a5fa8' : 'transparent',
                  color: viewMode === mode ? '#fff' : '#888',
                  borderRight: i < 2 ? '1px solid #444' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <Link to={createPageUrl('Characters') + `?projectId=${projectId}`}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[#aaa] hover:text-white text-[12px] transition-colors hidden sm:flex">
              <Users className="w-3 h-3" />
              {t('workspace.characters')}
            </button>
          </Link>
          <Link to={createPageUrl('AIForge') + `?projectId=${projectId}`}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[#aaa] hover:text-white text-[12px] transition-colors hidden sm:flex">
              <Sparkles className="w-3 h-3" />
              {t('aiforge.title')}
            </button>
          </Link>
          <Link to={createPageUrl('Compiler') + `?projectId=${projectId}`}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[#aaa] hover:text-white text-[12px] transition-colors hidden sm:flex">
              <Download className="w-3 h-3" />
              {t('compiler.export')}
            </button>
          </Link>

          <BackupManager projectId={projectId} projectTitle={project?.title || ''} />

          <button
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: inspectorOpen ? '#60a5fa' : '#888' }}
            onClick={() => setInspectorOpen(!inspectorOpen)}
          >
            <Layout className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {mobileSidebar && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileSidebar(false)} />
        )}

        {/* Binder */}
        <div className={`
          ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarOpen ? 'md:w-60 lg:w-64' : 'md:w-0 md:overflow-hidden'}
          fixed md:static inset-y-12 left-0 w-64 z-50 md:z-auto
          transition-all duration-200 flex-shrink-0
        `}>
          <Binder
            documents={documents}
            selectedId={selectedDoc?.id}
            onSelect={handleSelectDoc}
            onAddChild={(parentId, type) => addChild.mutate({ parentId, type })}
            onDelete={(id) => deleteDoc.mutate(id)}
            projectTitle={project?.title || ''}
          />
        </div>

        {/* Editor / View area */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'editor' && (
            <Editor
              document={selectedDoc?.type === 'document' ? selectedDoc : null}
              onSave={handleSaveDoc}
            />
          )}
          {viewMode === 'corkboard' && (
            <CorkboardView
              documents={documents}
              parentId={activeParentId}
              onSelect={handleSelectDoc}
              selectedId={selectedDoc?.id}
            />
          )}
          {viewMode === 'outliner' && (
            <OutlinerView
              documents={documents}
              parentId={activeParentId}
              onSelect={handleSelectDoc}
              selectedId={selectedDoc?.id}
            />
          )}
        </div>

        {/* Inspector */}
        {inspectorOpen && selectedDoc?.type === 'document' && (
          <div className="w-64 lg:w-72 flex-shrink-0 hidden md:block">
            <Inspector
              document={selectedDoc}
              onSave={handleSaveDoc}
              snapshots={snapshots}
              onCreateSnapshot={() => createSnapshot.mutate()}
            />
          </div>
        )}
      </div>
    </div>
  );
}