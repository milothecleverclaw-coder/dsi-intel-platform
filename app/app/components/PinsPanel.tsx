'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pin, FileText, Video, Music } from 'lucide-react';

interface Pin {
  pin_id: string;
  context: string;
  importance: string;
  pin_type: string;
  incident_time: string;
  pinned_at: string;
}

interface PinsPanelProps {
  caseId: string;
}

export function PinsPanel({ caseId }: PinsPanelProps) {
  const [pins, setPins] = useState<Pin[]>([]);

  useEffect(() => {
    fetch(`/api/pins?caseId=${caseId}`)
      .then((r) => r.json())
      .then(setPins);
  }, [caseId]);

  const getImportanceColor = (level: string) => {
    if (level === 'high') return 'bg-red-900/30 text-red-400 border-red-800';
    if (level === 'medium') return 'bg-amber-900/30 text-amber-400 border-amber-800';
    return 'bg-green-900/30 text-green-400 border-green-800';
  };

  const getImportanceLabel = (level: string) => {
    if (level === 'high') return 'สูง';
    if (level === 'medium') return 'ปานกลาง';
    return 'ต่ำ';
  };

  const getTypeLabel = (type: string) => {
    if (type === 'document') return 'เอกสาร';
    if (type === 'video') return 'วิดีโอ';
    if (type === 'audio') return 'เสียง';
    return type;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="h-3 w-3 mr-1" />;
    if (type === 'audio') return <Music className="h-3 w-3 mr-1" />;
    return <FileText className="h-3 w-3 mr-1" />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'video') return 'bg-purple-900/30 text-purple-400 border-purple-800';
    if (type === 'audio') return 'bg-amber-900/30 text-amber-400 border-amber-800';
    return 'bg-blue-900/30 text-blue-400 border-blue-800';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-50 flex items-center gap-2">
          <Pin className="h-5 w-5 text-red-600" />
          จุดสำคัญ (Pins) <span className="text-slate-500 font-normal">{pins.length} รายการ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide font-mono">Pin ID</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ประเภท</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">บริบท</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ความสำคัญ</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">วันที่สร้าง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pins.map((pin) => (
              <TableRow key={pin.pin_id} className="border-slate-700/50 hover:bg-slate-800/50">
                <TableCell className="font-mono font-bold text-slate-50">{pin.pin_id}</TableCell>
                <TableCell>
                  <Badge className={`${getTypeColor(pin.pin_type)} border flex items-center w-fit`}>
                    {getTypeIcon(pin.pin_type)}
                    {getTypeLabel(pin.pin_type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-slate-300">{pin.context}</TableCell>
                <TableCell>
                  <Badge className={`${getImportanceColor(pin.importance)} border`}>
                    {getImportanceLabel(pin.importance)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">
                  {new Date(pin.pinned_at).toLocaleDateString('th-TH')}
                </TableCell>
              </TableRow>
            ))}
            {pins.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  <Pin className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  ยังไม่มี Pins ในคดีนี้
                  <p className="text-sm mt-1">ไปที่แท็บ "ค้นหา" เพื่อสร้าง Pin จากผลการค้นหา</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
