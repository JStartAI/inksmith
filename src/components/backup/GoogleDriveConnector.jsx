import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

export default function GoogleDriveConnector() {
  const { t } = useLanguage();
  const [clientId, setClientId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive_client_id');
    const savedToken = localStorage.getItem('gdrive_access_token');
    const savedEmail = localStorage.getItem('gdrive_user_email');
    
    if (savedClientId) setClientId(savedClientId);
    if (savedToken && savedEmail) {
      setIsConnected(true);
      setUserEmail(savedEmail);
    }
  }, []);

  const initializeGoogleDrive = async (cId) => {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            clientId: cId,
            scope: SCOPES,
            discoveryDocs: [DISCOVERY_DOC],
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const handleConnect = async () => {
    if (!clientId) {
      setError('Por favor ingresa tu Client ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load gapi
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = async () => {
          await continueConnection();
        };
        document.body.appendChild(script);
      } else {
        await continueConnection();
      }
    } catch (err) {
      setError('Error al conectar: ' + err.message);
      setLoading(false);
    }
  };

  const continueConnection = async () => {
    try {
      await initializeGoogleDrive(clientId);
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      const profile = googleUser.getBasicProfile();
      const token = googleUser.getAuthResponse().access_token;

      localStorage.setItem('gdrive_client_id', clientId);
      localStorage.setItem('gdrive_access_token', token);
      localStorage.setItem('gdrive_user_email', profile.getEmail());

      setIsConnected(true);
      setUserEmail(profile.getEmail());
      setLoading(false);
    } catch (err) {
      setError('Error al autenticar: ' + err.message);
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('gdrive_client_id');
    localStorage.removeItem('gdrive_access_token');
    localStorage.removeItem('gdrive_user_email');
    
    if (window.gapi?.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut();
      }
    }

    setIsConnected(false);
    setUserEmail('');
    setClientId('');
  };

  return (
    <Card className="border-[var(--ink-border)]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Google Drive Backup
        </CardTitle>
        <CardDescription className="text-xs">
          Conecta tu cuenta de Google Drive para hacer backups automáticos de tus proyectos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <div>
              <Label htmlFor="clientId" className="text-xs">Google Client ID</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="123456789-abc.apps.googleusercontent.com"
                className="mt-1.5 text-sm"
                disabled={loading}
              />
              <p className="text-[10px] text-[var(--ink-text-muted)] mt-1">
                Obtén tu Client ID en:{' '}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--ink-accent)] hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}

            <Button 
              onClick={handleConnect} 
              disabled={loading || !clientId}
              className="w-full"
              size="sm"
            >
              {loading ? 'Conectando...' : 'Conectar Google Drive'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <div>
                <p className="font-medium">Conectado</p>
                <p className="text-[10px] text-green-700">{userEmail}</p>
              </div>
            </div>

            <Button 
              onClick={handleDisconnect} 
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="w-3 h-3 mr-2" />
              Desconectar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}