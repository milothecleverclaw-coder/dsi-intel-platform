'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Save, Check } from 'lucide-react';

interface NarrativePanelProps {
  caseId: string;
}

export function NarrativePanel({ caseId }: NarrativePanelProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing narrative
  useEffect(() => {
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        setContent(data.case_narrative || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [caseId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content && !saving) {
        saveNarrative(content, false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [content, saving]);

  const saveNarrative = useCallback(async (text: string, showFeedback = true) => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_narrative: text }),
      });
      setLastSaved(new Date());
      if (showFeedback) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('Failed to save narrative:', e);
    } finally {
      setSaving(false);
    }
  }, [caseId]);

  const handleFormat = (format: 'bold' | 'italic' | 'heading' | 'bullet') => {
    const textarea = document.getElementById('narrative-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'ตัวหนา'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'ตัวเอียง'}*`;
        break;
      case 'heading':
        formattedText = `\n### ${selectedText || 'หัวข้อ'}\n`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText || 'รายการ'}\n`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center text-slate-500">
          กำลังโหลด...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-slate-50 flex items-center gap-2">
            <FileText className="h-5 w-5 text-yellow-500" />
            สำนวนคดี
          </CardTitle>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-slate-500">
                บันทึกล่าสุด: {lastSaved.toLocaleTimeString('th-TH')}
              </span>
            )}
            <Button
              onClick={() => saveNarrative(content, true)}
              disabled={saving}
              className={`${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white disabled:opacity-50`}
              size="sm"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  บันทึกแล้ว
                </>
              ) : saving ? (
                'กำลังบันทึก...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  บันทึก
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat('bold')}
              className="text-slate-300 hover:text-slate-50 hover:bg-slate-800 font-bold"
            >
              B
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat('italic')}
              className="text-slate-300 hover:text-slate-50 hover:bg-slate-800 italic"
            >
              I
            </Button>
            <div className="w-px h-6 bg-slate-700" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat('heading')}
              className="text-slate-300 hover:text-slate-50 hover:bg-slate-800"
            >
              หัวข้อ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat('bullet')}
              className="text-slate-300 hover:text-slate-50 hover:bg-slate-800"
            >
              รายการ
            </Button>
          </div>

          {/* Editor */}
          <textarea
            id="narrative-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="เขียนสำนวนคดีที่นี่..."
            className="w-full min-h-[500px] p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 resize-none font-mono text-sm leading-relaxed"
            spellCheck={false}
          />

          {/* Preview */}
          {content && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">ตัวอย่าง</h4>
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg prose prose-invert prose-sm max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap">
                  {content.split('\n').map((line, i) => {
                    // Simple markdown rendering
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-bold text-slate-50 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4 text-slate-300">{line.replace('- ', '')}</li>;
                    }
                    // Handle bold and italic
                    let formatted = line
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>');
                    return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
