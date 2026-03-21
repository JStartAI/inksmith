import React from 'react';
import { LanguageProvider } from './components/i18n/LanguageContext';
import VoiceAssistant from './components/workspace/VoiceAssistant';
import { useTheme } from './hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="fixed top-3 right-4 z-50 w-8 h-8 flex items-center justify-center border transition-colors"
      style={{...{borderRadius:'2px'}}}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-secondary)',
      }}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export default function Layout({ children, currentPageName }) {
  const getProjectIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('projectId');
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ThemeToggle />
        {children}

        {/* Global Voice Assistant */}
        <div className="fixed bottom-6 right-6 z-40">
          <VoiceAssistant
            projectId={getProjectIdFromUrl() || ''}
            projectTitle={currentPageName === 'Workspace' ? document.title : 'InkSmith'}
          />
        </div>
      </div>
    </LanguageProvider>
  );
}