'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FolderKanban } from 'lucide-react';

interface Case {
  case_id: string;
  case_number: string;
  title: string;
  status: string;
  narrative_report?: string;
}

interface CasesListProps {
  cases: Case[];
  loading?: boolean;
  onSelect: (c: Case) => void;
  onRefresh: () => void;
}

export function CasesList({ cases, loading: casesLoading, onSelect, onRefresh }: CasesListProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [report, setReport] = useState('');
  const [creatingCase, setCreatingCase] = useState(false);

  const createCase = async () => {
    if (!title) return;
    setCreatingCase(true);
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
      setCreatingCase(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-slate-50">คดีสอบสวนทั้งหมด</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
              <Plus className="h-4 w-4 mr-1" />
              สร้างคดีใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle className="text-slate-50">สร้างคดีใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อคดี</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="เช่น คดีฉ้อโกง Icon Group"
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">รายงานสรุปคดี</label>
                <Textarea 
                  value={report} 
                  onChange={(e) => setReport(e.target.value)} 
                  placeholder="รายละเอียดคดี..." 
                  rows={4}
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20 resize-none"
                />
              </div>
              <Button 
                onClick={createCase} 
                disabled={creatingCase} 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 disabled:opacity-50"
              >
                {creatingCase ? 'กำลังสร้าง...' : 'สร้างคดี'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {casesLoading ? (
          // Skeleton cards
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <Skeleton className="h-5 w-28 bg-slate-700" />
                  <Skeleton className="h-5 w-20 bg-slate-700" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
              </CardContent>
            </Card>
          ))
        ) : (
          cases.map((c) => (
            <Card
              key={c.case_id}
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
              onClick={() => onSelect(c)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-mono text-slate-50">{c.case_number}</CardTitle>
                  <Badge className={c.status === 'active'
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                  }>
                    {c.status === 'active' ? 'กำลังดำเนินการ' : c.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-medium text-slate-50">{c.title}</p>
                {c.narrative_report && (
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{c.narrative_report}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {!casesLoading && cases.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">ยังไม่มีคดีสอบสวน</p>
          <p className="text-sm text-slate-500">คลิก "สร้างคดีใหม่" เพื่อเริ่มต้น</p>
        </div>
      )}
    </div>
  );
}
