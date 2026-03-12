'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Evidence {
  evidence_id: string;
  filename: string;
  display_name: string;
  file_type: string;
  uploaded_at: string;
  blob_path: string;
}

interface EvidencePanelProps {
  caseId: string;
}

export function EvidencePanel({ caseId }: EvidencePanelProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/evidence?caseId=${caseId}`)
      .then((r) => r.json())
      .then(setEvidence);
  }, [caseId]);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('displayName', displayName || file.name);

    try {
      await fetch('/api/evidence', { method: 'POST', body: formData });
      setFile(null);
      setDisplayName('');
      const refreshed = await fetch(`/api/evidence?caseId=${caseId}`).then((r) => r.json());
      setEvidence(refreshed);
    } catch (e) {
      alert('อัปโหลดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'video') return '🎥';
    if (type === 'audio') return '🎵';
    if (type === 'image') return '🖼️';
    return '📄';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>อัปโหลดหลักฐานใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">เลือกไฟล์</label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="text-sm font-medium">ชื่อแสดง (optional)</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={file?.name || 'ชื่อที่ต้องการแสดง'} />
          </div>
          <Button onClick={upload} disabled={!file || loading}>
            {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>หลักฐานในคดี ({evidence.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ไฟล์</TableHead>
                <TableHead>ชื่อแสดง</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>วันที่อัปโหลด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evidence.map((e) => (
                <TableRow key={e.evidence_id}>
                  <TableCell>{getFileIcon(e.file_type)} {e.filename}</TableCell>
                  <TableCell>{e.display_name}</TableCell>
                  <TableCell><Badge variant="outline">{e.file_type}</Badge></TableCell>
                  <TableCell>{new Date(e.uploaded_at).toLocaleDateString('th-TH')}</TableCell>
                </TableRow>
              ))}
              {evidence.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">ยังไม่มีหลักฐาน</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
