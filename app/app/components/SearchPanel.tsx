'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, FileText, Video, Pin, Eye, X, Loader2, Download, UserCheck } from 'lucide-react';

interface SearchPanelProps {
  caseId: string;
}

interface DocumentResult {
  evidence_id: string;
  filename: string;
  display_name: string;
  file_type: string;
  text?: string;
  extracted_text?: string; // Full text from DB
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

  // Preview and Pin states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResult | null>(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPinButton, setShowPinButton] = useState(false);
  
  // Pin Creation Dialog states
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [pinImportance, setPinImportance] = useState('medium');
  const [pinLoading, setPinLoading] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      // Fetch all evidence for this case
      const res = await fetch(`/api/evidence?caseId=${caseId}`);
      const data = await res.json();
      const docs = data.filter((e: any) => e.file_type === 'document' || e.file_type === 'image');
      setDocResults(docs.map((d: any) => ({
        ...d,
        text: d.extracted_text ? d.extracted_text.substring(0, 200) + '...' : 'ไม่มีข้อมูลข้อความ'
      })));

      // Fetch personas for pinning
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
      
      // The search API might not return the full extracted_text, 
      // we'll need to fetch it when a document is clicked if missing.
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
      // Ensure we have the full extracted text
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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setHighlightedText(selection.toString().trim());
      
