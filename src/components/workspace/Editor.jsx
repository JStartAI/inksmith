import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import { useLanguage } from '../i18n/LanguageContext';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['blockquote'],
    ['clean'],
  ],
};

function countWords(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

export default function Editor({ document: doc, onSave, fontFamily = 'sans' }) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
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
    setTimeout(() => setSaving(false), 500);
    hasChangesRef.current = false;
  }, [doc, onSave]);

  const handleChange = (value) => {
    setContent(value);
    hasChangesRef.current = true;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => doSave(value), 3000);
  };

  // Save on unmount or doc switch
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChangesRef.current) doSave(content);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, doSave]);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--ink-text-muted)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--ink-warm)] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <p className="text-sm">{t('editor.placeholder')}</p>
        </div>
      </div>
    );
  }

  const wordCount = countWords(content);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className={`flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 py-6 ink-editor ${fontFamily === 'serif' ? 'font-serif' : ''}`}>
        <ReactQuill
          value={content}
          onChange={handleChange}
          modules={modules}
          placeholder={t('editor.placeholder')}
          theme="snow"
        />
      </div>
      <div className="flex items-center justify-between px-6 py-2 border-t border-[var(--ink-border-subtle)] bg-white/50">
        <span className="text-xs text-[var(--ink-text-muted)] tabular-nums">
          {wordCount.toLocaleString()} {t('editor.wordCount')}
        </span>
        <span className={`text-xs transition-opacity ${saving ? 'text-[var(--ink-accent)] opacity-100' : 'text-[var(--ink-text-muted)] opacity-60'}`}>
          {saving ? t('editor.saving') : t('editor.saved')}
        </span>
      </div>
    </div>
  );
}