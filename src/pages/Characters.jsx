import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/i18n/LanguageContext';
import CharacterCard from '../components/characters/CharacterCard';
import CharacterWizard from '../components/characters/CharacterWizard';
import CharacterDetail from '../components/characters/CharacterDetail';

export default function Characters() {
  const { t } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('projectId');
  const queryClient = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (data) => data[0],
    enabled: !!projectId,
  });

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', projectId],
    queryFn: () => base44.entities.Character.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const createChar = useMutation({
    mutationFn: (data) => base44.entities.Character.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', projectId] });
      setShowWizard(false);
    },
  });

  const updateChar = useMutation({
    mutationFn: (data) => base44.entities.Character.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', projectId] });
      setSelectedChar(null);
    },
  });

  const deleteChar = useMutation({
    mutationFn: (id) => base44.entities.Character.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters', projectId] });
      setSelectedChar(null);
    },
  });

  return (
    <div className="min-h-screen bg-[var(--ink-bg)]">
      <header className="border-b border-[var(--ink-border)] bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Workspace') + `?projectId=${projectId}`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <ArrowLeft className="w-3 h-3" />
                {t('common.back')}
              </Button>
            </Link>
            <span className="text-xs text-[var(--ink-text-muted)]">/ {project?.title} / {t('characters.title')}</span>
          </div>
          <Button
            onClick={() => setShowWizard(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 text-sm shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('characters.forge')}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white border animate-pulse" />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-6">
              <Users className="w-9 h-9 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--ink-text)] mb-2">{t('characters.empty')}</h2>
            <p className="text-sm text-[var(--ink-text-muted)] text-center max-w-sm mb-6">{t('characters.emptyDesc')}</p>
            <Button onClick={() => setShowWizard(true)} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" />
              {t('characters.forge')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {characters.map(char => (
              <CharacterCard key={char.id} character={char} onClick={() => setSelectedChar(char)} />
            ))}
          </div>
        )}
      </main>

      <CharacterWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreate={(data) => createChar.mutate(data)}
        projectLang={project?.language}
      />

      <CharacterDetail
        character={selectedChar}
        open={!!selectedChar}
        onClose={() => setSelectedChar(null)}
        onUpdate={(data) => updateChar.mutate(data)}
        onDelete={(id) => deleteChar.mutate(id)}
      />
    </div>
  );
}