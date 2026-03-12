# DSI Intel Platform - MVP Specification

> สเปค MVP ฉบับสมบูรณ์ อัปเดตล่าสุด: 2025-03-12

---

## คำศัพท์ที่ใช้ในระบบ (Terminology)

| ภาษาอังกฤษ | ภาษาไทย | ความหมาย |
|-----------|---------|----------|
| **Case** | คดี | การสืบสวนหนึ่งคดี |
| **Narrative Report** | รายงานเรื่องราว | บันทึกสรุปคดี (plain text) |
| **Persona** | บุคคล | โปรไฟล์ผู้ต้องสงสัย/พยาน/ผู้เสียหาย |
| **Pin** | จุดปักหมุด | จุดสำคัญที่พบจากการค้นหา |
| **pinId** | รหัสปักหมุด | อ้างอิงกลับไปยัง source (เขียนหลังรูปปริ้น) |
| **Evidence** | หลักฐาน | ไฟล์ที่อัปโหลด (เอกสาร/รูป/เสียง/วิดีโอ) |

---

## Tech Stack (MVP)

| Layer | Technology | Note |
|-------|-----------|------|
| **Frontend** | TBD | Next.js or similar |
| **Backend** | TBD | API routes or separate |
| **Database** | **Neon (PostgreSQL)** | Key in Bitwarden |
| **File Storage** | TBD | S3 or similar |
| **AI** | **OpenRouter.ai** | Interchangeable models |
| **Auth** | **None** | Single user, direct DB connection |
| **Document AI** | Azure Document Intelligence | Key in Bitwarden |
| **Video AI** | Twelve Labs | Key in Bitwarden |

---

## ฟีเจอร์ MVP

### 1. Case Management

```
สร้างคดีใหม่
├── ชื่อคดี: "Icon Group Fraud"
├── หมายเลขคดี: "DSI-2025-001" (auto-generate)
├── วันที่เปิด: (auto)
└── Narrative Report: [plain text textarea]
    สงสัยแก๊งลงทุนเถื่อน ชื่อ Icon Group
    ผู้ต้องสงสัยหลัก: สมชาย (CEO), มิชชี่ (broker)
    แผนการสืบสวน: ตรวจสอบธุรกรรมการเงิน...
```

**Acceptance Criteria:**
- [ ] สร้างคดีได้
- [ ] แก้ไข Narrative Report ได้ (plain text only)
- [ ] ดูรายการคดีทั้งหมดได้
- [ ] ลบคดีได้ (soft delete)

---

### 2. Evidence Upload

```
อัปโหลดหลักฐาน
├── ไฟล์ที่รองรับ:
│   ├── เอกสาร: PDF, DOC, DOCX
│   ├── รูปภาพ: JPG, PNG, HEIC
│   ├── เสียง: MP3, WAV, M4A
│   └── วิดีโอ: MP4, MOV, AVI
│
├── Metadata (กรอกตอนอัปโหลด):
│   ├── ชื่อไฟล์: (auto from upload)
│   ├── ชื่อเรียก: "CCTV Cafe 48hr"
│   ├── ที่มา: "ยึดจากบ้านสมชาย"
│   ├── วันที่ยึด: 2025-03-15
│   └── ผู้ยึด: "ด.ต.สมศักดิ์"
│
└── ประเภท: (auto-detect จากนามสกุล)
    ├── document
    ├── image
    ├── audio
    └── video
```

**Acceptance Criteria:**
- [ ] อัปโหลดไฟล์ทั้ง 4 ประเภทได้
- [ ] กรอก metadata ได้
- [ ] ดูรายการไฟล์ในคดีได้
- [ ] ดาวน์โหลดไฟล์กลับได้
- [ ] ลบไฟล์ได้

---

### 3. Persona Builder

```
สร้าง Persona
├── ข้อมูลเอกชน:
│   ├── ชื่อ (ไทย): สมชาย
│   ├── นามสกุล (ไทย): ใจดี
│   ├── ชื่อ (อังกฤษ): Somchai
│   ├── นามสกุล (อังกฤษ): Jaidee
│   └── ชื่อเล่น/ฉายา: ["พี่ชาย", "CEO ไอคอน"]
│
├── ข้อมูลติดต่อ:
│   ├── เบอร์โทรศัพท์: ["081-234-5678"]
│   └── เลขบัตรประชาชน: "1-2345-67890-12-3"
│
├── ลักษณะ:
│   ├── เพศ: ชาย
│   ├── อายุ: 45
│   ├── ส่วนสูง: 170
│   └── ลักษณะเด่น: "มักใส่เสื้อสีแดง ผมสั้น"
│
├── บทบาท:
│   └── [ผู้ต้องสงสัย / พยาน / ผู้เสียหาย / บุคคลทั่วไป]
│
└── รูปภาพ:
    ├── [upload front.jpg]
    ├── [upload profile.jpg]
    └── [upload candid.jpg]
```

