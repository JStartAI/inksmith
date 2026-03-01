import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, MoreHorizontal, Clock, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '../i18n/LanguageContext';
import moment from 'moment';

const statusColors = {
  planning:  { bg: '#3a3620', text: '#c9aa60' },
  drafting:  { bg: '#1e2d38', text: '#7ba7bc' },
  revising:  { bg: '#2a1e3a', text: '#9a88c0' },
  editing:   { bg: '#38281a', text: '#c99060' },
  complete:  { bg: '#1a2c22', text: '#7aaa88' },
};

export default function ProjectCard({ project, onDelete }) {
  const { t } = useLanguage();

  return (
    <div className="group relative rounded-2xl p-6 transition-all duration-300 animate-fadeIn hover:translate-y-[-2px]" style={{ background: '#272b2c', border: '1px solid #363a3b' }}>
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
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: (statusColors[project.status] || statusColors.planning).bg, color: (statusColors[project.status] || statusColors.planning).text }}>
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