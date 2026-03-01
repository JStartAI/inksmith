import React, { useState, useEffect } from 'react';
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
  return !!(localStorage.getItem('gdrive_access_token') && localStorage.getItem('gdrive_user_email'));
}

export default function OnboardingGate({ children }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const seen = localStorage.getItem('inksmith_onboarding_done');
    if (seen && isDriveConnected()) {
      setDone(true);
    }
    const saved = localStorage.getItem('gdrive_client_id');
    if (saved) setClientId(saved);
    if (isDriveConnected()) {
      setDriveConnected(true);
      setUserEmail(localStorage.getItem('gdrive_user_email') || '');
    }
  }, []);

  const isLastStep = step === STEPS.length - 1;

  const initAndConnect = async () => {
    if (!clientId) { setError('Por favor ingresa tu Client ID'); return; }
    setLoading(true); setError('');

    const connect = async () => {
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              clientId,
              scope: 'https://www.googleapis.com/auth/drive.file',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            });
            resolve();
          } catch (e) { reject(e); }
        });
      });
      const auth = window.gapi.auth2.getAuthInstance();
      const user = await auth.signIn();
      const profile = user.getBasicProfile();
      const token = user.getAuthResponse().access_token;
      localStorage.setItem('gdrive_client_id', clientId);
      localStorage.setItem('gdrive_access_token', token);
      localStorage.setItem('gdrive_user_email', profile.getEmail());
      setDriveConnected(true);
      setUserEmail(profile.getEmail());
      setLoading(false);
    };

    if (!window.gapi) {
      const s = document.createElement('script');
      s.src = 'https://apis.google.com/js/api.js';
      s.onload = () => connect().catch(e => { setError(e.message); setLoading(false); });
      document.body.appendChild(s);
    } else {
      connect().catch(e => { setError(e.message); setLoading(false); });
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
      style={{ background: '#171a1b' }}>

      {/* Foco de luz */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 45% at 50% 20%, rgba(90,143,168,0.18) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5a8fa8, #7a72b0)' }}>
            <span className="text-white font-bold text-sm">IS</span>
          </div>
          <span className="text-[#d8d4cc] font-bold text-lg tracking-tight">InkSmith</span>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6, height: 6,
                background: i === step ? '#7ba7bc' : '#363a3b',
              }} />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: '#1e2122', border: '1px solid #363a3b' }}>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #2e3d45, #2a1e3a)' }}>
            <CurrentIcon className="w-7 h-7 text-[#7ba7bc]" />
          </div>

          <h2 className="text-xl font-bold text-[#d8d4cc] mb-2">{STEPS[step].title}</h2>
          <p className="text-[#9e9a94] text-sm leading-relaxed mb-8">{STEPS[step].desc}</p>

          {/* Drive connect panel — solo en el último paso */}
          {isLastStep && (
            <div className="mb-6 text-left">
              {driveConnected ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: '#1a2c22', border: '1px solid #2a4a34' }}>
                  <CheckCircle2 className="w-4 h-4 text-[#7aaa88] flex-shrink-0" />
                  <div>
                    <p className="text-[#7aaa88] font-medium text-xs">Drive conectado</p>
                    <p className="text-[#6e6a64] text-[10px]">{userEmail}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#c9aa60]"
                    style={{ background: '#3a3620', border: '1px solid #4a4830' }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Necesitas conectar Drive para continuar
                  </div>
                  <input
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    placeholder="Google Client ID"
                    className="w-full px-3 py-2 rounded-xl text-sm text-[#d8d4cc] outline-none"
                    style={{ background: '#272b2c', border: '1px solid #363a3b' }}
                  />
                  <p className="text-[10px] text-[#6e6a64]">
                    Obtén tu Client ID en{' '}
                    <a href="https://console.cloud.google.com/apis/credentials"
                      target="_blank" rel="noopener noreferrer"
                      className="text-[#7ba7bc] hover:underline">
                      Google Cloud Console
                    </a>
                  </p>
                  {error && <p className="text-xs text-[#c97a7a]">{error}</p>}
                  <button
                    onClick={initAndConnect}
                    disabled={loading || !clientId}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #5a8fa8, #7a72b0)' }}>
                    <Cloud className="w-4 h-4" />
                    {loading ? 'Conectando...' : 'Conectar Google Drive'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          {!isLastStep ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #5a8fa8, #7a72b0)' }}>
              Siguiente →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!driveConnected}
              className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #5a8fa8, #7a72b0)' }}>
              Comenzar a escribir ✦
            </button>
          )}
        </div>
      </div>
    </div>
  );
}