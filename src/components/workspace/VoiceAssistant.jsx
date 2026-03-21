import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Loader, Mic, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function VoiceAssistant({ projectId, projectTitle, onCommandExecute }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: t('voiceAssistant.greeting') || 'Hola, soy tu asistente de escritura. ¿Cómo puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => setListening(true);
      recognitionRef.current.onend = () => {
        setListening(false);
        // Reinicia el reconocimiento cuando termina (siempre escuchando)
        if (recognitionRef.current && !open) {
          setTimeout(() => recognitionRef.current?.start(), 500);
        }
      };
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
          .toLowerCase();

        // Si detecta palabra clave "asistente" y el chat está cerrado, abrirlo
        if (transcript.includes('asistente') && !open) {
          setOpen(true);
          recognitionRef.current?.stop();
        } else if (open) {
          // Si el chat está abierto, captura el texto
          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal) {
            setInput(transcript);
          }
        }
      };

      // Inicia el reconocimiento cuando se carga
      recognitionRef.current.start();
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('voiceAssistant', {
        projectId,
        projectTitle,
        message: text,
        conversationHistory: messages
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        action: response.data.action
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.data.action && onCommandExecute) {
        onCommandExecute(response.data.action);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Disculpa, hubo un error. Intenta de nuevo.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col">
      {open && (
        <div className="mb-3 w-80 max-w-[calc(100vw-2rem)] flex flex-col shadow-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', height: '420px' }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)', fontFamily: 'Lora, serif' }}>Asistente</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-3 py-2 text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'var(--text)' : 'var(--bg-subtle)',
                    color: msg.role === 'user' ? 'var(--accent-fg)' : 'var(--text)',
                    borderRadius: '3px',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '3px' }}>
                  <Loader className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe algo..."
                className="flex-1 px-3 py-1.5 text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                }}
                disabled={loading}
              />
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading}
                className="p-1.5 rounded transition-colors"
                style={{ color: listening ? 'var(--text)' : 'var(--text-muted)' }}
                title={listening ? 'Detener' : 'Hablar'}
              >
                <Mic className={`w-4 h-4 ${listening ? 'animate-pulse' : ''}`} />
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-1.5 rounded transition-colors disabled:opacity-30"
                style={{ color: 'var(--text-muted)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 flex items-center justify-center shadow-lg transition-transform hover:scale-105 self-end"
        style={{
          background: 'var(--text)',
          color: 'var(--accent-fg)',
          borderRadius: '3px',
        }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}