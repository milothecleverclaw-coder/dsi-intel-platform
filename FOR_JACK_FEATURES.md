# DSI Platform Feature Requirements

## 1. Persona Photos with Twelve Labs Integration

### API Reference
- Twelve Labs Entity Create: `POST /v1.3/entity-collections/{collection_id}/entities`
- Docs: https://docs.twelvelabs.io/api-reference/entities/entity-collections/entities/create

### Requirements
- Allow uploading up to 5 photos per persona
- Send photos to Twelve Labs to create an entity
- Store in Neon DB: `persona_photos` table with:
  - `photo_id` (UUID)
  - `persona_id` (FK)
  - `image_url` (Azure Blob URL)
  - `twelve_labs_entity_id` (from API response)
  - `created_at`
- Add `twelve_labs_collection_id` to personas table

### UI Changes
- PersonaPanel: Add photo upload section (drag & drop or file input)
- Show thumbnail grid of uploaded photos
- Show "สร้างโมเดลใบหน้า" button (create face model)

---

## 2. Edit Persona

### Requirements
- Add "แก้ไข" button on each persona card
- Open dialog with pre-filled form
- PUT /api/personas/:id endpoint
- Update all fields including aliases, phones

---

## 3. Document Preview (Dry Run)

### Requirements
- In EvidencePanel, add "ตัวอย่างผลลัพธ์" button
- Send to Azure Document Intelligence without saving
- Show preview modal with extracted text
- Officer can review before clicking "บันทึก" (save)

### API
- POST /api/evidence/preview (new endpoint)
- Returns Azure DI result without saving to DB/Blob

---

## 4. สำนวนคดี (Case Narrative/Indictment Draft)

### Requirements
- New tab "สำนวนคดี" (first tab, before หลักฐาน)
- Rich text editor for officers to draft case narrative
- Auto-save to DB
- Include in AI chat context
- This is the main working document for prosecutors

### DB Schema
```sql
ALTER TABLE cases ADD COLUMN case_narrative TEXT;
```

### UI
- Full-page rich text editor (like Notion/Google Docs simple)
- Toolbar: bold, italic, bullet points, headings
- Show last saved time

---

## Implementation Priority
1. Case Narrative (สำนวนคดี) - Core feature
2. Document Preview - Quality of life
3. Edit Persona - Quick win
4. Persona Photos + Twelve Labs - Most complex

## Acceptance Criteria
- [ ] Officers can write and edit สำนวนคดี
- [ ] AI chat includes สำนวนคดี in context
- [ ] Document preview works before save
- [ ] Personas can be edited
- [ ] Personas support up to 5 photos
- [ ] Twelve Labs entity created for personas with photos
- [ ] All features work in Thai language
- [ ] Dark theme consistent
- [ ] Build succeeds without errors
