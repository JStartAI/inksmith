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
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => setListening(true);
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
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
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)] flex flex-col rounded-lg shadow-2xl" style={{ background: '#272b2c', border: '1px solid #363a3b', height: '500px' }}>
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: '#363a3b' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm" style={{ color: '#d8d4cc' }}>Asistente de Escritura</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                style={{ color: '#9e9a94' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin"
          >
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: msg.role === 'user' ? '#7ba7bc' : '#363a3b',
                    color: msg.role === 'user' ? '#fff' : '#d8d4cc'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg" style={{ background: '#363a3b' }}>
                  <Loader className="w-4 h-4 animate-spin" style={{ color: '#7ba7bc' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: '#363a3b' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe algo..."
                className="flex-1 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1"
                style={{
                  background: '#1e2122',
                  color: '#d8d4cc',
                  borderColor: '#505558',
                  '--tw-ring-color': '#7ba7bc'
                }}
                disabled={loading}
              />
              <button
                onClick={startListening}
                disabled={listening || loading}
                className="p-2 rounded hover:bg-white/10 transition-colors"
                style={{ color: listening ? '#7ba7bc' : '#9e9a94' }}
                title="Hablar"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-2 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                style={{ color: '#9e9a94' }}
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
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}