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
import { Upload, FileText, Video, Image, Music, File, Eye, X, Loader2, Download, AlertCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface Evidence {
  evidence_id: string;
  filename: string;
  display_name: string;
  file_type: string;
  uploaded_at: string;
  blob_path: string;
  extracted_text?: string;
  twelve_labs_task_id?: string;
  twelve_labs_index_id?: string;
  twelve_labs_video_id?: string;
  twelve_labs_status?: string;
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
  
  // Preview states for upload
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Saved evidence view states
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [savedPreviewOpen, setSavedPreviewOpen] = useState(false);
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [sasLoading, setSasLoading] = useState(false);

  // Clear SAS URL when dialog closes
  useEffect(() => {
    if (!savedPreviewOpen) {
      setSasUrl(null);
    }
  }, [savedPreviewOpen]);

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

  const openSavedPreview = async (ev: Evidence) => {
    setSelectedEvidence(ev);
    setSavedPreviewOpen(true);
    
    // Fetch SAS URL for the file
    if (ev.file_type === 'video' || ev.file_type === 'image') {
      setSasLoading(true);
      try {
        const res = await fetch(`/api/evidence/file/${ev.evidence_id}`);
        const data = await res.json();
        if (res.ok) {
          setSasUrl(data.url);
        } else {
          console.error('Failed to get SAS URL:', data.message);
        }
      } catch (e) {
        console.error('Error fetching SAS URL:', e);
      } finally {
        setSasLoading(false);
      }
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
                <TableRow 
                  key={e.evidence_id} 
                  className={`border-slate-700/50 hover:bg-slate-800/50 ${(e.file_type === 'document' || e.file_type === 'image') ? 'cursor-pointer' : ''}`}
                  onClick={() => openSavedPreview(e)}
                >
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

      {/* Saved Evidence Preview Dialog */}
      <Dialog open={savedPreviewOpen} onOpenChange={setSavedPreviewOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-slate-800 border-slate-700 text-slate-50 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-2 border-b border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl text-slate-50 flex items-center gap-2">
                  {selectedEvidence ? getFileIcon(selectedEvidence.file_type) : <Eye className="h-5 w-5 text-yellow-500" />}
                  {selectedEvidence?.display_name || 'ตัวอย่างหลักฐาน'}
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-1">
                  {selectedEvidence?.filename}
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSavedPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Pane: Raw content / Placeholder */}
            <div className="flex-1 border-r border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl mb-6 w-full max-w-2xl">
                {sasLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : selectedEvidence?.file_type === 'video' ? (
                  <VideoPlayer 
                    videoUrl={sasUrl || ''}
                  />
                ) : selectedEvidence?.file_type === 'image' ? (
                  sasUrl ? (
                    <img 
                      src={sasUrl} 
                      alt={selectedEvidence.filename}
                      className="max-h-96 max-w-full object-contain mx-auto rounded-lg"
                    />
                  ) : (
                    <Image className="h-24 w-24 text-green-500 opacity-50 mx-auto" />
                  )
                ) : (
                  <FileText className="h-24 w-24 text-blue-500 opacity-50 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">{selectedEvidence?.filename}</h3>
              {selectedEvidence?.file_type === 'video' && (
                <div className="mb-6 flex flex-col items-center gap-2">
                  <Badge className={`
                    ${selectedEvidence.twelve_labs_status === 'ready' ? 'bg-green-900/30 text-green-400' : 
                      selectedEvidence.twelve_labs_status === 'failed' ? 'bg-red-900/30 text-red-400' : 
                      'bg-yellow-900/30 text-yellow-400'} border border-current
                  `}>
                    Twelve Labs: {selectedEvidence.twelve_labs_status || 'pending'}
                  </Badge>
                  {selectedEvidence.twelve_labs_status !== 'ready' && (
                    <p className="text-[10px] text-slate-500">Indexing video for AI search...</p>
                  )}
                </div>
              )}
              <p className="text-slate-500 max-w-xs mb-6">
                {selectedEvidence?.file_type === 'video' 
                  ? 'วิดีโอถูกโหลดจาก Azure Blob Storage และพร้อมใช้งานสำหรับการวิเคราะห์'
                  : 'ตัวอย่างไฟล์ต้นฉบับยังไม่สามารถแสดงผลได้ในส่วนนี้ แต่คุณสามารถดาวน์โหลดเพื่อดูไฟล์เต็มได้'}
              </p>
              <Button 
                variant="outline" 
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                   alert('ดาวน์โหลดไฟล์: ' + selectedEvidence?.filename);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลดไฟล์
              </Button>
            </div>

            {/* Right Pane: Extracted Text */}
            <div className="flex-1 flex flex-col bg-slate-900/50">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">ข้อความที่สกัดได้ (Extracted Text)</span>
                {selectedEvidence?.extracted_text && (
                   <Badge variant="outline" className="border-yellow-600/30 text-yellow-500 text-[10px]">
                     POWERED BY AI
                   </Badge>
                )}
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {selectedEvidence?.extracted_text || (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 opacity-20" />
                      <p>ไม่มีข้อความที่สกัดไว้ในฐานข้อมูล</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog (The one used during upload) */}
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
              </div>

              <ScrollArea className="h-[400px] border border-slate-700 rounded-lg bg-slate-900/50">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">ข้อความที่สกัดได้:</h4>
                  <div className="text-slate-400 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {previewResult.extractedText || 'ไม่พบข้อความในเอกสาร'}
                  </div>
                </div>
              </ScrollArea>

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
