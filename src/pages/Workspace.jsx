import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Menu, X, ArrowLeft, Layout, Grid3X3, List, PenLine, Users, Sparkles, Download, CheckSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/i18n/LanguageContext';
import Binder from '../components/workspace/Binder';
import Editor from '../components/workspace/Editor';
import Inspector from '../components/workspace/Inspector';
import CorkboardView from '../components/workspace/CorkboardView';
import OutlinerView from '../components/workspace/OutlinerView';
import PlotView from '../components/workspace/PlotView';
import BackupManager from '../components/backup/BackupManager';
import CorrectionMode from '../components/workspace/CorrectionMode';
import VoiceControl from '../components/workspace/VoiceControl';
import VoiceCommandGuide from '../components/workspace/VoiceCommandGuide';
import VoiceAssistant from '../components/workspace/VoiceAssistant';

export default function Workspace() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('projectId');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewMode, setViewMode] = useState('editor');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [minimalMode, setMinimalMode] = useState(false);

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

  const { data: characters = [] } = useQuery({
    queryKey: ['characters', projectId],
    queryFn: () => base44.entities.Character.filter({ project_id: projectId }),
    enabled: !!projectId,
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

  const handleVoiceCommand = (cmd) => {
    switch(cmd) {
      case 'save':
        if (selectedDoc?.type === 'document') {
          handleSaveDoc(selectedDoc.id, selectedDoc);
        }
        break;
      case 'new-doc':
      case 'new-document':
        const parentId = selectedDoc?.id || documents.find(d => d.category === 'manuscript' && !d.parent_id)?.id;
        addChild.mutate({ parentId, type: 'document' });
        break;
      case 'new-character':
        window.location.href = createPageUrl('Characters') + `?projectId=${projectId}`;
        break;
      case 'minimal-mode':
        setMinimalMode(true);
        setSidebarOpen(false);
        setInspectorOpen(false);
        break;
      case 'normal-mode':
      case 'exit-minimal':
        setMinimalMode(false);
        break;
      case 'toggle-inspector':
        setInspectorOpen(!inspectorOpen);
        break;
      case 'plot-view':
      case 'go-plot':
        setViewMode('plot');
        break;
      case 'corkboard-view':
      case 'go-corkboard':
        setViewMode('corkboard');
        break;
      case 'editor-view':
      case 'go-editor':
        setViewMode('editor');
        break;
      case 'go-outliner':
        setViewMode('outliner');
        break;
      case 'go-correction':
        setViewMode('correction');
        break;
      case 'go-characters':
        window.location.href = createPageUrl('Characters') + `?projectId=${projectId}`;
        break;
      case 'go-aiforge':
        window.location.href = createPageUrl('AIForge') + `?projectId=${projectId}`;
        break;
      case 'go-compiler':
        window.location.href = createPageUrl('Compiler') + `?projectId=${projectId}`;
        break;
      case 'create-snapshot':
        if (selectedDoc?.type === 'document') {
          createSnapshot.mutate();
        }
        break;
    }
  };

  const handleVoiceTranscript = (text) => {
    if (viewMode === 'editor' && selectedDoc?.type === 'document') {
      const currentContent = selectedDoc.content || '';
      const updatedContent = currentContent + '\n' + text;
      handleSaveDoc(selectedDoc.id, { ...selectedDoc, content: updatedContent });
    }
  };

  const activeParentId = selectedDoc?.type === 'folder' ? selectedDoc.id :
    selectedDoc?.parent_id || documents.find(d => d.category === 'manuscript' && !d.parent_id)?.id;

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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: minimalMode ? '#0f0f0f' : '#1e2122' }}>
      <header className={`h-11 flex items-center justify-between px-2 flex-shrink-0 transition-all duration-200 ${minimalMode ? 'opacity-0 h-0 pointer-events-none' : ''}`} style={{ background: '#272b2c', borderBottom: '1px solid #363a3b' }}>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-black/10 text-[#9e9a94] hover:text-[#d8d4cc] transition-colors md:hidden"
            onClick={() => setMobileSidebar(!mobileSidebar)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-black/10 text-[#9e9a94] hover:text-[#d8d4cc] transition-colors hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <Link to={createPageUrl('Dashboard')}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/10 text-[#9e9a94] hover:text-[#d8d4cc] text-[12px] transition-colors">
              <ArrowLeft className="w-3 h-3" />
              {t('common.back')}
            </button>
          </Link>
          <span className="text-[12px] text-[#6e6a64] hidden md:inline ml-1">/ {project?.title}</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center rounded overflow-hidden mr-2" style={{ border: '1px solid #505558' }}>
            {[
              { mode: 'editor', icon: PenLine, label: t('workspace.editor') },
              { mode: 'plot', icon: Sparkles, label: 'Trama' },
              { mode: 'corkboard', icon: Grid3X3, label: t('workspace.corkboard') },
              { mode: 'outliner', icon: List, label: t('workspace.outliner') },
              { mode: 'correction', icon: CheckSquare, label: 'Corrección' },
            ].map(({ mode, icon: Icon, label }, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className="p-1.5 transition-colors"
                style={{
                  background: viewMode === mode ? '#5a8fa8' : 'transparent',
                  color: viewMode === mode ? '#fff' : '#9e9a94',
                  borderRight: i < 4 ? '1px solid #505558' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <Link to={createPageUrl('Characters') + `?projectId=${projectId}`}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/10 text-[#9e9a94] hover:text-[#d8d4cc] text-[12px] transition-colors hidden sm:flex">
              <Users className="w-3 h-3" />
              {t('workspace.characters')}
            </button>
          </Link>
          <Link to={createPageUrl('AIForge') + `?projectId=${projectId}`}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/10 text-[#9e9a94] hover:text-[#d8d4cc] text-[12px] transition-colors hidden sm:flex">
              <Sparkles className="w-3 h-3" />
              {t('aiforge.title')}
            </button>
          </Link>
          <Link to={createPageUrl('Compiler') + `?projectId=${projectId}`}>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/10 text-[#9e9a94] hover:text-[#d8d4cc] text-[12px] transition-colors hidden sm:flex">
              <Download className="w-3 h-3" />
              {t('compiler.export')}
            </button>
          </Link>

          <BackupManager projectId={projectId} projectTitle={project?.title || ''} />

          <VoiceCommandGuide />

          <VoiceControl 
            onCommand={handleVoiceCommand}
            onTranscript={handleVoiceTranscript}
          />

          <VoiceAssistant 
            projectId={projectId}
            projectTitle={project?.title || ''}
            onCommandExecute={handleVoiceCommand}
          />

          <button
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: inspectorOpen ? '#7ba7bc' : '#9e9a94' }}
            onClick={() => setInspectorOpen(!inspectorOpen)}
          >
            <Layout className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {mobileSidebar && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileSidebar(false)} />
        )}

        <div className={`
          ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarOpen && !minimalMode ? 'md:w-60 lg:w-64' : 'md:w-0 md:overflow-hidden'}
          ${minimalMode ? 'hidden' : ''}
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

        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'editor' && (
            <Editor
              document={selectedDoc?.type === 'document' ? selectedDoc : null}
              onSave={handleSaveDoc}
              onMinimalToggle={(isMinimal) => {
                setMinimalMode(isMinimal);
                if (isMinimal) {
                  setSidebarOpen(false);
                  setInspectorOpen(false);
                }
              }}
            />
          )}
          {viewMode === 'plot' && (
            <PlotView
              documents={documents}
              characters={characters}
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
          {viewMode === 'correction' && (
            <CorrectionMode
              document={selectedDoc?.type === 'document' ? selectedDoc : null}
            />
          )}
        </div>

        {inspectorOpen && selectedDoc?.type === 'document' && !minimalMode && (
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