**Acceptance Criteria:**
- [ ] สร้าง persona ได้
- [ ] อัปโหลดรูปภาพหลายใบได้
- [ ] แก้ไขข้อมูลได้
- [ ] ดูรายการ persona ในคดีได้
- [ ] ลบ persona ได้

---

### 4. Search & Pin System

```
ค้นหาในหลักฐาน
├── Search Types:
│   ├── 🔍 ค้นหาในเอกสาร (Azure DI)
│   │   └── OCR + entity extraction
│   │
│   ├── 🔍 ค้นหาในวิดีโอ (Twelve Labs)
│   │   └── Scene search: "คนสองคนนั่งโต๊ะ"
│   │
│   └── 🔍 ค้นหาในเสียง (Transcribe + search)
│       └── (Post-MVP หรือใช้ Azure DI กับ transcript)
│
└── ผลลัพธ์:
    ├── แสดง preview (snippet จากเอกสาร / thumbnail วิดีโอ)
    ├── แสดง source file
    └── [✨ Pin จุดนี้] button
```

**Pin Creation:**
```
เมื่อกด Pin:
├── ระบบสร้าง pinId อัตโนมัติ: P001, P002, ...
├── บันทึกข้อมูล:
│   ├── pinId: "P042"
│   ├── sourceEvidenceId: "evid_001"
│   ├── sourceType: "video" | "document" | "image" | "audio"
│   ├── timestamp: "14:45:22" (สำหรับ video/audio)
│   ├── location: "14:45:22 - 14:46:05" (สำหรับ scene)
│   └── pinnedAt: (auto)
│
├── User กรอก:
│   ├── context: "ส่งซองสีน้ำตาล ดูเหมือนเงิน"
│   ├── importance: 🔴 สูง / 🟡 กลาง / 🟢 ต่ำ
│   └── taggedPersonas: ["p_001", "p_002"] (เลือกจาก list)
│
└── AI Context Data (optional):
    └── additionalData: JSON สำหรับเก็บข้อมูลเพิ่มเติม
        เช่น: {"suspectedAmount": "500000", "envelopeColor": "brown"}
```

**Acceptance Criteria:**
- [ ] ค้นหาในเอกสารได้ (text search)
- [ ] ค้นหาในวิดีโอได้ (scene search with Twelve Labs)
- [ ] Pin ผลลัพธ์ได้
- [ ] กรอก context และ tag persona ได้
- [ ] ดูรายการ Pin ทั้งหมดได้
- [ ] คลิก Pin → กลับไปยัง source ได้

---

### 5. Timeline View

```
แสดง Pins เรียงตามเวลา:

14:00  P038  สมศรีโอนเงิน 2 ล้านให้มิชชี่
       ├── Source: สลิปโอนเงิน.pdf
       └── Tagged: สมศรี, มิชชี่

14:30  P039  สมชายถอนเงิน 500K ที่ ATM
       ├── Source: CCTV_ATM.mp4 @ 00:02:15
       └── Tagged: สมชาย

14:35  P040  สมชายโทรหามิชชี่
       ├── Source: call_record.pdf
       └── Tagged: สมชาย, มิชชี่

14:45  P042  ⭐ พบกันที่ Cafe ส่งซอง
       ├── Source: CCTV_Cafe.mp4 @ 00:45:22
       ├── Tagged: สมชาย, มิชชี่, (unidentified)
       └── 🔴 สำคัญมาก
```

**Acceptance Criteria:**
- [ ] แสดง Pins เรียงตามเวลา
- [ ] กรองตาม persona ได้ ("แสดงเฉพาะที่เกี่ยวกับ สมชาย")
- [ ] กรองตาม importance ได้
- [ ] คลิก Pin → ไปดู source ได้

---

### 6. AI Chat (OpenRouter)

