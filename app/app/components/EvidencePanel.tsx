'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, Video, Image, Music, File, Eye, X, Loader2 } from 'lucide-react';

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

interface PreviewResult {
  success: boolean;
  filename: string;
  fileType: string;
  extractedText: string;
  pages: any[];
  tables: any[];
  wordCount: number;
  characterCount: number;
}

export function EvidencePanel({ caseId }: EvidencePanelProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/evidence?caseId=${caseId}`)
      .then((r) => r.json())
      .then(setEvidence)
      .finally(() => setInitialLoading(false));
  }, [caseId]);

  const upload = async (extractedText?: string) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('displayName', displayName || file.name);
    if (extractedText) {
      formData.append('extractedText', extractedText);
    }

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

  const previewDocument = async () => {
    if (!file) return;
    
    // Only allow preview for supported document types
    const isDocument = file.type.includes('pdf') || 
                      file.type.includes('word') || 
                      file.type.includes('text') ||
                      file.type.includes('image') ||
                      file.name.endsWith('.pdf') ||
                      file.name.endsWith('.doc') ||
                      file.name.endsWith('.docx') ||
                      file.name.endsWith('.txt');
    
    if (!isDocument) {
      setPreviewError('ไฟล์ประเภทนี้ไม่รองรับการแสดงตัวอย่าง (รองรับเฉพาะ PDF, Word, Text, รูปภาพ)');
      setPreviewOpen(true);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewResult(null);
    setPreviewOpen(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/evidence/preview', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Preview failed');
      }

      setPreviewResult(data);
    } catch (e: any) {
      setPreviewError(e.message || 'เกิดข้อผิดพลาดในการแสดงตัวอย่าง');
    } finally {
      setPreviewLoading(false);
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
            <Upload className="h-5 w-5 text-yellow-500" />
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
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => upload()} 
              disabled={!file || loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 flex-1"
            >
              {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
            </Button>
            <Button 
              onClick={previewDocument}
              disabled={!file || previewLoading}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-50"
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  ตัวอย่างผลลัพธ์
                </>
              )}
            </Button>
          </div>
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
          {initialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-4 bg-slate-700" />
                  <Skeleton className="h-4 flex-1 bg-slate-700" />
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-800 border-slate-700 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-slate-50 flex items-center gap-2">
              <Eye className="h-5 w-5 text-yellow-500" />
              ตัวอย่างผลลัพธ์
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {previewResult?.filename || 'กำลังโหลด...'}
            </DialogDescription>
          </DialogHeader>

          {previewLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mb-4" />
              <p className="text-slate-400">กำลังวิเคราะห์เอกสาร...</p>
            </div>
          )}

          {previewError && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400">{previewError}</p>
            </div>
          )}

          {previewResult && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {previewResult.pages.length} หน้า
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {previewResult.wordCount.toLocaleString()} คำ
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {previewResult.characterCount.toLocaleString()} ตัวอักษร
                </Badge>
                {previewResult.tables.length > 0 && (
                  <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                    {previewResult.tables.length} ตาราง
                  </Badge>
                )}
              </div>

              {/* Extracted Text */}
              <ScrollArea className="h-[400px] border border-slate-700 rounded-lg bg-slate-900/50">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">ข้อความที่สกัดได้:</h4>
                  <div className="text-slate-400 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {previewResult.extractedText || 'ไม่พบข้อความในเอกสาร'}
                  </div>
                </div>
              </ScrollArea>

              {/* Tables */}
              {previewResult.tables.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-300">ตารางที่พบ:</h4>
                  {previewResult.tables.map((table, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                      <p className="text-xs text-slate-500 mb-2">
                        ตาราง {idx + 1}: {table.rowCount} แถว × {table.columnCount} คอลัมน์
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <Button 
                  variant="ghost" 
                  onClick={() => setPreviewOpen(false)}
                  className="text-slate-400 hover:text-slate-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  ปิด
                </Button>
                <Button 
                  onClick={() => {
                    setPreviewOpen(false);
                    upload(previewResult.extractedText);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  บันทึก
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
