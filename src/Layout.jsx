import React from 'react';
import { LanguageProvider } from './components/i18n/LanguageContext';

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        
        :root {
          --ink-bg: #faf9f7;
          --ink-surface: #ffffff;
          --ink-surface-hover: #f5f4f2;
          --ink-border: #e8e6e1;
          --ink-border-subtle: #f0eeeb;
          --ink-text: #1a1a1a;
          --ink-text-secondary: #6b6560;
          --ink-text-muted: #9c9690;
          --ink-accent: #2563eb;
          --ink-accent-hover: #1d4ed8;
          --ink-accent-light: #eff6ff;
          --ink-red: #dc2626;
          --ink-orange: #ea580c;
          --ink-yellow: #ca8a04;
          --ink-green: #16a34a;
          --ink-blue: #2563eb;
          --ink-purple: #9333ea;
          --ink-warm: #f5f0eb;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--ink-bg);
          color: var(--ink-text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .font-serif {
          font-family: 'Lora', Georgia, serif;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--ink-border);
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--ink-text-muted);
        }
        
        .ink-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid var(--ink-border-subtle) !important;
          padding: 8px 0 !important;
        }
        .ink-editor .ql-container {
          border: none !important;
          font-size: 16px;
          line-height: 1.8;
        }
        .ink-editor .ql-editor {
          padding: 24px 0 !important;
          min-height: 60vh;
        }
        .ink-editor .ql-editor.ql-blank::before {
          color: var(--ink-text-muted);
          font-style: normal;
        }
        .ink-editor .ql-editor p {
          margin-bottom: 0.5em;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
      <div className="min-h-screen">
        {children}
      </div>
    </LanguageProvider>
  );
}