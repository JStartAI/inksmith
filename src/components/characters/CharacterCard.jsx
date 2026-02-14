import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../i18n/LanguageContext';

const roleColors = {
  protagonist: 'bg-blue-100 text-blue-700',
  antagonist: 'bg-red-100 text-red-700',
  supporting: 'bg-green-100 text-green-700',
  minor: 'bg-gray-100 text-gray-600',
  mentor: 'bg-purple-100 text-purple-700',
  love_interest: 'bg-pink-100 text-pink-700',
};

export default function CharacterCard({ character, onClick }) {
  const { t } = useLanguage();

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[var(--ink-border)] overflow-hidden cursor-pointer hover:shadow-lg hover:border-[var(--ink-text-muted)] transition-all duration-300 animate-fadeIn"
    >
      {/* Portrait */}
      <div className="aspect-square bg-gradient-to-br from-[var(--ink-warm)] to-[var(--ink-bg)] flex items-center justify-center relative overflow-hidden">
        {character.image_url ? (
          <img src={character.image_url} alt={character.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <User className="w-12 h-12 text-[var(--ink-text-muted)] opacity-30" strokeWidth={1} />
          </div>
        )}
        {character.profile_generated && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-amber-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--ink-text)] text-sm group-hover:text-[var(--ink-accent)] transition-colors">
          {character.name}
        </h3>
        {character.role && (
          <Badge variant="secondary" className={`text-[10px] mt-1.5 ${roleColors[character.role] || roleColors.supporting}`}>
            {t(`characters.${character.role}`)}
          </Badge>
        )}
        {character.core_motivation && (
          <p className="text-[11px] text-[var(--ink-text-muted)] mt-2 line-clamp-2 leading-relaxed">
            {character.core_motivation}
          </p>
        )}
      </div>
    </div>
  );
}