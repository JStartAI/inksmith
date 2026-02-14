import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { FileText, MoreHorizontal, Clock, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '../i18n/LanguageContext';
import moment from 'moment';

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-700',
  drafting: 'bg-blue-100 text-blue-700',
  revising: 'bg-purple-100 text-purple-700',
  editing: 'bg-orange-100 text-orange-700',
  complete: 'bg-green-100 text-green-700',
};

export default function ProjectCard({ project, onDelete }) {
  const { t } = useLanguage();

  return (
    <div className="group relative bg-white rounded-2xl border border-[var(--ink-border)] p-6 hover:shadow-lg hover:border-[var(--ink-text-muted)] transition-all duration-300 animate-fadeIn">
      <div className="flex items-start justify-between mb-4">
        <Link
          to={createPageUrl('Workspace') + `?projectId=${project.id}`}
          className="flex-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--ink-warm)]">
              <BookOpen className="w-5 h-5 text-[var(--ink-text-secondary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--ink-text)] group-hover:text-[var(--ink-accent)] transition-colors line-clamp-1">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-xs text-[var(--ink-text-muted)] mt-0.5 line-clamp-1">{project.description}</p>
              )}
            </div>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(project.id)}
            >
              {t('project.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={createPageUrl('Workspace') + `?projectId=${project.id}`}>
        <div className="flex items-center gap-4 text-xs text-[var(--ink-text-muted)]">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {(project.word_count || 0).toLocaleString()} {t('dashboard.words')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {moment(project.updated_date).fromNow()}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[project.status] || statusColors.planning}`}>
            {project.status?.replace(/_/g, ' ') || 'planning'}
          </span>
          <span className="text-[10px] text-[var(--ink-text-muted)] uppercase tracking-wider">
            {project.language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
          </span>
        </div>

        {project.target_word_count > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-[var(--ink-text-muted)] mb-1">
              <span>Progress</span>
              <span>{Math.min(100, Math.round(((project.word_count || 0) / project.target_word_count) * 100))}%</span>
            </div>
            <div className="h-1 bg-[var(--ink-border-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--ink-accent)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((project.word_count || 0) / project.target_word_count) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}