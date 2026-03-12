'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Case {
  case_id: string;
  case_number: string;
  title: string;
  status: string;
  narrative_report?: string;
}

interface CasesListProps {
  cases: Case[];
  onSelect: (c: Case) => void;
  onRefresh: () => void;
}

export function CasesList({ cases, onSelect, onRefresh }: CasesListProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const createCase = async () => {
    if (!title) return;
    setLoading(true);
    try {
      await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, narrative_report: report }),
      });
      setOpen(false);
      setTitle('');
      setReport('');
      onRefresh();
    } catch (e) {
      alert('สร้างคดีไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">คดีสอบสวนทั้งหมด</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ สร้างคดีใหม่</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างคดีใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">ชื่อคดี</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น คดีฉ้อโกง Icon Group" />
              </div>
              <div>
                <label className="text-sm font-medium">รายงานสรุปคดี</label>
                <Textarea value={report} onChange={(e) => setReport(e.target.value)} placeholder="รายละเอียดคดี..." rows={4} />
              </div>
              <Button onClick={createCase} disabled={loading} className="w-full">
                {loading ? 'กำลังสร้าง...' : 'สร้างคดี'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => (
          <Card key={c.case_id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelect(c)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{c.case_number}</CardTitle>
                <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                  {c.status === 'active' ? 'กำลังดำเนินการ' : c.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{c.title}</p>
              {c.narrative_report && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.narrative_report}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
