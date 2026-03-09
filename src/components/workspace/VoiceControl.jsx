import React, { useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceRecognition } from '../useVoiceRecognition';

export default function VoiceControl({ 
  onCommand, 
  onTranscript,
  enabled = true 
}) {
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript } = useVoiceRecognition();

  useEffect(() => {
    if (!transcript || !enabled) return;

    const cmd = transcript.toLowerCase().trim();
    
    // Comandos reconocidos
    const commands = {
      'guardar': () => onCommand('save'),
      'nuevo': () => onCommand('new-doc'),
      'crear personaje': () => onCommand('new-character'),
      'minimalista': () => onCommand('minimal-mode'),
      'normal': () => onCommand('normal-mode'),
      'inspector': () => onCommand('toggle-inspector'),
      'trama': () => onCommand('plot-view'),
      'corcho': () => onCommand('corkboard-view'),
      'editor': () => onCommand('editor-view'),
      'salir': () => onCommand('exit-minimal'),
    };

    for (const [key, handler] of Object.entries(commands)) {
      if (cmd.includes(key)) {
        handler();
        resetTranscript();
        return;
      }
    }

    // Si no es comando, enviar al callback de transcripción
    onTranscript?.(transcript);
    resetTranscript();
  }, [transcript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2.5 rounded-lg transition-all ${
          isListening
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'text-[#9e9a94] hover:text-white hover:bg-white/10'
        }`}
        title={isListening ? 'Dejar de escuchar' : 'Empezar a escuchar'}
      >
        {isListening ? (
          <Mic className="w-4 h-4" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </button>

      {isListening && (
        <div className="text-xs text-[#9e9a94] bg-black/30 rounded-lg px-3 py-1.5 max-w-xs flex items-center gap-2">
          <Volume2 className="w-3 h-3 animate-pulse text-red-400" />
          <span className="truncate">
            {interimTranscript || transcript || 'Escuchando...'}
          </span>
        </div>
      )}
    </div>
  );
}