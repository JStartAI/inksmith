import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, FileText, Clock, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/i18n/LanguageContext';
import NewProjectDialog from '../components/dashboard/NewProjectDialog';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import moment from 'moment';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const statusColors = {
  planning:  { bg: '#2a2218', text: '#fbbf24' },
  drafting:  { bg: '#1a2844', text: '#60a5fa' },
  revising:  { bg: '#27183a', text: '#a78bfa' },
  editing:   { bg: '#2a1e16', text: '#fb923c' },
  complete:  { bg: '#152a1e', text: '#34d399' },
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
    <div className="min-h-screen" style={{ background: '#0d0d10' }}>
      {/* Header */}
      <header style={{ background: 'rgba(13,13,16,0.85)', borderBottom: '1px solid #1e1e28', backdropFilter: 'blur(12px)' }} className="sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f7ef7, #8b5cf6)' }}>
              <span className="text-white font-bold text-xs tracking-tight">IS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[15px] font-bold text-[#e2e2ea] tracking-tight">InkSmith</h1>
              <p className="text-[9px] text-[#52526a] tracking-widest uppercase">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to={createPageUrl('Settings')}>
              <button className="p-2 rounded-lg text-[#52526a] hover:text-[#8888a2] hover:bg-[#1a1a22] transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-[13px] font-medium transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #4f7ef7, #6d4ff7)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('dashboard.newProject')}</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: '#16161a' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onNew={() => setShowNewProject(true)} t={t} />
        ) : (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: lang === 'es' ? 'Proyectos' : 'Projects', value: projects.length, icon: BookOpen },
                { label: lang === 'es' ? 'Palabras totales' : 'Total words', value: totalWords.toLocaleString(), icon: FileText },
                { label: lang === 'es' ? 'Promedio' : 'Average', value: (projects.length ? Math.round(totalWords / projects.length) : 0).toLocaleString(), icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl px-4 py-3" style={{ background: '#16161a', border: '1px solid #1e1e28' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3 h-3 text-[#4f7ef7]" />
                    <p className="text-[10px] text-[#52526a] uppercase tracking-wider">{label}</p>
                  </div>
                  <p className="text-[22px] font-bold text-[#e2e2ea] tabular-nums leading-none">{value}</p>
                </div>
              ))}
            </div>

            {/* Section title */}
            <p className="text-[11px] font-semibold text-[#52526a] uppercase tracking-widest mb-4">
              {t('dashboard.projects')}
            </p>

            {/* Projects grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={(id) => deleteProject.mutate(id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Mobile bottom safe area */}
      <div className="h-6 sm:hidden" />

      <NewProjectDialog
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={(data) => createProject.mutate(data)}
      />
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  const status = statusColors[project.status] || statusColors.planning;

  return (
    <div
      className="group relative rounded-2xl p-5 transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
      style={{ background: '#16161a', border: '1px solid #1e1e28' }}
    >
      <Link to={createPageUrl('Workspace') + `?projectId=${project.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#1a2844' }}>
            <BookOpen className="w-4 h-4 text-[#4f7ef7]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: status.bg, color: status.text }}>
              {project.status?.replace(/_/g, ' ') || 'planning'}
            </span>
          </div>
        </div>

        <h3 className="text-[14px] font-semibold text-[#e2e2ea] mb-1 line-clamp-1 group-hover:text-[#4f7ef7] transition-colors">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-[12px] text-[#52526a] line-clamp-2 mb-3 leading-relaxed">{project.description}</p>
        )}

        <div className="flex items-center gap-3 text-[11px] text-[#52526a]">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {(project.word_count || 0).toLocaleString()}w
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {moment(project.updated_date).fromNow()}
          </span>
          <span className="ml-auto text-[10px] text-[#3a3a52]">
            {project.language === 'es' ? '🇪🇸' : '🇬🇧'}
          </span>
        </div>

        {project.target_word_count > 0 && (
          <div className="mt-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1e1e28' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((project.word_count || 0) / project.target_word_count) * 100)}%`,
                  background: 'linear-gradient(90deg, #4f7ef7, #8b5cf6)',
                }}
              />
            </div>
          </div>
        )}
      </Link>

      {/* Delete button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute top-4 right-4 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[#52526a] hover:text-[#e2e2ea] hover:bg-[#1e1e28]"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuItem className="text-red-500" onClick={() => onDelete(project.id)}>
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function EmptyState({ onNew, t }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #1a2844, #27183a)' }}>
        <BookOpen className="w-9 h-9 text-[#4f7ef7]" />
      </div>
      <h2 className="text-xl font-bold text-[#e2e2ea] mb-2">{t('dashboard.emptyTitle')}</h2>
      <p className="text-[#52526a] text-sm mb-8 max-w-xs leading-relaxed">{t('dashboard.emptySubtitle')}</p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #4f7ef7, #6d4ff7)' }}
      >
        <Plus className="w-4 h-4" />
        {t('dashboard.newProject')}
      </button>
    </div>
  );
}