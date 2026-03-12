'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
    if (level === 'high') return 'bg-red-100 text-red-800';
    if (level === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>จุดสำคัญ (Pins) — {pins.length} รายการ</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pin ID</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>บริบท</TableHead>
              <TableHead>ความสำคัญ</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pins.map((pin) => (
              <TableRow key={pin.pin_id}>
                <TableCell className="font-mono font-bold">{pin.pin_id}</TableCell>
                <TableCell>{getTypeLabel(pin.pin_type)}</TableCell>
                <TableCell className="max-w-md truncate">{pin.context}</TableCell>
                <TableCell>
                  <Badge className={getImportanceColor(pin.importance)}>
                    {getImportanceLabel(pin.importance)}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(pin.pinned_at).toLocaleDateString('th-TH')}</TableCell>
              </TableRow>
            ))}
            {pins.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  ยังไม่มี Pins ในคดีนี้ — ไปที่แท็บ "ค้นหา" เพื่อสร้าง Pin จากผลการค้นหา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
