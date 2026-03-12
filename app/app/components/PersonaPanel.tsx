'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Persona {
  persona_id: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string;
  last_name_en: string;
  aliases: string[];
  phones: string[];
  role: string;
}

interface PersonaPanelProps {
  caseId: string;
}

export function PersonaPanel({ caseId }: PersonaPanelProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [form, setForm] = useState({
    first_name_th: '',
    last_name_th: '',
    first_name_en: '',
    last_name_en: '',
    aliases: '',
    phones: '',
    role: 'suspect',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/personas?caseId=${caseId}`)
      .then((r) => r.json())
      .then(setPersonas);
  }, [caseId]);

  const addPersona = async () => {
    if (!form.first_name_th) return;
    setLoading(true);
    try {
      await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          first_name_th: form.first_name_th,
          last_name_th: form.last_name_th,
          first_name_en: form.first_name_en,
          last_name_en: form.last_name_en,
          aliases: JSON.stringify(form.aliases.split(',').map((s) => s.trim()).filter(Boolean)),
          phones: JSON.stringify(form.phones.split(',').map((s) => s.trim()).filter(Boolean)),
          role: form.role,
        }),
      });
      setForm({ first_name_th: '', last_name_th: '', first_name_en: '', last_name_en: '', aliases: '', phones: '', role: 'suspect' });
      const refreshed = await fetch(`/api/personas?caseId=${caseId}`).then((r) => r.json());
      setPersonas(refreshed);
    } catch (e) {
      alert('เพิ่มบุคคลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      suspect: 'ผู้ต้องสงสัย',
      victim: 'ผู้เสียหาย',
      witness: 'พยาน',
      other: 'อื่นๆ',
    };
    return map[role] || role;
  };

  const getRoleColor = (role: string) => {
    if (role === 'suspect') return 'bg-red-100 text-red-800';
    if (role === 'victim') return 'bg-blue-100 text-blue-800';
    if (role === 'witness') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มบุคคลที่เกี่ยวข้อง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">ชื่อ (ไทย)</label>
              <Input value={form.first_name_th} onChange={(e) => setForm({ ...form, first_name_th: e.target.value })} placeholder="เช่น สมชาย" />
            </div>
            <div>
              <label className="text-sm font-medium">นามสกุล (ไทย)</label>
              <Input value={form.last_name_th} onChange={(e) => setForm({ ...form, last_name_th: e.target.value })} placeholder="เช่น ใจดี" />
            </div>
            <div>
              <label className="text-sm font-medium">ชื่อ (อังกฤษ)</label>
              <Input value={form.first_name_en} onChange={(e) => setForm({ ...form, first_name_en: e.target.value })} placeholder="เช่น Somchai" />
            </div>
            <div>
              <label className="text-sm font-medium">นามสกุล (อังกฤษ)</label>
              <Input value={form.last_name_en} onChange={(e) => setForm({ ...form, last_name_en: e.target.value })} placeholder="เช่น Jaidee" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">ฉายา/ชื่อเล่น (คั่นด้วยลูกน้ำ)</label>
            <Input value={form.aliases} onChange={(e) => setForm({ ...form, aliases: e.target.value })} placeholder="เช่น พี่ชาย, เจ้าของร้าน" />
          </div>
          <div>
            <label className="text-sm font-medium">เบอร์โทร (คั่นด้วยลูกน้ำ)</label>
            <Input value={form.phones} onChange={(e) => setForm({ ...form, phones: e.target.value })} placeholder="เช่น 081-234-5678, 089-876-5432" />
          </div>
          <div>
            <label className="text-sm font-medium">บทบาท</label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suspect">ผู้ต้องสงสัย</SelectItem>
                <SelectItem value="victim">ผู้เสียหาย</SelectItem>
                <SelectItem value="witness">พยาน</SelectItem>
                <SelectItem value="other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addPersona} disabled={loading} className="w-full">
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มบุคคล'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((p) => (
          <Card key={p.persona_id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{(p.first_name_th?.[0] || p.first_name_en?.[0] || '?').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{p.first_name_th} {p.last_name_th}</span>
                    <Badge className={getRoleColor(p.role)}>{getRoleLabel(p.role)}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{p.first_name_en} {p.last_name_en}</p>
                  {p.aliases?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">ฉายา: {p.aliases.join(', ')}</p>
                  )}
                  {p.phones?.length > 0 && (
                    <p className="text-sm text-gray-600">โทร: {p.phones.join(', ')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {personas.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center">ยังไม่มีบุคคลในคดีนี้</p>
        )}
      </div>
    </div>
  );
}
