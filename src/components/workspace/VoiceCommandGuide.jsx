import React, { useState } from 'react';
import { Mic, X, ChevronDown } from 'lucide-react';

const VOICE_COMMANDS = [
  { cmd: 'Guardar', desc: 'Guarda el documento actual' },
  { cmd: 'Nuevo', desc: 'Crea un nuevo documento' },
  { cmd: 'Crear personaje', desc: 'Abre el asistente de personajes' },
  { cmd: 'Minimalista', desc: 'Activa el modo escritura sin distracciones' },
  { cmd: 'Normal', desc: 'Desactiva el modo minimalista' },
  { cmd: 'Inspector', desc: 'Muestra u oculta el inspector' },
  { cmd: 'Trama', desc: 'Cambia a vista de trama' },
  { cmd: 'Corcho', desc: 'Cambia a vista de corcho' },
  { cmd: 'Editor', desc: 'Vuelve a la vista editor' },
  { cmd: 'Salir', desc: 'Sale del modo minimalista' },
];

export default function VoiceCommandGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded text-[#9e9a94] hover:text-white hover:bg-white/10 text-xs transition-colors"
      >
        <Mic className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Voz</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 rounded-lg bg-[#2a2d2e] border border-[#363a3b] p-4 shadow-xl z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#d8d4cc] flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Comandos de voz
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-[#6e6a64] hover:text-[#d8d4cc]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {VOICE_COMMANDS.map((item, i) => (
              <div key={i} className="text-xs">
                <p className="font-semibold text-[#7ba7bc]">{item.cmd}</p>
                <p className="text-[#6e6a64]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}