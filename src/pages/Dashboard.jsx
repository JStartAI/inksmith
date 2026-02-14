import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, FileText, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/i18n/LanguageContext';
import StatsCard from '../components/dashboard/StatsCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';
import NewProjectDialog from '../components/dashboard/NewProjectDialog';

export default function Dashboard() {
  const { t, lang, setLang } = useLanguage();
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
      // Create default folders
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
    <div className="min-h-screen bg-[var(--ink-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--ink-border)] bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--ink-text)] tracking-tight">InkSmith</h1>
              <p className="text-[10px] text-[var(--ink-text-muted)] tracking-wide uppercase">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="text-xs gap-1.5 text-[var(--ink-text-secondary)]"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'ES' : 'EN'}
            </Button>
            <Button
              onClick={() => setShowNewProject(true)}
              className="bg-[var(--ink-accent)] hover:bg-[var(--ink-accent-hover)] text-white rounded-xl h-9 px-4 text-sm shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t('dashboard.newProject')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-[var(--ink-border)] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyDashboard onNewProject={() => setShowNewProject(true)} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              <StatsCard icon={BookOpen} label={t('dashboard.activeProjects')} value={projects.length} accent />
              <StatsCard icon={FileText} label={t('dashboard.totalWords')} value={totalWords.toLocaleString()} />
              <div className="hidden md:block">
                <StatsCard 
                  icon={FileText} 
                  label={lang === 'es' ? 'Promedio por proyecto' : 'Avg per project'} 
                  value={projects.length > 0 ? Math.round(totalWords / projects.length).toLocaleString() : '0'} 
                />
              </div>
            </div>

            {/* Projects grid */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[var(--ink-text-secondary)] uppercase tracking-wide">
                {t('dashboard.projects')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}