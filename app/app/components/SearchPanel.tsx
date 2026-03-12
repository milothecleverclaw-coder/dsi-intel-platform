'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
      await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          pin_type: type,
          context: data.text || data.title || 'พบจากการค้นหา',
          importance: 'medium',
        }),
      });
      alert('สร้าง Pin สำเร็จ');
    } catch (e) {
      alert('สร้าง Pin ไม่สำเร็จ');
    }
  };

  return (
    <Tabs defaultValue="docs" className="space-y-4">
      <TabsList>
        <TabsTrigger value="docs">ค้นหาในเอกสาร</TabsTrigger>
        <TabsTrigger value="videos">ค้นหาในวิดีโอ</TabsTrigger>
      </TabsList>

      <TabsContent value="docs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาในเอกสาร</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                placeholder="เช่น โอนเงิน, สัญญา, ใบเสร็จ..."
                onKeyDown={(e) => e.key === 'Enter' && searchDocs()}
              />
              <Button onClick={searchDocs} disabled={loading}>
                {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {docResults.map((result, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-2">จาก: {result.filename}</p>
              <p className="font-medium">{result.text}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => createPin('document', result)}>
                📌 สร้าง Pin
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="videos" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาในวิดีโอ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={videoQuery}
                onChange={(e) => setVideoQuery(e.target.value)}
                placeholder="เช่น คนสองคนนั่งโต๊ะ, ส่งซอง..."
                onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
              />
              <Button onClick={searchVideos} disabled={loading}>
                {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {videoResults.map((result, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge>วิดีโอ</Badge>
                <span className="text-sm text-gray-600">{result.start}s - {result.end}s</span>
              </div>
              <p className="font-medium">{result.title || result.text || 'พบฉากที่ตรงกับการค้นหา'}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => createPin('video', result)}>
                📌 สร้าง Pin
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
