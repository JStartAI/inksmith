import React from 'react';
import { LanguageProvider } from './components/i18n/LanguageContext';

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        
        :root {
          --ink-bg: #1e2122;
          --ink-surface: #272b2c;
          --ink-surface-hover: #2f3334;
          --ink-border: #363a3b;
          --ink-border-subtle: #383b3c;
          --ink-text: #d8d4cc;
          --ink-text-secondary: #9e9a94;
          --ink-text-muted: #6e6a64;
          --ink-accent: #7ba7bc;
          --ink-accent-hover: #6494aa;
          --ink-accent-light: #2e3d45;
          --ink-red: #c97a7a;
          --ink-orange: #c99060;
          --ink-yellow: #c9aa60;
          --ink-green: #7aaa88;
          --ink-blue: #7ba7bc;
          --ink-purple: #9a88c0;
          --ink-warm: #2e3132;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--ink-bg);
          color: var(--ink-text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Subtle vignette + top-center light source */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 10%, rgba(90,110,115,0.10) 0%, transparent 70%);
        }

        /* Subtle chalk/slate texture overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 180px 180px;
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