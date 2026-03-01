import React from 'react';
import { LanguageProvider } from './components/i18n/LanguageContext';

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        
        :root {
          --ink-bg: #0d0d10;
          --ink-surface: #16161a;
          --ink-surface-hover: #1e1e24;
          --ink-border: #25252e;
          --ink-border-subtle: #1c1c24;
          --ink-text: #e2e2ea;
          --ink-text-secondary: #8888a2;
          --ink-text-muted: #52526a;
          --ink-accent: #4f7ef7;
          --ink-accent-hover: #3a6ae8;
          --ink-accent-light: #1a2844;
          --ink-red: #f87171;
          --ink-orange: #fb923c;
          --ink-yellow: #fbbf24;
          --ink-green: #34d399;
          --ink-blue: #4f7ef7;
          --ink-purple: #a78bfa;
          --ink-warm: #1a1a22;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--ink-bg);
          color: var(--ink-text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Subtle noise texture overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 128px 128px;
        }
        
        .font-serif {
          font-family: 'Lora', Georgia, serif;
        }
        
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #3a3a52; }
        
        /* Quill editor styles */
        .ink-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #2a2a38 !important;
          padding: 8px 16px !important;
          background: #fafafa !important;
        }
        .ink-editor .ql-container {
          border: none !important;
          font-size: 16px;
          line-height: 1.85;
          background: white;
        }
        .ink-editor .ql-editor {
          padding: 28px 40px !important;
          min-height: 70vh;
          color: #1a1a1a;
        }
        .ink-editor .ql-editor.ql-blank::before {
          color: #aaa;
          font-style: normal;
          left: 40px;
        }
        .ink-editor .ql-editor p { margin-bottom: 0.6em; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.2s ease-out; }
      `}</style>
      <div className="min-h-screen relative">
        {children}
      </div>
    </LanguageProvider>
  );
}