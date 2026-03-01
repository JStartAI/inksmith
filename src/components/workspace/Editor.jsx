import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import { useLanguage } from '../i18n/LanguageContext';

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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, doSave]);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#f0ede8' }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-white shadow flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <p className="text-sm text-[#9c9690]">{t('editor.placeholder')}</p>
        </div>
      </div>
    );
  }

  const wordCount = countWords(content);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: '#f0ede8' }}>
      {/* Document title */}
      <div className="px-6 pt-5 pb-2 flex items-center gap-2" style={{ background: '#f0ede8' }}>
        <h2 className="text-[13px] font-semibold text-[#6b6560] tracking-wide">{doc.title}</h2>
      </div>

      {/* Writing area - centered page */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div
          className={`mx-auto bg-white shadow-md rounded-sm ink-editor ${fontFamily === 'serif' ? 'font-serif' : ''}`}
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
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-5 py-1.5"
        style={{ borderTop: '1px solid #ddd9d3', background: '#e8e5e0' }}
      >
        <span className="text-[11px] text-[#9c9690] tabular-nums">
          {wordCount.toLocaleString()} {t('editor.wordCount')}
        </span>
        <span className={`text-[11px] transition-opacity ${saving ? 'text-[#2563eb] opacity-100' : 'text-[#bbb] opacity-80'}`}>
          {saving ? t('editor.saving') : t('editor.saved')}
        </span>
      </div>
    </div>
  );
}