import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, FileText, Clock, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/i18n/LanguageContext';
import NewProjectDialog from '../components/dashboard/NewProjectDialog';
import OnboardingGate from '../components/dashboard/OnboardingGate';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import moment from 'moment';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS = {
  planning: 'Planificando',
  drafting: 'Borrando',
  revising: 'Revisando',
  editing: 'Editando',
  complete: 'Completo',
};

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const [showNewProject, setShowNewProject] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-updated_date'),
  });

  const createProject = useMutation({
    mutationFn: async (data) => {
      const project = await base44.entities.Project.create(data);
      const categories = ['manuscript', 'research', 'notes'];
      const titles = data.language === 'es'
        ? ['Manuscrito', 'Investigación', 'Notas']
        : ['Manuscript', 'Research', 'Notes'];
      await base44.entities.Document.bulkCreate(
        categories.map((cat, i) => ({
          project_id: project.id,
          title: titles[i],
          type: 'folder',
          category: cat,
          sort_order: i,
        }))
      );
      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowNewProject(false);
      navigate(createPageUrl('Workspace') + `?projectId=${project.id}`);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id) => {
      const docs = await base44.entities.Document.filter({ project_id: id });
      const chars = await base44.entities.Character.filter({ project_id: id });
      for (const doc of docs) await base44.entities.Document.delete(doc.id);
      for (const char of chars) await base44.entities.Character.delete(char.id);
      await base44.entities.Project.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const totalWords = projects.reduce((sum, p) => sum + (p.word_count || 0), 0);

  return (
    <OnboardingGate>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" style={{ color: 'var(--text)' }} />
              <h1 className="text-lg font-bold" style={{ color: 'var(--text)', fontFamily: "'Space Mono', monospace", letterSpacing: '-0.02em' }}>
                InkSmith
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to={createPageUrl('Settings')}>
                <button
                  className="p-2 rounded transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Configuración"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={() => setShowNewProject(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border transition-colors"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  borderColor: 'var(--accent)',
                }}
              >
                <Plus className="w-4 h-4" />
                {t('dashboard.newProject')}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onNew={() => setShowNewProject(true)} t={t} />
          ) : (
            <>
              {/* Stats */}
              <div className="flex gap-8 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <Stat label={lang === 'es' ? 'Proyectos' : 'Projects'} value={projects.length} />
                <Stat label={lang === 'es' ? 'Palabras totales' : 'Total words'} value={totalWords.toLocaleString()} />
              </div>

              {/* Projects list */}
              <div className="space-y-1">
                {projects.map(project => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onDelete={(id) => deleteProject.mutate(id)}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        <NewProjectDialog
          open={showNewProject}
          onClose={() => setShowNewProject(false)}
          onCreate={(data) => createProject.mutate(data)}
        />
      </div>
    </OnboardingGate>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text)', fontFamily: 'Lora, serif' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function ProjectRow({ project, onDelete }) {
  return (
    <Link to={createPageUrl('Workspace') + `?projectId=${project.id}`}>
      <div
        className="group flex items-center gap-4 px-4 py-3 rounded transition-colors cursor-pointer"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{project.title}</p>
          {project.description && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {(project.word_count || 0).toLocaleString()} palabras
          </span>
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            {moment(project.updated_date).fromNow()}
          </span>
          <span className="text-xs px-2 py-0.5 rounded border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            {STATUS_LABELS[project.status] || project.status}
          </span>
        </div>

        {/* Delete */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-500 cursor-pointer"
              onClick={e => { e.stopPropagation(); onDelete(project.id); }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}

function EmptyState({ onNew, t }) {
  return (
    <div className="text-center py-24">
      <BookOpen className="w-10 h-10 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)', fontFamily: 'Lora, serif' }}>
        {t('dashboard.emptyTitle')}
      </h2>
      <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {t('dashboard.emptySubtitle')}
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded border"
        style={{ background: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' }}
      >
        <Plus className="w-4 h-4" />
        {t('dashboard.newProject')}
      </button>
    </div>
  );
}