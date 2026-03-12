'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Video, Pin } from 'lucide-react';

interface SearchPanelProps {
  caseId: string;
}

export function SearchPanel({ caseId }: SearchPanelProps) {
  const [docQuery, setDocQuery] = useState('');
  const [videoQuery, setVideoQuery] = useState('');
  const [docResults, setDocResults] = useState<any[]>([]);
  const [videoResults, setVideoResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchDocs = async () => {
    if (!docQuery) return;
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

  const createPin = async (type: string, data: any) => {
    try {
      const res = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          pin_type: type,
          context: data.text || data.title || 'พบจากการค้นหา',
          importance: 'medium',
          evidence_id: data.evidence_id || null,
        }),
      });
      if (res.ok) {
        alert('สร้างหมุดสำเร็จ');
      } else {
        alert('สร้างหมุดไม่สำเร็จ');
      }
    } catch (e) {
      alert('สร้างหมุดไม่สำเร็จ');
    }
  };

  return (
    <Tabs defaultValue="docs" className="space-y-6">
      <TabsList className="bg-slate-800 border border-slate-700">
        <TabsTrigger 
          value="docs" 
          className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400"
        >
          <FileText className="h-4 w-4 mr-2" />
          ค้นหาในเอกสาร
        </TabsTrigger>
        <TabsTrigger 
          value="videos"
          className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400"
        >
          <Video className="h-4 w-4 mr-2" />
          ค้นหาในวิดีโอ
        </TabsTrigger>
      </TabsList>

      <TabsContent value="docs" className="space-y-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-50 flex items-center gap-2">
              <Search className="h-5 w-5 text-red-600" />
              ค้นหาในเอกสาร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                placeholder="เช่น โอนเงิน, สัญญา, ใบเสร็จ..."
                onKeyDown={(e) => e.key === 'Enter' && searchDocs()}
                className="flex-1 bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
              />
              <Button 
                onClick={searchDocs} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {docResults.map((result, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                จาก: {result.filename}
              </p>
              <p className="font-medium text-slate-50">{result.text}</p>
              <Button 
                size="sm" 
                className="mt-3 bg-yellow-300 hover:bg-yellow-400 text-slate-900" 
                onClick={() => createPin('document', result)}
              >
                <Pin className="h-3 w-3 mr-1" />
                สร้างหมุด
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="videos" className="space-y-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-50 flex items-center gap-2">
              <Search className="h-5 w-5 text-red-600" />
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
                className="flex-1 bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
              />
              <Button 
                onClick={searchVideos} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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
                onClick={() => createPin('video', result)}
              >
                <Pin className="h-3 w-3 mr-1" />
                สร้างหมุด
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
