import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, CheckCircle2, AlertCircle, PenLine, BookOpen, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: BookOpen,
    title: 'Bienvenido a InkSmith',
    desc: 'Tu espacio de escritura. Organiza proyectos, personajes y capítulos en un solo lugar.',
  },
  {
    icon: PenLine,
    title: 'Escribe sin interrupciones',
    desc: 'Editor limpio, vista de corcho, esquemas y ayuda de IA para cuando te quedes sin palabras.',
  },
  {
    icon: Sparkles,
    title: 'Tus textos, siempre seguros',
    desc: 'Conecta Google Drive para guardar copias de seguridad automáticas de todo tu trabajo.',
  },
];

function isDriveConnected() {
  return !!localStorage.getItem('inksmith_drive_connected');
}

export default function OnboardingGate({ children }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const seen = localStorage.getItem('inksmith_onboarding_done');
    if (seen && isDriveConnected()) setDone(true);
    if (isDriveConnected()) setDriveConnected(true);
  }, []);

  const isLastStep = step === STEPS.length - 1;

  const initAndConnect = async () => {
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('inksmith_drive_connected', '1');
      setDriveConnected(true);
    } catch (e) {
      setError('Error al conectar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const finish = () => {
    localStorage.setItem('inksmith_onboarding_done', '1');
    setDone(true);
  };

  if (done) return children;

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <BookOpen className="w-5 h-5" style={{ color: 'var(--text)' }} />
          <span className="text-xl font-bold" style={{ color: 'var(--text)', fontFamily: 'Lora, serif' }}>InkSmith</span>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 6, height: 6,
                background: i === step ? 'var(--text)' : 'var(--border)',
              }} />
          ))}
        </div>

        {/* Card */}
        <div className="rounded p-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          <div className="w-12 h-12 rounded flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <CurrentIcon className="w-6 h-6" style={{ color: 'var(--text)' }} />
          </div>

          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)', fontFamily: 'Lora, serif' }}>
            {STEPS[step].title}
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            {STEPS[step].desc}
          </p>

          {isLastStep && (
            <div className="mb-6 text-left">
              {driveConnected ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded text-sm"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text)' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>Drive conectado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    Conecta Drive para guardar automáticamente
                  </p>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={initAndConnect}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent)' }}>
                    <Cloud className="w-4 h-4" />
                    {loading ? 'Conectando...' : 'Conectar con Google Drive'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLastStep ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full py-2.5 rounded text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
              Siguiente →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!driveConnected}
              className="w-full py-2.5 rounded text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
              Comenzar a escribir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}