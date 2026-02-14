import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const labelColors = {
  none: 'bg-gray-200',
  red: 'bg-red-400',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
};

export default function Inspector({ document: doc, onSave, snapshots = [], onCreateSnapshot }) {
  const { t } = useLanguage();
  const [synopsis, setSynopsis] = useState('');
  const [notes, setNotes] = useState('');
  const [label, setLabel] = useState('none');
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    if (doc) {
      setSynopsis(doc.synopsis || '');
      setNotes(doc.notes || '');
      setLabel(doc.label || 'none');
      setStatus(doc.status || 'todo');
    }
  }, [doc?.id]);

  const handleSave = (field, value) => {
    if (!doc) return;
    onSave(doc.id, { [field]: value });
  };

  if (!doc) return null;

  return (
    <div className="h-full flex flex-col bg-white border-l border-[var(--ink-border)]">
      <Tabs defaultValue="synopsis" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-[var(--ink-border-subtle)] bg-transparent px-2 pt-2">
          <TabsTrigger value="synopsis" className="text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--ink-accent)] rounded-none">
            {t('editor.synopsis')}
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--ink-accent)] rounded-none">
            {t('editor.notes')}
          </TabsTrigger>
          <TabsTrigger value="snapshots" className="text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--ink-accent)] rounded-none">
            {t('editor.snapshots')}
          </TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--ink-accent)] rounded-none">
            {t('editor.metadata')}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-3">
          <TabsContent value="synopsis" className="mt-0">
            <Textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              onBlur={() => handleSave('synopsis', synopsis)}
              placeholder={t('editor.synopsis')}
              className="border-[var(--ink-border-subtle)] resize-none min-h-[200px] text-sm"
            />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => handleSave('notes', notes)}
              placeholder={t('editor.notes')}
              className="border-[var(--ink-border-subtle)] resize-none min-h-[200px] text-sm"
            />
          </TabsContent>

          <TabsContent value="snapshots" className="mt-0 space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={onCreateSnapshot}
            >
              <Camera className="w-3 h-3 mr-1.5" />
              {t('editor.snapshots')}
            </Button>
            {snapshots.map(snap => (
              <div key={snap.id} className="p-3 rounded-lg border border-[var(--ink-border-subtle)] text-xs">
                <p className="font-medium text-[var(--ink-text)]">{snap.title}</p>
                <p className="text-[var(--ink-text-muted)] mt-1">
                  {new Date(snap.created_date).toLocaleString()} · {snap.word_count} words
                </p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="metadata" className="mt-0 space-y-4">
            <div>
              <Label className="text-xs text-[var(--ink-text-muted)]">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => { setStatus(v); handleSave('status', v); }}
              >
                <SelectTrigger className="mt-1 h-8 text-xs border-[var(--ink-border-subtle)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="revised">Revised</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[var(--ink-text-muted)]">Label</Label>
              <div className="flex gap-2 mt-2">
                {Object.entries(labelColors).map(([key, color]) => (
                  <button
                    key={key}
                    className={`w-6 h-6 rounded-full ${color} transition-all ${label === key ? 'ring-2 ring-offset-2 ring-[var(--ink-accent)]' : 'hover:scale-110'}`}
                    onClick={() => { setLabel(key); handleSave('label', key); }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-[var(--ink-text-muted)]">Word Count</Label>
              <p className="text-sm font-medium mt-1">{(doc.word_count || 0).toLocaleString()}</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}