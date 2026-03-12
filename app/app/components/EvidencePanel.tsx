'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Video, Image, Music, File } from 'lucide-react';

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
    const className = "h-4 w-4";
    if (type === 'video') return <Video className={`${className} text-purple-400`} />;
    if (type === 'audio') return <Music className={`${className} text-amber-400`} />;
    if (type === 'image') return <Image className={`${className} text-green-400`} />;
    return <FileText className={`${className} text-blue-400`} />;
  };

  const getFileTypeColor = (type: string) => {
    if (type === 'video') return 'bg-purple-900/30 text-purple-400 border-purple-800';
    if (type === 'audio') return 'bg-amber-900/30 text-amber-400 border-amber-800';
    if (type === 'image') return 'bg-green-900/30 text-green-400 border-green-800';
    return 'bg-blue-900/30 text-blue-400 border-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-50 flex items-center gap-2">
            <Upload className="h-5 w-5 text-red-600" />
            อัปโหลดหลักฐานใหม่
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 bg-slate-900/50 hover:border-slate-600 transition-colors">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">เลือกไฟล์</label>
            <Input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-slate-900 border-slate-700 text-slate-50 file:bg-slate-800 file:text-slate-300 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อแสดง (optional)</label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder={file?.name || 'ชื่อที่ต้องการแสดง'}
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
            />
          </div>
          <Button 
            onClick={upload} 
            disabled={!file || loading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-50">
            หลักฐานในคดี <span className="text-slate-500 font-normal">({evidence.length} รายการ)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ไฟล์</TableHead>
                <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ชื่อแสดง</TableHead>
                <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ประเภท</TableHead>
                <TableHead className="text-slate-400 uppercase text-xs tracking-wide">วันที่อัปโหลด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evidence.map((e) => (
                <TableRow key={e.evidence_id} className="border-slate-700/50 hover:bg-slate-800/50">
                  <TableCell className="flex items-center gap-2 text-slate-50">
                    {getFileIcon(e.file_type)}
                    <span className="truncate max-w-[200px]">{e.filename}</span>
                  </TableCell>
                  <TableCell className="text-slate-300">{e.display_name}</TableCell>
                  <TableCell>
                    <Badge className={`${getFileTypeColor(e.file_type)} border`}>
                      {e.file_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {new Date(e.uploaded_at).toLocaleDateString('th-TH')}
                  </TableCell>
                </TableRow>
              ))}
              {evidence.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                    <File className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    ยังไม่มีหลักฐาน
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
