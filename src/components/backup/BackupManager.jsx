import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Cloud, Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupManager({ projectId, projectTitle }) {
  const [backing, setBacking] = useState(false);

  const checkGoogleDriveConnection = () => {
    const token = localStorage.getItem('gdrive_access_token');
    const clientId = localStorage.getItem('gdrive_client_id');
    return token && clientId;
  };

  const createBackup = async () => {
    if (!checkGoogleDriveConnection()) {
      toast.error('Debes conectar Google Drive primero en Configuración');
      return;
    }

    setBacking(true);

    try {
      // Fetch all project data
      const [project, documents, characters] = await Promise.all([
        base44.entities.Project.filter({ id: projectId }).then(r => r[0]),
        base44.entities.Document.filter({ project_id: projectId }),
        base44.entities.Character.filter({ project_id: projectId }),
      ]);

      // Get snapshots for all documents
      const snapshotsPromises = documents.map(doc => 
        base44.entities.Snapshot.filter({ document_id: doc.id })
      );
      const snapshotsArrays = await Promise.all(snapshotsPromises);
      const snapshots = snapshotsArrays.flat();

      const backupData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        project,
        documents,
        characters,
        snapshots,
      };

      // Upload to Google Drive
      const token = localStorage.getItem('gdrive_access_token');
      const fileName = `${projectTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
      
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: ['root'],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir a Google Drive');
      }

      toast.success('Backup guardado en Google Drive');
    } catch (error) {
      console.error(error);
      toast.error('Error al crear backup: ' + error.message);
    } finally {
      setBacking(false);
    }
  };

  const downloadBackup = async () => {
    setBacking(true);

    try {
      const [project, documents, characters] = await Promise.all([
        base44.entities.Project.filter({ id: projectId }).then(r => r[0]),
        base44.entities.Document.filter({ project_id: projectId }),
        base44.entities.Character.filter({ project_id: projectId }),
      ]);

      const snapshotsPromises = documents.map(doc => 
        base44.entities.Snapshot.filter({ document_id: doc.id })
      );
      const snapshotsArrays = await Promise.all(snapshotsPromises);
      const snapshots = snapshotsArrays.flat();

      const backupData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        project,
        documents,
        characters,
        snapshots,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();

      toast.success('Backup descargado localmente');
    } catch (error) {
      toast.error('Error al crear backup: ' + error.message);
    } finally {
      setBacking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={createBackup}
        disabled={backing}
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5"
      >
        {backing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
        Backup a Drive
      </Button>
      
      <Button
        onClick={downloadBackup}
        disabled={backing}
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5"
      >
        <Download className="w-3 h-3" />
        Backup local
      </Button>
    </div>
  );
}