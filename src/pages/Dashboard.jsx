import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, FileText, Clock, MoreHorizontal, Settings, Trash2, Sparkles, ArrowRight } from 'lucide-react';
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

const statusColors = {
  planning:  { bg: '#fef08a', text: '#78350f' },
  drafting:  { bg: '#bfdbfe', text: '#0c2d6b' },
  revising:  { bg: '#e9d5ff', text: '#4c0519' },
  editing:   { bg: '#fed7aa', text: '#7c2d12' },
  complete:  { bg: '#bbf7d0', text: '#022c22' },
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#334155', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">InkSmith</h1>
              <p className="text-xs text-blue-300 font-semibold tracking-widest uppercase">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to={createPageUrl('Settings')}>
              <button className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('dashboard.newProject')}</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onNew={() => setShowNewProject(true)} t={t} />
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { label: lang === 'es' ? 'Proyectos activos' : 'Active projects', value: projects.length, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
                { label: lang === 'es' ? 'Palabras totales' : 'Total words', value: totalWords.toLocaleString(), icon: FileText, color: 'from-purple-500 to-purple-600' },
                { label: lang === 'es' ? 'Promedio por proyecto' : 'Avg per project', value: (projects.length ? Math.round(totalWords / projects.length) : 0).toLocaleString(), icon: Clock, color: 'from-pink-500 to-pink-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl p-6 border" style={{ background: 'rgba(30, 41, 59, 0.5)', borderColor: '#475569' }}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2">{label}</p>
                  <p className="text-3xl font-black text-white leading-none">{value}</p>
                </div>
              ))}
            </div>

            {/* Section title */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-2">{t('dashboard.projects')}</h2>
              <div className="h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
            </div>

            {/* Projects grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <NewProjectDialog
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={(data) => createProject.mutate(data)}
      />
    </div>
    </OnboardingGate>
  );
}

function ProjectCard({ project, onDelete }) {
  const status = statusColors[project.status] || statusColors.planning;

  return (
    <Link to={createPageUrl('Workspace') + `?projectId=${project.id}`}>
      <div
        className="group relative rounded-xl p-6 transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border h-full flex flex-col"
        style={{ background: 'rgba(30, 41, 59, 0.6)', borderColor: '#475569' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full capitalize" style={{ background: status.bg, color: status.text }}>
              {project.status?.replace(/_/g, ' ') || 'planning'}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-black text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed flex-grow">{project.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-semibold">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {(project.word_count || 0).toLocaleString()}w
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {moment(project.updated_date).fromNow()}
          </span>
          <span className="ml-auto">
            {project.language === 'es' ? '🇪🇸' : '🇬🇧'}
          </span>
        </div>

        {project.target_word_count > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-300">Progress</span>
              <span className="text-xs text-slate-400">{Math.min(100, Math.round(((project.word_count || 0) / project.target_word_count) * 100))}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#334155' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((project.word_count || 0) / project.target_word_count) * 100)}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Abrir</span>
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* Delete button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white hover:bg-slate-700/50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem 
              className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
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
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl">
        <BookOpen className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-3xl font-black text-white mb-3">{t('dashboard.emptyTitle')}</h2>
      <p className="text-slate-400 text-base mb-10 max-w-sm leading-relaxed">{t('dashboard.emptySubtitle')}</p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-8 py-3 rounded-lg text-white font-bold transition-all hover:shadow-lg hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
      >
        <Plus className="w-5 h-5" />
        {t('dashboard.newProject')}
      </button>
    </div>
  );
}