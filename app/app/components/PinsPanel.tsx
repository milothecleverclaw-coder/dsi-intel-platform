'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pin, FileText, Video, Music, ExternalLink, Edit, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc/react';
import { toast } from 'sonner';

interface Evidence {
  evidence_id: string;
  filename: string;
  display_name: string;
}

interface Persona {
  persona_id: string;
  first_name_th: string;
  last_name_th: string;
}

interface PinsPanelProps {
  caseId: string;
}

export function PinsPanel({ caseId }: PinsPanelProps) {
  // tRPC hooks
  const { data: pins, isLoading: pinsLoading, refetch } = trpc.pin.list.useQuery({ caseId });
  const updatePin = trpc.pin.update.useMutation({
    onSuccess: () => {
      toast.success('แก้ไขหมุดสำเร็จ');
      setEditDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`แก้ไขไม่สำเร็จ: ${error.message}`);
    },
  });
  const deletePin = trpc.pin.delete.useMutation({
    onSuccess: () => {
      toast.success('ลบหมุดสำเร็จ');
      refetch();
    },
    onError: (error) => {
      toast.error(`ลบไม่สำเร็จ: ${error.message}`);
    },
  });
  
  // Fetch evidence and personas using existing REST API (for now)
  const [evidenceMap, setEvidenceMap] = useState<Map<string, Evidence>>(new Map());
  const [personas, setPersonas] = useState<Persona[]>([]);
  
  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editContext, setEditContext] = useState('');
  const [editIncidentDate, setEditIncidentDate] = useState<string>('');
  const [editPersonas, setEditPersonas] = useState<string[]>([]);

  // Fetch evidence and personas on mount
  useState(() => {
    const fetchData = async () => {
      try {
        const evRes = await fetch(`/api/evidence?caseId=${caseId}`);
        const evidenceData = await evRes.json();
        const map = new Map<string, Evidence>();
        evidenceData.forEach((e: Evidence) => map.set(e.evidence_id, e));
        setEvidenceMap(map);

        const perRes = await fetch(`/api/personas?caseId=${caseId}`);
        const perData = await perRes.json();
        setPersonas(perData);
      } catch (e) {
        console.error('Failed to fetch supporting data:', e);
      }
    };
    fetchData();
  });

  const handleEdit = (pin: NonNullable<typeof pins>[number]) => {
    setEditingPinId(pin.pin_id);
    setEditContext(pin.context);
    setEditIncidentDate(pin.incident_date ? new Date(pin.incident_date).toISOString().split('T')[0] : '');
    setEditPersonas(pin.tagged_personas || []);
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingPinId) return;
    
    updatePin.mutate({
      pinId: editingPinId,
      data: {
        context: editContext,
        incident_date: editIncidentDate ? new Date(editIncidentDate).toISOString() : null,
        tagged_personas: editPersonas,
      },
    });
  };

  const handleDelete = (pinId: string) => {
    if (!confirm('ยืนยันการลบหมุดนี้?')) return;
    deletePin.mutate({ pinId });
  };

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

  const getEvidenceDisplay = (evidenceId: string | null) => {
    if (!evidenceId) return null;
    const evidence = evidenceMap.get(evidenceId);
    if (!evidence) return <span className="text-slate-500 text-xs">{evidenceId.slice(0, 8)}...</span>;
    return (
      <span className="text-slate-400 text-xs flex items-center gap-1" title={evidence.filename}>
        <ExternalLink className="h-3 w-3" />
        {evidence.display_name || evidence.filename}
      </span>
    );
  };

  if (pinsLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-500" />
          <p className="mt-2 text-slate-500">กำลังโหลดหมุด...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-50 flex items-center gap-2">
          <Pin className="h-5 w-5 text-yellow-300" />
          หมุดสำคัญ <span className="text-slate-500 font-normal">{pins?.length ?? 0} รายการ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide font-mono">หมุด ID</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ประเภท</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">บริบท</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ที่มา</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">ความสำคัญ</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">วันที่เกิดเหตุ</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide">หมายเหตุ</TableHead>
              <TableHead className="text-slate-400 uppercase text-xs tracking-wide text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pins?.map((pin) => (
              <TableRow key={pin.pin_id} className="border-slate-700/50 hover:bg-slate-800/50">
                <TableCell className="font-mono font-bold text-slate-50">{pin.pin_id}</TableCell>
                <TableCell>
                  <Badge className={`${getTypeColor(pin.pin_type)} border flex items-center w-fit`}>
                    {getTypeIcon(pin.pin_type)}
                    {getTypeLabel(pin.pin_type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-slate-300">{pin.context}</TableCell>
                <TableCell>{getEvidenceDisplay(pin.evidence_id)}</TableCell>
                <TableCell>
                  <Badge className={`${getImportanceColor(pin.importance)} border`}>
                    {getImportanceLabel(pin.importance)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">
                  {pin.incident_date ? new Date(pin.incident_date).toLocaleDateString('th-TH') : '-'}
                </TableCell>
                <TableCell className="max-w-xs truncate text-slate-300">{pin.notes || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                      onClick={() => handleEdit(pin)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(pin.pin_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pins?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  <Pin className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  ยังไม่มีหมุดในคดีนี้
                  <p className="text-sm mt-1">ไปที่แท็บ "ค้นหา" เพื่อสร้างหมุดจากผลการค้นหา</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Edit className="h-5 w-5 text-yellow-500" />
               แก้ไขหมุด {editingPinId}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              แก้ไขข้อมูลของหมุดที่เลือก
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs text-slate-500 uppercase">บริบท (ข้อความที่เลือก)</Label>
              <Textarea 
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-slate-50 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">วันที่เกิดเหตุ</Label>
              <Input 
                type="date" 
                value={editIncidentDate}
                onChange={(e) => setEditIncidentDate(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-50"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">บุคคลที่เกี่ยวข้อง</Label>
              <ScrollArea className="h-[150px] border border-slate-700 rounded bg-slate-900 p-2">
                <div className="space-y-2">
                  {personas.map((p) => (
                    <div 
                      key={p.persona_id} 
                      className={`flex items-center space-x-2 p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer ${editPersonas.includes(p.persona_id) ? 'bg-slate-700' : ''}`}
                      onClick={() => {
                        if (editPersonas.includes(p.persona_id)) {
                          setEditPersonas(editPersonas.filter(id => id !== p.persona_id));
                        } else {
                          setEditPersonas([...editPersonas, p.persona_id]);
                        }
                      }}
                    >
                      <div className={`w-4 h-4 rounded border border-slate-600 flex items-center justify-center ${editPersonas.includes(p.persona_id) ? 'bg-yellow-500 border-yellow-500' : ''}`}>
                        {editPersonas.includes(p.persona_id) && <div className="w-2 h-2 bg-slate-900 rounded-sm" />}
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
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="text-slate-400">ยกเลิก</Button>
            <Button 
              onClick={saveEdit} 
              disabled={updatePin.isPending} 
              className="bg-yellow-500 text-slate-900"
            >
              {updatePin.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
