import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ArrowLeft, Download, FileText, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/i18n/LanguageContext';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export default function Compiler() {
  const { t, lang } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('projectId');
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [exported, setExported] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    select: (d) => d[0],
    enabled: !!projectId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => base44.entities.Document.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const manuscriptFolder = documents.find(d => d.category === 'manuscript' && !d.parent_id);
  const manuscriptDocs = documents
    .filter(d => d.type === 'document' && d.category === 'manuscript')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const toggleDoc = (id) => {
    const next = new Set(selectedDocs);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedDocs(next);
  };

  const toggleAll = () => {
    if (selectedDocs.size === manuscriptDocs.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(manuscriptDocs.map(d => d.id)));
    }
  };

  const exportMarkdown = () => {
    const selected = manuscriptDocs.filter(d => selectedDocs.has(d.id));
    let md = `# ${project?.title || 'Untitled'}\n\n`;
    selected.forEach(doc => {
      md += `## ${doc.title}\n\n`;
      md += stripHtml(doc.content || '') + '\n\n';
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project?.title || 'manuscript').replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const totalWords = manuscriptDocs
    .filter(d => selectedDocs.has(d.id))
    .reduce((sum, d) => sum + (d.word_count || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--ink-bg)]">
      <header className="border-b border-[var(--ink-border)] bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Workspace') + `?projectId=${projectId}`}>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowLeft className="w-3 h-3" />
              {t('common.back')}
            </Button>
          </Link>
          <span className="text-xs text-[var(--ink-text-muted)]">/ {project?.title} / {t('compiler.title')}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section selector */}
          <Card className="border-[var(--ink-border)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{t('compiler.sections')}</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={toggleAll}>
                  {selectedDocs.size === manuscriptDocs.length
                    ? (lang === 'es' ? 'Deseleccionar todo' : 'Deselect all')
                    : (lang === 'es' ? 'Seleccionar todo' : 'Select all')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {manuscriptDocs.length === 0 ? (
                <p className="text-sm text-[var(--ink-text-muted)] py-4 text-center">{t('common.noResults')}</p>
              ) : (
                manuscriptDocs.map(doc => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--ink-surface-hover)] cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                    />
                    <FileText className="w-3.5 h-3.5 text-[var(--ink-text-muted)]" />
                    <span className="text-sm flex-1">{doc.title}</span>
                    <span className="text-[10px] text-[var(--ink-text-muted)] tabular-nums">{doc.word_count || 0}w</span>
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          {/* Preview & Export */}
          <div className="space-y-4">
            <Card className="border-[var(--ink-border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('compiler.preview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[var(--ink-bg)] rounded-xl p-6 min-h-[200px] border border-[var(--ink-border-subtle)]">
                  <h3 className="text-lg font-serif font-bold mb-4">{project?.title}</h3>
                  {manuscriptDocs.filter(d => selectedDocs.has(d.id)).map(doc => (
                    <div key={doc.id} className="mb-3">
                      <h4 className="text-sm font-serif font-semibold text-[var(--ink-text-secondary)]">{doc.title}</h4>
                      <p className="text-xs text-[var(--ink-text-muted)] line-clamp-2 mt-0.5">
                        {stripHtml(doc.content || '').slice(0, 100)}...
                      </p>
                    </div>
                  ))}
                  {selectedDocs.size === 0 && (
                    <p className="text-xs text-[var(--ink-text-muted)]">
                      {lang === 'es' ? 'Selecciona secciones para previsualizar' : 'Select sections to preview'}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-[var(--ink-text-muted)]">
                  <span>{selectedDocs.size} {lang === 'es' ? 'secciones' : 'sections'}</span>
                  <span>{totalWords.toLocaleString()} {t('dashboard.words')}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={exportMarkdown}
              disabled={selectedDocs.size === 0}
              className={`w-full h-11 rounded-xl text-sm transition-all ${
                exported
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-[var(--ink-accent)] hover:bg-[var(--ink-accent-hover)]'
              } text-white`}
            >
              {exported ? (
                <><Check className="w-4 h-4 mr-2" />{lang === 'es' ? 'Exportado' : 'Exported'}</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />{t('compiler.export')} Markdown</>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}