      // Position the button near the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setMousePos({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 40
      });
      setShowPinButton(true);
    } else {
      setShowPinButton(false);
    }
  };

  const openPinDialog = () => {
    setSelectedPersonas([]);
    setPinImportance('medium');
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
                    <div className="mt-4 flex items-center justify-between">
                       <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 uppercase tracking-tighter">
                         {result.file_type}
                       </Badge>
                       <span className="text-[10px] text-slate-600">คลิกเพื่อดูและปักหมุด</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {docResults.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                   ไม่พบเอกสารที่ตรงกับการค้นหา
                </div>
              )}
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

          {videoResults.map((result, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-900/30 text-purple-400 border border-purple-800">
                    <Video className="h-3 w-3 mr-1" />
                    วิดีโอ
                  </Badge>
                  <span className="text-sm text-slate-400">{result.start}s - {result.end}s</span>
                </div>
                <p className="font-medium text-slate-50">{result.title || result.text || 'พบฉากที่ตรงกับการค้นหา'}</p>
                <Button 
                  size="sm" 
                  className="mt-3 bg-yellow-300 hover:bg-yellow-400 text-slate-900" 
                  onClick={() => {
                     // Simple pin for video
                     fetch('/api/pins', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          case_id: caseId,
                          pin_type: 'video',
                          context: result.text || 'พบฉากจากการค้นหาวิดีโอ',
                          importance: 'medium',
                          timestamp_start: result.start,
                          timestamp_end: result.end
                        })
                     }).then(() => alert('สร้างหมุดสำเร็จ'));
                  }}
                >\n                  <Pin className=\"h-3 w-3 mr-1\" />\n                  สร้างหมุด\n                </Button>\n              </CardContent>\n            </Card>\n          ))}\n        </TabsContent>\n      </Tabs>\n\n      {/* Document Preview with Highlight to Pin */}\n      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>\n        <DialogContent className=\"max-w-6xl w-[95vw] h-[90vh] bg-slate-800 border-slate-700 text-slate-50 p-0 overflow-hidden flex flex-col\">\n          <DialogHeader className=\"p-6 pb-2 border-b border-slate-700\">\n            <div className=\"flex justify-between items-start\">\n              <div>\n                <DialogTitle className=\"text-xl text-slate-50 flex items-center gap-2\">\n                  <FileText className=\"h-5 w-5 text-blue-400\" />\n                  {selectedDoc?.display_name || 'ตัวอย่างเอกสาร'}\n                </DialogTitle>\n                <DialogDescription className=\"text-slate-400 mt-1\">\n                  {selectedDoc?.filename}\n                </DialogDescription>\n              </div>\n              <Button \n                variant=\"ghost\" \n                size=\"icon\" \n                onClick={() => setPreviewOpen(false)}\n                className=\"text-slate-400 hover:text-slate-50\"\n              >\n                <X className=\"h-5 w-5\" />\n              </Button>\n            </div>\n          </DialogHeader>\n\n          <div className=\"flex-1 flex overflow-hidden\">\n            {/* Left Pane: Raw content placeholder */}\n            <div className=\"flex-1 border-r border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-8 text-center\">\n              <div className=\"bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl mb-6\">\n                {selectedDoc?.file_type === 'image' ? (\n                  <Video className=\"h-24 w-24 text-green-500 opacity-50\" />\n                ) : (\n                  <FileText className=\"h-24 w-24 text-blue-500 opacity-50\" />\n                )}\n              </div>\n              <h3 className=\"text-lg font-medium text-slate-200 mb-2\">{selectedDoc?.filename}</h3>\n              <p className=\"text-slate-500 max-w-xs mb-6\">\n                ตัวอย่างไฟล์ต้นฉบับ\n              </p>\n              <Button \n                variant=\"outline\" \n                className=\"border-slate-700 text-slate-300 hover:bg-slate-800\"\n              >\n                <Download className=\"h-4 w-4 mr-2\" />\n                ดาวน์โหลดไฟล์\n              </Button>\n            </div>\n\n            {/* Right Pane: Extracted Text with Pinning */}\n            <div className=\"flex-1 flex flex-col bg-slate-900/50 relative\">\n              <div className=\"p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center sticky top-0 z-10\">\n                <span className=\"text-sm font-semibold text-slate-300 uppercase tracking-wider\">ข้อความที่สกัดได้</span>\n                <div className=\"flex items-center gap-2\">\n                   <span className=\"text-[10px] text-slate-500\">ไฮไลท์ข้อความเพื่อปักหมุด</span>\n                   <Badge variant=\"outline\" className=\"border-yellow-600/30 text-yellow-500 text-[10px]\">\n                     OCR CONTENT\n                   </Badge>\n                </div>\n              </div>\n              \n              <ScrollArea className=\"flex-1 p-6\" onMouseUp={handleTextSelection}>\n                <div \n                  ref={textRef}\n                  className=\"text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed selection:bg-yellow-500 selection:text-slate-900\"\n                >\n                  {selectedDoc?.extracted_text || 'ไม่มีข้อความที่สกัดไว้'}\n                </div>\n              </ScrollArea>\n\n              {/* Floating Pin Button */}\n              {showPinButton && (\n                <Button\n                  size=\"sm\"\n                  className=\"fixed z-[100] bg-yellow-500 hover:bg-yellow-600 text-slate-900 shadow-xl border border-yellow-400 animate-in fade-in zoom-in duration-200\"\n                  style={{ \n                    left: mousePos.x, \n                    top: mousePos.y, \n                    transform: 'translateX(-50%)'\n                  }}\n                  onClick={openPinDialog}\n                >\n                  <Pin className=\"h-4 w-4 mr-2\" />\n                  สร้างหมุดจากส่วนที่เลือก\n                </Button>\n              )}\n            </div>\n          </div>\n        </DialogContent>\n      </Dialog>\n\n      {/* Create Pin Sub-Dialog */}\n      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>\n        <DialogContent className=\"bg-slate-800 border-slate-700 text-slate-50\">\n          <DialogHeader>\n            <DialogTitle className=\"flex items-center gap-2\">\n               <Pin className=\"h-5 w-5 text-yellow-500\" />\n               ยืนยันการสร้างหมุด\n            </DialogTitle>\n            <DialogDescription className=\"text-slate-400\">\n              สร้างหมุดข้อมูลสำคัญจากข้อความที่ไฮไลท์\n            </DialogDescription>\n          </DialogHeader>\n\n          <div className=\"space-y-4 py-4\">\n            <div>\n              <Label className=\"text-xs text-slate-500 uppercase\">ข้อความที่เลือก</Label>\n              <div className=\"mt-1 p-3 bg-slate-900 rounded border border-slate-700 text-sm italic text-slate-300 line-clamp-4\">\n                \"{highlightedText}\"\n              </div>\n            </div>\n\n            <div>\n              <Label className=\"text-xs text-slate-500 uppercase mb-2 block\">ระบุบุคคลที่เกี่ยวข้อง (Persona)</Label>\n              <ScrollArea className=\"h-[150px] border border-slate-700 rounded bg-slate-900 p-2\">\n                <div className=\"space-y-2\">\n                  {personas.map((p) => (\n                    <div key={p.persona_id} className=\"flex items-center space-x-2 p-1 hover:bg-slate-800 rounded transition-colors\">\n                      <Checkbox \n                        id={p.persona_id} \n                        checked={selectedPersonas.includes(p.persona_id)}\n                        onCheckedChange={(checked) => {\n                          if (checked) {\n                            setSelectedPersonas([...selectedPersonas, p.persona_id]);\n                          } else {\n                            setSelectedPersonas(selectedPersonas.filter(id => id !== p.persona_id));\n                          }\n                        }}\n                        className=\"border-slate-600 data-[state=checked]:bg-yellow-500\"\n                      />\n                      <label \n                        htmlFor={p.persona_id} \n                        className=\"text-sm text-slate-300 flex-1 cursor-pointer\"\n                      >\n                        {p.first_name_th} {p.last_name_th}\n                      </label>\n                    </div>\n                  ))}\n                  {personas.length === 0 && (\n                    <p className=\"text-xs text-slate-600 text-center py-4\">ไม่พบข้อมูลบุคคลในคดีนี้</p>\n                  )}\n                </div>\n              </ScrollArea>\n            </div>\n\n            <div>\n              <Label className=\"text-xs text-slate-500 uppercase mb-2 block\">ระดับความสำคัญ</Label>\n              <div className=\"flex gap-2\">\n                {['low', 'medium', 'high'].map((level) => (\n                  <Button\n                    key={level}\n                    size=\"sm\"\n                    variant={pinImportance === level ? 'default' : 'outline'}\n                    className={pinImportance === level \n                      ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-600' \n                      : 'border-slate-700 text-slate-400 hover:bg-slate-700'}\n                    onClick={() => setPinImportance(level)}\n                  >\n                    {level === 'low' ? 'ต่ำ' : level === 'medium' ? 'กลาง' : 'สูง'}\n                  </Button>\n                ))}\n              </div>\n            </div>\n          </div>\n\n          <DialogFooter>\n            <Button \n              variant=\"ghost\" \n              onClick={() => setPinDialogOpen(false)}\n              className=\"text-slate-400 hover:text-slate-50\"\n            >\n              ยกเลิก\n            </Button>\n            <Button \n              onClick={createPin} \n              disabled={pinLoading}\n              className=\"bg-yellow-500 hover:bg-yellow-600 text-slate-900\"\n            >\n              {pinLoading ? <Loader2 className=\"h-4 w-4 animate-spin mr-2\" /> : <Pin className=\"h-4 w-4 mr-2\" />}\n              บันทึกหมุด\n            </Button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n    </div>\n  );\n}\n