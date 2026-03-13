'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Search, FileText, Video, Pin, Eye, X, Loader2, Download, PlayCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { trpc } from '@/lib/trpc/react';
import { toast } from 'sonner';

interface SearchPanelProps {
  caseId: string;
}

interface DocumentResult {
  evidence_id: string;
  filename: string;
  display_name: string;
  file_type: string;
  text?: string;
  extracted_text?: string;
}

interface Persona {
  persona_id: string;
  first_name_th: string;
  last_name_th: string;
}

export function SearchPanel({ caseId }: SearchPanelProps) {
  const createPin = trpc.pin.create.useMutation({
    onSuccess: () => {
      toast.success('สร้างหมุดสำเร็จ');
      setPinDialogOpen(false);
      setHighlightedText('');
      window.getSelection()?.removeAllRanges();
    },
    onError: (error) => {
      toast.error(`สร้างหมุดไม่สำเร็จ: ${error.message}`);
    },
  });

  const [docQuery, setDocQuery] = useState('');
  const [videoQuery, setVideoQuery] = useState('');
  const [docResults, setDocResults] = useState<DocumentResult[]>([]);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [caseIndexId, setCaseIndexId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResult | null>(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPinButton, setShowPinButton] = useState(false);
  
  // SAS URL for document preview
  const [sasLoading, setSasLoading] = useState(false);
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [pinImportance, setPinImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [incidentDate, setIncidentDate] = useState('');
  const [pinNotes, setPinNotes] = useState('');

  // Video Search Preview
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [selectedVideoResult, setSelectedVideoResult] = useState<any>(null);

  const textRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      // Fetch documents
      const res = await fetch(`/api/evidence?caseId=${caseId}`);
      const data = await res.json();
      const docs = data.filter((e: any) => e.file_type === 'document' || e.file_type === 'image');
      setDocResults(docs.map((d: any) => ({
        ...d,
        text: d.extracted_text ? d.extracted_text.substring(0, 200) + '...' : 'ไม่มีข้อมูลข้อความ'
      })));

      // Fetch videos
      const videosRes = await fetch(`/api/videos/list?caseId=${caseId}`);
      const videosData = await videosRes.json();
      setAllVideos(videosData.videos || []);
      setCaseIndexId(videosData.indexId || null);
      setVideoResults(videosData.videos || []);

      // Fetch personas
      const pRes = await fetch(`/api/personas?caseId=${caseId}`);
      const pData = await pRes.json();
      setPersonas(pData);
    } catch (e) {
      console.error('Failed to fetch initial search data:', e);
    } finally {
      setInitialLoading(false);
    }
  }, [caseId]);

  // Fetch SAS URL when document preview opens
  useEffect(() => {
    if (previewOpen && selectedDoc) {
      setSasLoading(true);
      setSasUrl(null);
      fetch(`/api/evidence/file/${selectedDoc.evidence_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setSasUrl(data.url);
          }
        })
        .catch(err => console.error('Failed to fetch SAS URL:', err))
        .finally(() => setSasLoading(false));
    } else if (!previewOpen) {
      setSasUrl(null);
    }
  }, [previewOpen, selectedDoc]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const searchDocs = async () => {
    if (!docQuery) {
      fetchInitialData();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/search/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, query: docQuery }),
      });
      const data = await res.json();
      setDocResults(data.results || []);
    } catch (e) {
      alert('ค้นหาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const searchVideos = async () => {
    // If no query, show all videos
    if (!videoQuery) {
      setVideoResults(allVideos);
      return;
    }
    
    if (!caseIndexId) {
      alert('Video index not configured for this case');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/search/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexId: caseIndexId, query_text: videoQuery }),
      });
      const data = await res.json();
      
      // Map Twelve Labs results to our UI format
      const results = data.data?.map((item: any) => ({
        video_id: item.video_id,
        start: item.start,
        end: item.end,
        score: item.score,
        thumbnail_url: item.thumbnail_url,
        hls_url: item.hls?.url,
        video_url: `https://dsiintelplatform.blob.core.windows.net/evidence/${caseId}/${item.video_id}`, // Fallback
        metadata: {
          text: item.metadata?.find((m: any) => m.type === 'text_in_video')?.value || 
                item.metadata?.find((m: any) => m.type === 'conversation')?.value
        }
      })) || [];
      
      setVideoResults(results);
    } catch (e) {
      alert('ค้นหาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleDocClick = async (doc: DocumentResult) => {
    setLoading(true);
    try {
      let fullDoc = doc;
      if (!doc.extracted_text) {
        const res = await fetch(`/api/evidence?caseId=${caseId}`);
        const allEv = await res.json();
        const found = allEv.find((e: any) => e.evidence_id === doc.evidence_id);
        if (found) fullDoc = { ...doc, extracted_text: found.extracted_text };
      }
      setSelectedDoc(fullDoc);
      setPreviewOpen(true);
      setShowPinButton(false);
    } catch (e) {
      console.error('Failed to load document preview:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setHighlightedText(selection.toString().trim());
      
      const containerRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      setMousePos({
        x: x,
        y: y - 10
      });
      setShowPinButton(true);
    } else {
      setShowPinButton(false);
    }
  };

  const openPinDialog = () => {
    setSelectedPersonas([]);
    setPinImportance('medium');
    setIncidentDate('');
    setPinNotes('');
    setPinDialogOpen(true);
    setShowPinButton(false);
  };

  const createPinHandler = async () => {
    if (!selectedDoc || !highlightedText) return;
    
    createPin.mutate({
      case_id: caseId,
      pin_type: 'document',
      context: highlightedText,
      importance: pinImportance,
      incident_date: incidentDate ? new Date(incidentDate).toISOString() : null,
      evidence_id: selectedDoc.evidence_id,
      tagged_personas: selectedPersonas,
      ai_context_data: {
        original_filename: selectedDoc.filename,
        selection_source: 'search_highlight'
      },
      notes: pinNotes || null,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="docs" className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger 
            value="docs" 
            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-900 text-slate-400"
          >
            <FileText className="h-4 w-4 mr-2" />
            ค้นหาในเอกสาร
          </TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-slate-900 text-slate-400"
          >
            <Video className="h-4 w-4 mr-2" />
            ค้นหาในวิดีโอ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-50 flex items-center gap-2">
                <Search className="h-5 w-5 text-yellow-500" />
                ค้นหาในเอกสาร
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={docQuery}
                  onChange={(e) => setDocQuery(e.target.value)}
                  placeholder="เช่น โอนเงิน, สัญญา, ใบเสร็จ... (หรือเว้นว่างเพื่อดูทั้งหมด)"
                  onKeyDown={(e) => e.key === 'Enter' && searchDocs()}
                  className="flex-1 bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
                <Button 
                  onClick={searchDocs} 
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-yellow-500" />
              <p>กำลังโหลดรายการเอกสาร...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docResults.map((result, i) => (
                <Card 
                  key={i} 
                  className="bg-slate-800 border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                  onClick={() => handleDocClick(result)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {result.filename}
                      </p>
                      <Eye className="h-4 w-4 text-slate-600 group-hover:text-yellow-500 transition-colors" />
                    </div>
                    <p className="font-medium text-slate-50 line-clamp-3 text-sm">{result.text || 'ไม่มีพรีวิวข้อความ'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-50 flex items-center gap-2">
                <Search className="h-5 w-5 text-yellow-500" />
                ค้นหาในวิดีโอ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={videoQuery}
                  onChange={(e) => setVideoQuery(e.target.value)}
                  placeholder="เช่น คนสองคนนั่งโต๊ะ, ส่งซอง..."
                  onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
                  className="flex-1 bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
                <Button 
                  onClick={searchVideos} 
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoResults.map((result, i) => (
              <Card 
                key={i} 
                className="bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer group overflow-hidden"
                onClick={() => {
                  setSelectedVideoResult(result);
                  setVideoPreviewOpen(true);
                }}
              >
                <div className="aspect-video relative bg-slate-900">
                   <img 
                     src={result.thumbnail_url} 
                     alt="Video segment" 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <PlayCircle className="h-12 w-12 text-white/50 group-hover:text-orange-500 transition-colors" />
                   </div>
                   <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] text-white font-mono">
                     {Math.floor(result.start / 60).toString().padStart(2, '0')}:{(result.start % 60).toString().padStart(2, '0')} - {Math.floor(result.end / 60).toString().padStart(2, '0')}:{(result.end % 60).toString().padStart(2, '0')}
                   </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                      {result.video_id}
                    </p>
                    <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                      MATCH: {Math.round(result.score)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2 italic">
                    {result.metadata?.text || 'พบช่วงเวลาที่ตรงกับการค้นหา'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Preview Dialog */}
      <Dialog open={videoPreviewOpen} onOpenChange={setVideoPreviewOpen}>
        <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-slate-50 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-orange-500" />
              ผลการค้นหาวิดีโอ
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedVideoResult?.video_id}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-0">
            {selectedVideoResult && (selectedVideoResult.hls_url || selectedVideoResult.video_url) && (
              <div className="space-y-4">
                <VideoPlayer 
                  videoUrl={selectedVideoResult.hls_url || selectedVideoResult.video_url}
                  highlights={[{ start: selectedVideoResult.start, end: selectedVideoResult.end }]}
                  autoPlay={true}
                />
                
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Context</h4>
                  <p className="text-slate-300 text-sm">
                    {selectedVideoResult.metadata?.text || 'พบช่วงเวลาที่เกี่ยวข้องในช่วงนาทีที่ ' + Math.floor(selectedVideoResult.start/60) + ':' + (selectedVideoResult.start%60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-slate-800 border-slate-700 text-slate-50 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-2 border-b border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl text-slate-50 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  {selectedDoc?.display_name || 'ตัวอย่างเอกสาร'}
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-1">
                  {selectedDoc?.filename}
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 border-r border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-4">
              {sasLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : selectedDoc?.file_type === 'document' && sasUrl ? (
                <iframe
                  src={sasUrl}
                  className="w-full h-full rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="h-24 w-24 text-blue-500 opacity-50 mb-4" />
                  <p className="text-slate-400">Preview not available</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col bg-slate-900/50 relative">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
                <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">ข้อความที่สกัดได้</span>
              </div>
              
              <ScrollArea className="flex-1 p-6" onMouseUp={handleTextSelection}>
                <div 
                  ref={textRef}
                  className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed selection:bg-yellow-500 selection:text-slate-900"
                >
                  {selectedDoc?.extracted_text || 'ไม่มีข้อความที่สกัดไว้'}
                </div>
                {showPinButton && (
                  <Button
                    size="sm"
                    className="absolute z-[100] bg-yellow-500 hover:bg-yellow-600 text-slate-900 shadow-xl border border-yellow-400"
                    style={{ 
                      left: mousePos.x, 
                      top: mousePos.y, 
                      transform: 'translate(-50%, -100%)'
                    }}
                    onClick={openPinDialog}
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    สร้างหมุด
                  </Button>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Pin className="h-5 w-5 text-yellow-500" />
               ยืนยันการสร้างหมุด
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs text-slate-500 uppercase">ข้อความที่เลือก</Label>
              <div className="mt-1 p-3 bg-slate-900 rounded border border-slate-700 text-sm italic text-slate-300 line-clamp-4">
                "{highlightedText}"
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">วันที่เกิดเหตุ (ไม่ระบุก็ได้)</Label>
              <Input 
                type="date" 
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-50"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">หมายเหตุ (Notes)</Label>
              <textarea
                value={pinNotes}
                onChange={(e) => setPinNotes(e.target.value)}
                placeholder="เพิ่มหมายเหตุ..."
                className="w-full h-20 p-3 bg-slate-900 border border-slate-700 rounded text-slate-50 placeholder:text-slate-600 text-sm resize-none focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">ระบุบุคคลที่เกี่ยวข้อง</Label>
              <ScrollArea className="h-[120px] border border-slate-700 rounded bg-slate-900 p-2">
                <div className="space-y-2">
                  {personas.map((p) => (
                    <div 
                      key={p.persona_id} 
                      className={`flex items-center space-x-2 p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer ${selectedPersonas.includes(p.persona_id) ? 'bg-slate-700' : ''}`}
                      onClick={() => {
                        if (selectedPersonas.includes(p.persona_id)) {
                          setSelectedPersonas(selectedPersonas.filter(id => id !== p.persona_id));
                        } else {
                          setSelectedPersonas([...selectedPersonas, p.persona_id]);
                        }
                      }}
                    >
                      <div className={`w-4 h-4 rounded border border-slate-600 flex items-center justify-center ${selectedPersonas.includes(p.persona_id) ? 'bg-yellow-500 border-yellow-500' : ''}`}>
                        {selectedPersonas.includes(p.persona_id) && <div className="w-2 h-2 bg-slate-900 rounded-sm" />}
                      </div>
                      <span className="text-sm text-slate-300 flex-1">
                        {p.first_name_th} {p.last_name_th}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPinDialogOpen(false)} className="text-slate-400">ยกเลิก</Button>
            <Button 
              onClick={createPinHandler} 
              disabled={createPin.isPending} 
              className="bg-yellow-500 text-slate-900"
            >
              {createPin.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
              บันทึกหมุด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