```
Chat Interface
├── Context ที่ส่งให้ AI ทุกครั้ง:
│   ├── Case narrative report
│   ├── List of personas (names, roles)
│   ├── List of pins (with context and tagged personas)
│   └── Recent conversation history
│
├── Example prompts:
│   ├── "ช่วยวิเคราะห์ timeline ให้หน่อย"
│   ├── "มีช่องโหว่ในหลักฐานไหม?"
│   ├── "สมชาย เจอมิชชี่กี่ครั้ง?"
│   └── "ควรหาหลักฐานเพิ่มตรงไหน?"
│
└── Model selection (ผ่าน OpenRouter):
    ├── Claude 3.5 Sonnet
    ├── GPT-4o
    ├── Gemini 1.5 Pro
    └── (สลับได้ตามต้องการ)
```

**Acceptance Criteria:**
- [ ] แชทกับ AI ได้
- [ ] AI รู้ context ของคดี
- [ ] AI รู้ว่ามี persona ใครบ้าง
- [ ] AI รู้ว่ามี pin อะไรบ้าง
- [ ] เปลี่ยน model ได้ (ผ่าน OpenRouter)

---

## Database Schema (Simplified)

```sql
-- Cases
cases (
    case_id UUID PRIMARY KEY,
    case_number VARCHAR(50),
    title VARCHAR(200),
    narrative_report TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Evidence
evidence (
    evidence_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases,
    filename VARCHAR(255),
    display_name VARCHAR(200),
    file_type VARCHAR(20), -- document, image, audio, video
    s3_path TEXT,
    metadata JSONB,
    uploaded_at TIMESTAMPTZ
);

-- Personas
personas (
    persona_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases,
    first_name_th VARCHAR(100),
    last_name_th VARCHAR(100),
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    aliases JSONB,
    role VARCHAR(50),
    metadata JSONB,
    photos JSONB
);

-- Pins (สำคัญมาก)
pins (
    pin_id VARCHAR(10) PRIMARY KEY, -- P001, P002, ...
    case_id UUID REFERENCES cases,
    evidence_id UUID REFERENCES evidence,
    pin_type VARCHAR(20), -- video, document, image, audio
    timestamp_start VARCHAR(20), -- for video/audio
    timestamp_end VARCHAR(20),
    context TEXT,
    importance VARCHAR(10), -- high, medium, low
    tagged_personas UUID[], -- array of persona_ids
    ai_context_data JSONB, -- additional data for AI
    pinned_at TIMESTAMPTZ
);
```

---

## API Integration

### Azure Document Intelligence
```
Upload PDF → Azure DI → Extract text + entities
→ Store in evidence.azure_analysis
→ Searchable via text search
```

### Twelve Labs
```
Upload Video → Create index task
→ Wait for indexing
→ Search: "two people at table"
→ Results: [{start: "14:45:22", end: "14:46:05", confidence: 0.91}]
→ User clicks Pin → Create pin record
```

### OpenRouter
```
POST https://openrouter.ai/api/v1/chat/completions
Headers: {Authorization: Bearer OPENROUTER_KEY}
Body: {
    model: "anthropic/claude-3.5-sonnet",
    messages: [
        {role: "system", content: caseContext + personas + pins},
        {role: "user", content: userQuestion}
    ]
}
```

---

## Out of Scope (Post-MVP)

- [ ] Network graph visualization
- [ ] Drag-and-drop graph builder
- [ ] Multi-user / collaboration
- [ ] Authentication / RBAC
- [ ] Financial transaction network analysis
- [ ] Automatic entity linking
- [ ] Report export (PDF)
- [ ] Mobile app
- [ ] Real-time notifications

---

## Success Criteria (Definition of Done)

**DSI Officer สามารถ:**
1. สร้างคดีและเขียน Narrative Report ได้
2. อัปโหลดเอกสาร/รูป/เสียง/วิดีโอ พร้อม metadata ได้
3. สร้าง Persona พร้อมรูปภาพและข้อมูลได้
4. ค้นหาในเอกสารและวิดีโอได้
5. Pin ผลลัพธ์ที่สำคัญ พร้อม context และ tag persona ได้
6. ดู Timeline ของ Pins เรียงตามเวลาได้
7. คุยกับ AI ที่รู้ context คดีทั้งหมดได้
8. เขียน pinId หลังรูปปริ้นและค้นกลับเจอได้

---

**อัปเดตโดย:** Milo  
**วันที่:** 2025-03-12  
**เวอร์ชัน:** MVP v1.0
