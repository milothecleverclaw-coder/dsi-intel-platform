'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Phone } from 'lucide-react';

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
    if (role === 'suspect') return 'bg-red-900/30 text-red-400 border-red-800';
    if (role === 'victim') return 'bg-blue-900/30 text-blue-400 border-blue-800';
    if (role === 'witness') return 'bg-green-900/30 text-green-400 border-green-800';
    return 'bg-slate-700 text-slate-400 border-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Add Persona Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-50 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-red-600" />
            เพิ่มบุคคลที่เกี่ยวข้อง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อ (ไทย)</label>
              <Input 
                value={form.first_name_th} 
                onChange={(e) => setForm({ ...form, first_name_th: e.target.value })} 
                placeholder="เช่น สมชาย"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">นามสกุล (ไทย)</label>
              <Input 
                value={form.last_name_th} 
                onChange={(e) => setForm({ ...form, last_name_th: e.target.value })} 
                placeholder="เช่น ใจดี"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อ (อังกฤษ)</label>
              <Input 
                value={form.first_name_en} 
                onChange={(e) => setForm({ ...form, first_name_en: e.target.value })} 
                placeholder="เช่น Somchai"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">นามสกุล (อังกฤษ)</label>
              <Input 
                value={form.last_name_en} 
                onChange={(e) => setForm({ ...form, last_name_en: e.target.value })} 
                placeholder="เช่น Jaidee"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ฉายา/ชื่อเล่น (คั่นด้วยลูกน้ำ)</label>
            <Input 
              value={form.aliases} 
              onChange={(e) => setForm({ ...form, aliases: e.target.value })} 
              placeholder="เช่น พี่ชาย, เจ้าของร้าน"
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">เบอร์โทร (คั่นด้วยลูกน้ำ)</label>
            <Input 
              value={form.phones} 
              onChange={(e) => setForm({ ...form, phones: e.target.value })} 
              placeholder="เช่น 081-234-5678, 089-876-5432"
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">บทบาท</label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50 focus:ring-red-600/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="suspect" className="text-slate-50 focus:bg-slate-700 focus:text-slate-50">ผู้ต้องสงสัย</SelectItem>
                <SelectItem value="victim" className="text-slate-50 focus:bg-slate-700 focus:text-slate-50">ผู้เสียหาย</SelectItem>
                <SelectItem value="witness" className="text-slate-50 focus:bg-slate-700 focus:text-slate-50">พยาน</SelectItem>
                <SelectItem value="other" className="text-slate-50 focus:bg-slate-700 focus:text-slate-50">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={addPersona} 
            disabled={loading} 
            className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มบุคคล'}
          </Button>
        </CardContent>
      </Card>

      {/* Persona List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((p) => (
          <Card key={p.persona_id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 bg-slate-700 border border-slate-600">
                  <AvatarFallback className="bg-slate-700 text-slate-300 text-lg">
                    {(p.first_name_th?.[0] || p.first_name_en?.[0] || '?').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-50">{p.first_name_th} {p.last_name_th}</span>
                    <Badge className={`${getRoleColor(p.role)} border`}>
                      {getRoleLabel(p.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{p.first_name_en} {p.last_name_en}</p>
                  {p.aliases?.length > 0 && (
                    <p className="text-sm text-slate-500 mt-1">ฉายา: {p.aliases.join(', ')}</p>
                  )}
                  {p.phones?.length > 0 && (
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {p.phones.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {personas.length === 0 && (
          <div className="text-slate-500 col-span-2 text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            ยังไม่มีบุคคลในคดีนี้
          </div>
        )}
      </div>
    </div>
  );
}
