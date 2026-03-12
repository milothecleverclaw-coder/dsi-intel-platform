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
import { Search, FileText, Video, Pin, Eye, X, Loader2, Download } from 'lucide-react';

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
  const [docQuery, setDocQuery] = useState('');
  const [videoQuery, setVideoQuery] = useState('');
  const [docResults, setDocResults] = useState<DocumentResult[]>([]);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResult | null>(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPinButton, setShowPinButton] = useState(false);
  
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [pinImportance, setPinImportance] = useState('medium');
  const [pinLoading, setPinLoading] = useState(false);
  const [incidentDate, setIncidentDate] = useState('');

  const textRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/evidence?caseId=${caseId}`);
      const data = await res.json();
      const docs = data.filter((e: any) => e.file_type === 'document' || e.file_type === 'image');
      setDocResults(docs.map((d: any) => ({
        ...d,
        text: d.extracted_text ? d.extracted_text.substring(0, 200) + '...' : 'ไม่มีข้อมูลข้อความ'
      })));

      const pRes = await fetch(`/api/personas?caseId=${caseId}`);
      const pData = await pRes.json();
      setPersonas(pData);
    } catch (e) {
      console.error('Failed to fetch initial search data:', e);
    } finally {
      setInitialLoading(false);
    }
  }, [caseId]);

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
    if (!videoQuery) return;
    setLoading(true);
    try {
      const res = await fetch('/api/search/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, query: videoQuery }),
      });
      const data = await res.json();
      setVideoResults(data.data || []);
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
    setPinDialogOpen(true);
    setShowPinButton(false);
  };

  const createPin = async () => {
    if (!selectedDoc || !highlightedText) return;
    
    setPinLoading(true);
    try {
      const res = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          pin_type: 'document',
          context: highlightedText,
          importance: pinImportance,
          incident_date: incidentDate || null,
          evidence_id: selectedDoc.evidence_id,
          tagged_personas: selectedPersonas,
          ai_context_data: {
             original_filename: selectedDoc.filename,
             selection_source: 'search_highlight'
          }
        }),
      });
      
      if (res.ok) {
        alert('สร้างหมุดสำเร็จ');
        setPinDialogOpen(false);
        setHighlightedText('');
        window.getSelection()?.removeAllRanges();
      } else {
        alert('สร้างหมุดไม่สำเร็จ');
      }
    } catch (e) {
      alert('สร้างหมุดไม่สำเร็จ');
    } finally {
      setPinLoading(false);
    }
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
        </TabsContent>
      </Tabs>

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
            <div className="flex-1 border-r border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl mb-6">
                <FileText className="h-24 w-24 text-blue-500 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">{selectedDoc?.filename}</h3>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลดไฟล์
              </Button>
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
              <Label className="text-xs text-slate-500 uppercase mb-2 block">ระบุบุคคลที่เกี่ยวข้อง</Label>
              <ScrollArea className="h-[150px] border border-slate-700 rounded bg-slate-900 p-2">
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
            <Button onClick={createPin} disabled={pinLoading} className="bg-yellow-500 text-slate-900">
              {pinLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
              บันทึกหมุด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
