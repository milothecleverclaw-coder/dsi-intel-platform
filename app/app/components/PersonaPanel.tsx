'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Phone, Pencil, Trash2, X, Save, Camera, Plus, Loader2, ScanFace } from 'lucide-react';

interface Persona {
  persona_id: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string;
  last_name_en: string;
  aliases: string[];
  phones: string[];
  role: string;
  notes?: string;
  twelve_labs_collection_id?: string;
}

interface PersonaPhoto {
  photo_id: string;
  persona_id: string;
  image_url: string;
  twelve_labs_entity_id?: string;
  created_at: string;
}

interface PersonaPanelProps {
  caseId: string;
}

const roles = [
  { value: 'suspect', label: 'ผู้ต้องสงสัย' },
  { value: 'victim', label: 'ผู้เสียหาย' },
  { value: 'witness', label: 'พยาน' },
  { value: 'other', label: 'อื่นๆ' },
];

export function PersonaPanel({ caseId }: PersonaPanelProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({
    first_name_th: '',
    last_name_th: '',
    first_name_en: '',
    last_name_en: '',
    aliases: '',
    phones: '',
    role: 'suspect',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [editForm, setEditForm] = useState({
    first_name_th: '',
    last_name_th: '',
    first_name_en: '',
    last_name_en: '',
    aliases: '',
    phones: '',
    role: 'suspect',
    notes: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Photo states
  const [photosDialogOpen, setPhotosDialogOpen] = useState(false);
  const [selectedPersonaForPhotos, setSelectedPersonaForPhotos] = useState<Persona | null>(null);
  const [photos, setPhotos] = useState<PersonaPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [creatingEntity, setCreatingEntity] = useState(false);
  const [entityStatus, setEntityStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonas();
  }, [caseId]);

  const fetchPersonas = () => {
    setInitialLoading(true);
    fetch(`/api/personas?caseId=${caseId}`)
      .then((r) => r.json())
      .then(setPersonas)
      .finally(() => setInitialLoading(false));
  };

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
          notes: form.notes,
        }),
      });
      setForm({ first_name_th: '', last_name_th: '', first_name_en: '', last_name_en: '', aliases: '', phones: '', role: 'suspect', notes: '' });
      fetchPersonas();
    } catch (e) {
      alert('เพิ่มบุคคลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (persona: Persona) => {
    setEditingPersona(persona);
    setEditForm({
      first_name_th: persona.first_name_th || '',
      last_name_th: persona.last_name_th || '',
      first_name_en: persona.first_name_en || '',
      last_name_en: persona.last_name_en || '',
      aliases: persona.aliases?.join(', ') || '',
      phones: persona.phones?.join(', ') || '',
      role: persona.role || 'suspect',
      notes: persona.notes || '',
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingPersona) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/personas/${editingPersona.persona_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name_th: editForm.first_name_th,
          last_name_th: editForm.last_name_th,
          first_name_en: editForm.first_name_en,
          last_name_en: editForm.last_name_en,
          aliases: editForm.aliases.split(',').map((s) => s.trim()).filter(Boolean),
          phones: editForm.phones.split(',').map((s) => s.trim()).filter(Boolean),
          role: editForm.role,
          notes: editForm.notes,
        }),
      });

      if (!res.ok) throw new Error('Update failed');

      setEditDialogOpen(false);
      fetchPersonas();
    } catch (e) {
      alert('แก้ไขไม่สำเร็จ');
    } finally {
      setSavingEdit(false);
    }
  };

  const deletePersona = async (personaId: string) => {
    if (!confirm('ต้องการลบบุคคลนี้?')) return;
    try {
      const res = await fetch(`/api/personas/${personaId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchPersonas();
    } catch (e) {
      alert('ลบไม่สำเร็จ');
    }
  };

  // Photo functions
  const openPhotosDialog = async (persona: Persona) => {
    setSelectedPersonaForPhotos(persona);
    setPhotosDialogOpen(true);
    setEntityStatus(null);
    await fetchPhotos(persona.persona_id);
  };

  const fetchPhotos = async (personaId: string) => {
    try {
      const res = await fetch(`/api/personas/${personaId}/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (e) {
      console.error('Error fetching photos:', e);
    }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPersonaForPhotos) return;

    if (photos.length >= 5) {
      alert('สามารถอัปโหลดได้สูงสุด 5 รูปต่อบุคคล');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/personas/${selectedPersonaForPhotos.persona_id}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      await fetchPhotos(selectedPersonaForPhotos.persona_id);
    } catch (e: any) {
      alert(e.message || 'อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploadingPhoto(false);
      // Reset input
      e.target.value = '';
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!selectedPersonaForPhotos) return;
    if (!confirm('ต้องการลบรูปนี้?')) return;

    try {
      const res = await fetch(`/api/personas/${selectedPersonaForPhotos.persona_id}/photos?photoId=${photoId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');
      await fetchPhotos(selectedPersonaForPhotos.persona_id);
    } catch (e) {
      alert('ลบรูปไม่สำเร็จ');
    }
  };

  const createFaceModel = async () => {
    if (!selectedPersonaForPhotos || photos.length === 0) return;

    const collectionId = process.env.NEXT_PUBLIC_TWELVE_LABS_COLLECTION_ID || 
                        selectedPersonaForPhotos.twelve_labs_collection_id;
    
    if (!collectionId) {
      alert('Twelve Labs collection ID not configured');
      return;
    }

    setCreatingEntity(true);
    setEntityStatus('กำลังสร้างโมเดลใบหน้า...');

    try {
      const res = await fetch('/api/twelve-labs/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          name: `${selectedPersonaForPhotos.first_name_th} ${selectedPersonaForPhotos.last_name_th}`,
          photos: photos.map((p) => p.image_url),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create entity');
      }

      const data = await res.json();
      
      // Update photos with entity ID
      await fetch(`/api/personas/${selectedPersonaForPhotos.persona_id}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: data.entityId }),
      });

      setEntityStatus('สร้างโมเดลใบหน้าสำเร็จ');
      await fetchPhotos(selectedPersonaForPhotos.persona_id);
    } catch (e: any) {
      setEntityStatus(`เกิดข้อผิดพลาด: ${e.message}`);
    } finally {
      setCreatingEntity(false);
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
            <UserPlus className="h-5 w-5 text-yellow-500" />
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
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">นามสกุล (ไทย)</label>
              <Input 
                value={form.last_name_th} 
                onChange={(e) => setForm({ ...form, last_name_th: e.target.value })} 
                placeholder="เช่น ใจดี"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อ (อังกฤษ)</label>
              <Input 
                value={form.first_name_en} 
                onChange={(e) => setForm({ ...form, first_name_en: e.target.value })} 
                placeholder="เช่น Somchai"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">นามสกุล (อังกฤษ)</label>
              <Input 
                value={form.last_name_en} 
                onChange={(e) => setForm({ ...form, last_name_en: e.target.value })} 
                placeholder="เช่น Jaidee"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ฉายา/ชื่อเล่น (คั่นด้วยลูกน้ำ)</label>
            <Input 
              value={form.aliases} 
              onChange={(e) => setForm({ ...form, aliases: e.target.value })} 
              placeholder="เช่น พี่ชาย, เจ้าของร้าน"
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">เบอร์โทร (คั่นด้วยลูกน้ำ)</label>
            <Input 
              value={form.phones} 
              onChange={(e) => setForm({ ...form, phones: e.target.value })} 
              placeholder="เช่น 081-234-5678, 089-876-5432"
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">หมายเหตุ</label>
            <Input 
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })} 
              placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับบุคคลนี้"
              className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">บทบาท</label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50 focus:ring-yellow-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="text-slate-50 focus:bg-slate-700 focus:text-slate-50">
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={addPersona} 
            disabled={loading} 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
          >
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มบุคคล'}
          </Button>
        </CardContent>
      </Card>

      {/* Persona List */}
      {initialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32 bg-slate-700" />
                    <Skeleton className="h-4 w-24 bg-slate-700" />
                    <Skeleton className="h-4 w-48 bg-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
                  {p.notes && (
                    <p className="text-sm text-slate-500 mt-1 italic">หมายเหตุ: {p.notes}</p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(p)}
                      className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openPhotosDialog(p)}
                      className="text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      รูปภาพ
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deletePersona(p.persona_id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      ลบ
                    </Button>
                  </div>
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
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-50 flex items-center gap-2">
              <Pencil className="h-5 w-5 text-yellow-500" />
              แก้ไขข้อมูลบุคคล
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              แก้ไขข้อมูลของ {editingPersona?.first_name_th} {editingPersona?.last_name_th}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อ (ไทย)</label>
                <Input 
                  value={editForm.first_name_th} 
                  onChange={(e) => setEditForm({ ...editForm, first_name_th: e.target.value })} 
                  placeholder="เช่น สมชาย"
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">นามสกุล (ไทย)</label>
                <Input 
                  value={editForm.last_name_th} 
                  onChange={(e) => setEditForm({ ...editForm, last_name_th: e.target.value })} 
                  placeholder="เช่น ใจดี"
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ชื่อ (อังกฤษ)</label>
                <Input 
                  value={editForm.first_name_en} 
                  onChange={(e) => setEditForm({ ...editForm, first_name_en: e.target.value })} 
                  placeholder="เช่น Somchai"
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">นามสกุล (อังกฤษ)</label>
                <Input 
                  value={editForm.last_name_en} 
                  onChange={(e) => setEditForm({ ...editForm, last_name_en: e.target.value })} 
                  placeholder="เช่น Jaidee"
                  className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">ฉายา/ชื่อเล่น (คั่นด้วยลูกน้ำ)</label>
              <Input 
                value={editForm.aliases} 
                onChange={(e) => setEditForm({ ...editForm, aliases: e.target.value })} 
                placeholder="เช่น พี่ชาย, เจ้าของร้าน"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">เบอร์โทร (คั่นด้วยลูกน้ำ)</label>
              <Input 
                value={editForm.phones} 
                onChange={(e) => setEditForm({ ...editForm, phones: e.target.value })} 
                placeholder="เช่น 081-234-5678, 089-876-5432"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">หมายเหตุ</label>
              <Input 
                value={editForm.notes} 
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} 
                placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับบุคคลนี้"
                className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">บทบาท</label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-50 focus:ring-yellow-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="text-slate-50 focus:bg-slate-700 focus:text-slate-50">
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setEditDialogOpen(false)}
              className="text-slate-400 hover:text-slate-50"
            >
              <X className="h-4 w-4 mr-1" />
              ยกเลิก
            </Button>
            <Button 
              onClick={saveEdit}
              disabled={savingEdit}
              className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {savingEdit ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photos Dialog */}
      <Dialog open={photosDialogOpen} onOpenChange={setPhotosDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-50 flex items-center gap-2">
              <Camera className="h-5 w-5 text-yellow-500" />
              รูปภาพบุคคล
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPersonaForPhotos?.first_name_th} {selectedPersonaForPhotos?.last_name_th}
              {photos.length > 0 && ` (${photos.length} รูป)`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">อัปโหลดรูปภาพ (สูงสุด 5 รูป)</p>
                  <p className="text-xs text-slate-500">รองรับไฟล์ JPG, PNG</p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadPhoto}
                    disabled={uploadingPhoto || photos.length >= 5}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    disabled={uploadingPhoto || photos.length >= 5}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    asChild
                  >
                    <span>
                      {uploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          เพิ่มรูป
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Photo Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.photo_id} className="relative group">
                    <img
                      src={photo.image_url}
                      alt="Persona"
                      className="w-full h-32 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      onClick={() => deletePhoto(photo.photo_id)}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {photo.twelve_labs_entity_id && (
                      <Badge className="absolute bottom-2 left-2 bg-green-900/80 text-green-400 border-green-800">
                        <ScanFace className="h-3 w-3 mr-1" />
                        Face Model
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                <Camera className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                <p>ยังไม่มีรูปภาพ</p>
              </div>
            )}

            {/* Create Face Model Button */}
            {photos.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <Button
                  onClick={createFaceModel}
                  disabled={creatingEntity || photos.some(p => p.twelve_labs_entity_id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {creatingEntity ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      กำลังสร้างโมเดล...
                    </>
                  ) : photos.some(p => p.twelve_labs_entity_id) ? (
                    <>
                      <ScanFace className="h-4 w-4 mr-2" />
                      สร้างโมเดลใบหน้าแล้ว
                    </>
                  ) : (
                    <>
                      <ScanFace className="h-4 w-4 mr-2" />
                      สร้างโมเดลใบหน้า (Twelve Labs)
                    </>
                  )}
                </Button>
                {entityStatus && (
                  <p className={`text-sm mt-2 text-center ${entityStatus.includes('สำเร็จ') ? 'text-green-400' : entityStatus.includes('ข้อผิดพลาด') ? 'text-red-400' : 'text-slate-400'}`}>
                    {entityStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
