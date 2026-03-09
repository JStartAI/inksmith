import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import { useLanguage } from '../i18n/LanguageContext';
import { Eye, EyeOff } from 'lucide-react';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['blockquote'],
    ['clean'],
  ],
};

const minimalModules = {
  toolbar: false,
};

function countWords(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

export default function Editor({ document: doc, onSave, fontFamily = 'sans', onMinimalToggle }) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMinimal, setIsMinimal] = useState(false);
  const saveTimerRef = useRef(null);
  const hasChangesRef = useRef(false);

  useEffect(() => {
    setContent(doc?.content || '');
    hasChangesRef.current = false;
  }, [doc?.id]);

  const doSave = useCallback((value) => {
    if (!doc) return;
    setSaving(true);
    const wc = countWords(value);
    onSave(doc.id, { content: value, word_count: wc });
    setTimeout(() => setSaving(false), 600);
    hasChangesRef.current = false;
  }, [doc, onSave]);

  const handleChange = (value) => {
    setContent(value);
    hasChangesRef.current = true;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => doSave(value), 3000);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChangesRef.current) doSave(content);
      }
      if (e.key === 'Escape') {
        if (isMinimal) {
          setIsMinimal(false);
          onMinimalToggle?.(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, doSave, isMinimal, onMinimalToggle]);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0f0f0f' }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <p className="text-sm text-[#666]">{t('editor.placeholder')}</p>
        </div>
      </div>
    );
  }

  const wordCount = countWords(content);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: isMinimal ? '#0f0f0f' : '#ede9e0' }}>
      {/* Minimal mode - show title only on hover */}
      {isMinimal && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => {
              setIsMinimal(false);
              onMinimalToggle?.(false);
            }}
            className="p-2 rounded-lg transition-all opacity-40 hover:opacity-100"
            style={{ background: '#1a1a1a', color: '#888' }}
            title="Salir del modo minimalista (Esc)"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isMinimal && (
        <>
          {/* Document title */}
          <div className="px-6 pt-5 pb-2 flex items-center justify-between" style={{ background: '#ede9e0' }}>
            <h2 className="text-[13px] font-semibold text-[#2d2924] tracking-wide">{doc.title}</h2>
            <button
              onClick={() => {
                setIsMinimal(true);
                onMinimalToggle?.(true);
              }}
              className="p-1.5 rounded hover:bg-black/5 transition-colors opacity-50 hover:opacity-100"
              title="Modo minimalista (Esc)"
            >
              <EyeOff className="w-4 h-4 text-[#6e6a64]" />
            </button>
          </div>
        </>
      )}

      {/* Writing area - centered page */}
      <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ background: isMinimal ? '#0f0f0f' : '#ede9e0' }}>
        <div
          className={`mx-auto bg-white shadow-md rounded-sm ink-editor ${fontFamily === 'serif' ? 'font-serif' : ''} ${isMinimal ? 'hidden' : ''}`}
          style={{
            maxWidth: '720px',
            minHeight: '85vh',
          }}
        >
          <ReactQuill
            value={content}
            onChange={handleChange}
            modules={modules}
            placeholder={t('editor.placeholder')}
            theme="snow"
          />
        </div>

        {/* Minimal editor - full screen, no toolbar */}
        {isMinimal && (
          <div
            className={`mx-auto ${fontFamily === 'serif' ? 'font-serif' : ''}`}
            style={{
              maxWidth: '720px',
              minHeight: '100%',
            }}
          >
            <ReactQuill
              value={content}
              onChange={handleChange}
              modules={minimalModules}
              placeholder={t('editor.placeholder')}
              theme="bubble"
              className="text-white text-lg leading-relaxed placeholder-[#555]"
              style={{
                background: 'transparent',
                border: 'none',
              }}
            />
          </div>
        )}
      </div>

      {!isMinimal && (
        <>
          {/* Status bar */}
          <div
            className="flex items-center justify-between px-5 py-1.5"
            style={{ borderTop: '1px solid #ccc5bd', background: '#ddd9d0' }}
          >
            <span className="text-[11px] text-[#4a4540] tabular-nums font-medium">
              {wordCount.toLocaleString()} {t('editor.wordCount')}
            </span>
            <span className={`text-[11px] transition-opacity font-medium ${saving ? 'text-[#2563eb] opacity-100' : 'text-[#888] opacity-70'}`}>
              {saving ? t('editor.saving') : t('editor.saved')}
            </span>
          </div>
        </>
      )}

      {isMinimal && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#1a1a1a', borderTop: '1px solid #333' }}>
          <span className="text-[11px] text-[#666] tabular-nums font-medium">
            {wordCount.toLocaleString()} palabras
          </span>
          <span className={`text-[10px] text-[#555] transition-opacity font-medium`}>
            {saving ? 'Guardando...' : 'Guardado'}
          </span>
        </div>
      )}
    </div>
  );
}