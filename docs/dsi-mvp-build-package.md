# DSI Intel Platform — MVP Build Package

> Complete specification for Jack to build the MVP  
> Created: 2026-03-12  
> By: Milo (for Champ)

---

## Table of Contents

1. [Mock Case Data](#1-mock-case-data)
2. [User Flows](#2-user-flows)
3. [MVP Feature List](#3-mvp-feature-list)
4. [Success Criteria](#4-success-criteria)
5. [Technical Notes](#5-technical-notes)

---

## 1. Mock Case Data

### Case: Icon Group Investment Fraud

```
Case ID: case_001
Case Number: DSI-2025-ICON-001
Title: Icon Group Investment Fraud
Status: Active

Narrative Report:
---
สงสัยกรณีแก๊งลงทุนเถื่อน ใช้ชื่อ "Icon Group" 
หลอกลวงให้ลงทุนในโครงการปลอม

ผู้ต้องสงสัยหลัก:
- สมชาย ใจดี (CEO เทียม)
- มิชชี่ ทองมี (นายหน้า)

ผู้เสียหาย:
- สมศรี รวยมาก (โอนเงิน 2 ล้านบาท)

แผนการสืบสวน:
1. ตรวจสอบธุรกรรมการเงิน
2. เก็บ CCTV จากสถานที่พบปะ
3. ตรวจสอบประวัติโทรศัพท์
4. สอบสวนผู้เสียหาย
---
```

### Mock Personas

**Persona 1: สมชาย (Suspect)**
```json
{
  "persona_id": "p_001",
  "case_id": "case_001",
  "first_name_th": "สมชาย",
  "last_name_th": "ใจดี",
  "first_name_en": "Somchai",
  "last_name_en": "Jaidee",
  "aliases": ["พี่ชาย", "CEO ไอคอน", "เจ้าของโครงการ"],
  "role": "suspect",
  "phones": ["081-234-5678"],
  "national_id": "1-2345-67890-12-3",
  "gender": "male",
  "age": 45,
  "height": 170,
  "distinctive_features": "มักใส่เสื้อสีแดง ผมสั้น ตาเล็ก",
  "photos": [
    "front.jpg",
    "profile.jpg",
    "candid_red_shirt.jpg"
  ]
}
```

**Persona 2: มิชชี่ (Suspect)**
```json
{
  "persona_id": "p_002",
  "case_id": "case_001",
  "first_name_th": "มิชชี่",
  "last_name_th": "ทองมี",
  "first_name_en": "Michy",
  "last_name_en": "Thongmee",
  "aliases": ["มิช", "นายหน้า"],
  "role": "suspect",
  "phones": ["089-876-5432"],
  "national_id": "1-9876-54321-01-2",
  "gender": "female",
  "age": 32,
  "height": 160,
  "distinctive_features": "ผมยาวสีน้ำตาล มักสวมแว่น",
  "photos": [
    "michy_front.jpg",
    "michy_candid.jpg"
  ]
}
```

**Persona 3: สมศรี (Victim)**
```json
{
  "persona_id": "p_003",
  "case_id": "case_001",
  "first_name_th": "สมศรี",
  "last_name_th": "รวยมาก",
  "first_name_en": "Somsri",
  "last_name_en": "Ruaymak",
  "aliases": ["แม่ศรี"],
  "role": "victim",
  "phones": ["062-345-6789"],
  "national_id": "2-3456-78901-23-4",
  "gender": "female",
  "age": 58,
  "height": 155,
  "distinctive_features": "ผมบ๊อบสีดำ ใส่กรอบแว่นสีทอง",
  "photos": [
    "somsri_id_photo.jpg"
  ]
}
```

### Mock Evidence

```json
[
  {
    "evidence_id": "evid_001",
    "case_id": "case_001",
    "filename": "CCTV_Cafe_48hr.mp4",
    "display_name": "CCTV Cafe 48 ชั่วโมง",
    "file_type": "video",
    "source": "ยึดจากร้านกาแฟ The Meeting Place",
    "seized_date": "2025-03-15",
    "seized_by": "ด.ต.สมศักดิ์ มือดี",
    "metadata": {
      "duration": "48:00:00",
      "location": "ร้าน The Meeting Place, ซอยสุขุมวิท 23",
      "date_range": "2025-03-13 to 2025-03-15"
    }
  },
  {
    "evidence_id": "evid_002",
    "case_id": "case_001",
    "filename": "CCTV_ATM_BankA.mp4",
    "display_name": "CCTV ATM ธนาคาร A",
    "file_type": "video",
    "source": "ขอจากธนาคาร A สาขาสุขุมวิท",
    "seized_date": "2025-03-16",
    "seized_by": "ด.ต.สมศักดิ์ มือดี",
    "metadata": {
      "duration": "02:30:00",
      "location": "ธนาคาร A สาขาสุขุมวิท",
      "date_recorded": "2025-03-15"
    }
  },
  {
    "evidence_id": "evid_003",
    "case_id": "case_001",
    "filename": "Bank_Transfer_Slip.pdf",
    "display_name": "สลิปโอนเงิน 2 ล้านบาท",
    "file_type": "document",
    "source": "ได้มาจากผู้เสียหาย (สมศรี)",
    "seized_date": "2025-03-14",
    "seized_by": "ด.ต.สมศักดิ์ มือดี",
    "metadata": {
      "transfer_amount": "2,000,000 THB",
      "transfer_date": "2025-03-15 14:00",
      "from_account": "สมศรี รวยมาก",
      "to_account": "มิชชี่ ทองมี"
    }
  },
  {
    "evidence_id": "evid_004",
    "case_id": "case_001",
    "filename": "Phone_Record_Somchai.pdf",
    "display_name": "ประวัติการโทร สมชาย",
    "file_type": "document",
    "source": "ขอจากผู้ให้บริการโทรศัพท์",
    "seized_date": "2025-03-17",
    "seized_by": "ด.ต.สมศักดิ์ มือดี",
    "metadata": {
      "phone_number": "081-234-5678",
      "period": "2025-03-01 to 2025-03-16"
    }
  },
  {
    "evidence_id": "evid_005",
    "case_id": "case_001",
    "filename": "Interrogation_Somsri.mp3",
    "display_name": "บันทึกการสอบสวน สมศรี",
    "file_type": "audio",
    "source": "บันทึกจากการสอบสวน",
    "seized_date": "2025-03-14",
    "seized_by": "ด.ต.สมศักดิ์ มือดี",
    "metadata": {
      "duration": "00:45:00",
      "interviewer": "ด.ต.สมศักดิ์",
      "interviewee": "สมศรี รวยมาก"
    }
  }
]
```

### Mock Pins (The Key Discoveries)

```json
[
  {
    "pin_id": "P001",
    "case_id": "case_001",
    "evidence_id": "evid_003",
    "pin_type": "document",
    "timestamp_start": null,
    "timestamp_end": null,
    "context": "สมศรีโอนเงิน 2 ล้านบาทให้มิชชี่ เวลา 14:00",
    "importance": "high",
    "tagged_personas": ["p_002", "p_003"],
    "ai_context_data": {
      "amount": 2000000,
      "currency": "THB",
      "transaction_type": "transfer"
    },
    "pinned_at": "2025-03-16T10:00:00Z"
  },
  {
    "pin_id": "P002",
    "case_id": "case_001",
    "evidence_id": "evid_002",
    "pin_type": "video",
    "timestamp_start": "00:02:15",
    "timestamp_end": "00:02:45",
    "context": "สมชายถอนเงิน 500,000 บาทที่ ATM ใส่เสื้อสีแดง",
    "importance": "high",
    "tagged_personas": ["p_001"],
    "ai_context_data": {
      "withdrawal_amount": 500000,
      "atm_location": "ธนาคาร A สุขุมวิท",
      "clothing": "red shirt"
    },
    "pinned_at": "2025-03-16T11:30:00Z"
  },
  {
    "pin_id": "P003",
    "case_id": "case_001",
    "evidence_id": "evid_004",
    "pin_type": "document",
    "timestamp_start": null,
    "timestamp_end": null,
    "context": "สมชายโทรหามิชชี่ เบอร์ 089-876-5432 เวลา 14:35",
    "importance": "medium",
    "tagged_personas": ["p_001", "p_002"],
    "ai_context_data": {
      "call_duration": "3 minutes",
      "call_type": "outgoing"
    },
    "pinned_at": "2025-03-16T14:00:00Z"
  },
  {
    "pin_id": "P004",
    "case_id": "case_001",
    "evidence_id": "evid_001",
    "pin_type": "video",
    "timestamp_start": "14:45:22",
    "timestamp_end": "14:46:05",
    "context": "สมชายและมิชชี่พบกันที่ร้านกาแฟ สมชายส่งซองสีน้ำตาลให้มิชชี่",
    "importance": "high",
    "tagged_personas": ["p_001", "p_002"],
    "ai_context_data": {
      "location": "The Meeting Place Cafe",
      "object_transferred": "brown envelope",
      "suspected_content": "cash"
    },
    "pinned_at": "2025-03-16T16:00:00Z"
  }
]
```

---

## 2. User Flows

### Flow 1: Create Case & Upload Evidence

```
┌─────────────────────────────────────────────────────────────────┐
│                        DSI OFFICER                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Login (skip    │
                    │  for MVP)       │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Dashboard:     │
                    │  "Create Case"  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Enter:         │
                    │  - Case title   │
                    │  - Narrative    │
                    │    report       │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Upload Files:  │
                    │  - CCTV.mp4     │
                    │  - Bank.pdf     │
                    │  - Audio.mp3    │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Add Metadata   │
                    │  per file:      │
                    │  - Source       │
                    │  - Date seized  │
                    │  - Officer      │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  System sends   │
                    │  video → Twelve │
                    │  Labs for index │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  System sends   │
                    │  docs → Azure   │
                    │  DI for OCR     │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ✅ Case Ready  │
                    │  for analysis   │
                    └─────────────────┘
```

### Flow 2: Build Personas

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUILD PERSONA FLOW                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Case Dashboard │
                    │  → "Personas"   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  "Add Persona"  │
                    └────────┬────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  Enter Details:  │            │  Upload Photos:  │
    │  - Name (TH/EN)  │            │  - Front face    │
    │  - Aliases       │            │  - Profile       │
    │  - Phone         │            │  - Candid shots  │
    │  - ID number     │            │                  │
    │  - Description   │            │                  │
    └────────┬─────────┘            └────────┬─────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Select Role:   │
                    │  ○ Suspect      │
                    │  ○ Witness      │
                    │  ○ Victim       │
                    │  ○ Other        │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ✅ Persona     │
                    │  Created        │
                    └─────────────────┘
```

### Flow 3: Search & Pin (THE CORE LOOP)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SEARCH & PIN FLOW                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Case Dashboard │
                    │  → "Search"     │
                    └────────┬────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  Search in Docs  │            │  Search in Video │
    │  (Azure DI)      │            │  (Twelve Labs)   │
    └────────┬─────────┘            └────────┬─────────┘
              │                               │
              ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  Query:          │            │  Query:          │
    │  "โอนเงิน 2 ล้าน" │            │  "คนสองคนนั่งโต๊ะ"│
    └────────┬─────────┘            └────────┬─────────┘
              │                               │
              ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  Results:        │            │  Results:        │
    │  - Bank slip p.1 │            │  - 14:45:22      │
    │  - Contract p.3  │            │  - 16:20:10      │
    └────────┬─────────┘            └────────┬─────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User clicks    │
                    │  result         │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Preview shown: │
                    │  - Snippet/text │
                    │  - Video clip   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  [📌 PIN THIS]  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Pin Modal:     │
                    │  ┌───────────┐  │
                    │  │ pinId:    │  │
                    │  │  P005     │  │
                    │  ├───────────┤  │
                    │  │ Context:  │  │
                    │  │ [____]    │  │
                    │  ├───────────┤  │
                    │  │ Tag       │  │
                    │  │ personas: │  │
                    │  │ ☑ สมชาย   │  │
                    │  │ ☑ มิชชี่   │  │
                    │  │ ☐ สมศรี   │  │
                    │  ├───────────┤  │
                    │  │ Importance│  │
                    │  │ 🔴🟡🟢    │  │
                    │  └───────────┘  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ✅ Pin saved   │
                    │  pinId: P005    │
                    │                 │
                    │  Officer writes │
                    │  "P005" on back │
                    │  of printed     │
                    │  photo          │
                    └─────────────────┘
```

### Flow 4: Timeline Review

```
┌─────────────────────────────────────────────────────────────────┐
│                     TIMELINE FLOW                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Case Dashboard │
                    │  → "Timeline"   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Pins shown in  │
                    │  chronological  │
                    │  order:         │
                    │                 │
                    │  14:00 P001     │
                    │  14:30 P002     │
                    │  14:35 P003     │
                    │  14:45 P004 ⭐  │
                    └────────┬────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  Filter by       │            │  Click Pin →     │
    │  - Persona       │            │  Go to source    │
    │  - Importance    │            │  evidence        │
    └──────────────────┘            └──────────────────┘
```

### Flow 5: AI Chat Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI CHAT FLOW                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Case Dashboard │
                    │  → "AI Chat"    │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  System loads   │
                    │  context:       │
                    │  - Case summary │
                    │  - All personas │
                    │  - All pins     │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User asks:     │
                    │  "มีช่องโหว่ใน   │
                    │   timeline ไหม?"│
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  AI responds:   │
                    │                 │
                    │  "พบช่องโหว่:   │
                    │   14:30-14:45   │
                    │   ระหว่าง ATM   │
                    │   → Cafe        │
                    │                 │
                    │  แนะนำ: หา CCTV │
                    │  ระหว่างทาง"    │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User continues │
                    │  conversation   │
                    │  or exits       │
                    └─────────────────┘
```

---

## 3. MVP Feature List

### Priority 0: Must Have (Core MVP)

| # | Feature | Description | Acceptance Criteria |
|---|---------|-------------|---------------------|
| 1 | **Create Case** | Create investigation case with title and narrative | ✅ Can create case<br>✅ Can edit narrative<br>✅ Auto-generate case number |
| 2 | **Upload Evidence** | Upload docs/images/audio/video with metadata | ✅ All 4 file types work<br>✅ Metadata saved<br>✅ Files stored in Azure Blob |
| 3 | **Build Personas** | Create person profiles with photos and details | ✅ Create/edit/delete personas<br>✅ Upload multiple photos<br>✅ Thai + English names |
| 4 | **Search Documents** | Full-text search in uploaded documents | ✅ Azure DI integration<br>✅ Returns snippets<br>✅ Links to source |
| 5 | **Search Videos** | Scene search in video footage | ✅ Twelve Labs integration<br>✅ Natural language queries<br>✅ Returns timestamps |
| 6 | **Create Pins** | Mark search results as important findings | ✅ Auto-generate pinId (P001, P002...)<br>✅ Add context text<br>✅ Tag multiple personas<br>✅ Set importance level |
| 7 | **View Timeline** | See all pins sorted chronologically | ✅ Chronological order<br>✅ Filter by persona<br>✅ Filter by importance<br>✅ Click → go to source |
| 8 | **AI Chat** | Chat with AI about the case | ✅ OpenRouter integration<br>✅ Context includes case/personas/pins<br>✅ Model switchable |

### Priority 1: Should Have (Enhanced MVP)

| # | Feature | Description | Acceptance Criteria |
|---|---------|-------------|---------------------|
| 9 | **Evidence List View** | Browse all evidence in a case | ✅ List with thumbnails<br>✅ Filter by type<br>✅ Sort by date |
| 10 | **Persona List View** | Browse all personas in a case | ✅ Grid view with photos<br>✅ Filter by role |
| 11 | **Pin List View** | Browse all pins | ✅ List view<br>✅ Search by pinId |
| 12 | **Direct Azure Blob Upload** | Frontend uploads directly to Azure | ✅ SAS token generation<br>✅ Progress indicator |
| 13 | **Case Dashboard** | Overview page for a case | ✅ Summary stats<br>✅ Recent activity<br>✅ Quick actions |

### Priority 2: Nice to Have (Post-MVP)

| # | Feature | Description |
|---|---------|-------------|
| 14 | Network Graph | Visual relationship mapping |
| 15 | Drag-and-drop Graph Builder | Interactive node/edge creation |
| 16 | Multi-user Collaboration | Real-time editing |
| 17 | Export Report | Generate PDF summary |
| 18 | Mobile Responsive | Work on tablets/phones |

---

## 4. Success Criteria

### Definition of Done for MVP

**A DSI investigator can:**

```
☐ 1. Create a new case and write the narrative report
☐ 2. Upload at least 10 files of mixed types (docs, images, audio, video)
☐ 3. Create at least 5 personas with photos and details
☐ 4. Search for "โอนเงิน" in documents and find the bank slip
☐ 5. Search for "คนสองคนนั่งโต๊ะ" in video and find the cafe scene
☐ 6. Pin at least 5 key findings with context and tagged personas
☐ 7. View the timeline of all pins in chronological order
☐ 8. Filter timeline to show only pins involving "สมชาย"
☐ 9. Chat with AI and ask "มีช่องโหว่ในหลักฐานไหม?"
☐ 10. Write "P004" on back of printed photo, search "P004" in app, find the source
```

### Test Scenarios

**Scenario 1: Complete Investigation Flow**
```
1. Create case "Icon Group Fraud"
2. Upload 5 evidence files
3. Create 3 personas
4. Perform 3 searches (2 doc, 1 video)
5. Create 5 pins
6. View timeline
7. Ask AI 2 questions
8. Verify all data persists after page refresh
```

**Scenario 2: Pin Traceability**
```
1. Search video for "ส่งซอง"
2. Find result at 14:45:22
3. Pin it → get pinId P004
4. Navigate away
5. Search "P004" in pin list
6. Click P004 → opens source video at 14:45:22
```

**Scenario 3: AI Context Awareness**
```
1. Ask AI: "ใครบ้างที่เกี่ยวข้องกับคดีนี้?"
2. AI lists all personas
3. Ask AI: "สมชายทำอะไรบ้าง?"
4. AI references pins tagged with สมชาย
5. Ask AI: "มีช่องโหว่ไหม?"
6. AI analyzes timeline gaps
```

---

## 5. Technical Notes

### Environment Variables (Bitwarden)

```
DATABASE_URL=postgresql://...@neon.tech/...
AZURE_BLOB_CONNECTION_STRING=...
AZURE_DI_ENDPOINT=...
AZURE_DI_KEY=...
TWELVE_LABS_API_KEY=...
OPENROUTER_API_KEY=...
```

### API Endpoints to Build

```
POST   /api/cases                 — Create case
GET    /api/cases/:id             — Get case details
PUT    /api/cases/:id             — Update case (narrative)
DELETE /api/cases/:id             — Soft delete case

POST   /api/evidence              — Upload evidence
GET    /api/evidence?caseId=...   — List evidence by case
GET    /api/evidence/:id          — Get evidence details
DELETE /api/evidence/:id          — Delete evidence

POST   /api/personas              — Create persona
GET    /api/personas?caseId=...   — List personas by case
PUT    /api/personas/:id          — Update persona
DELETE /api/personas/:id          — Delete persona

POST   /api/search/documents      — Search in documents (Azure DI)
POST   /api/search/videos         — Search in videos (Twelve Labs)

POST   /api/pins                  — Create pin
GET    /api/pins?caseId=...       — List pins by case
GET    /api/pins/timeline/:caseId — Get pins sorted by time
PUT    /api/pins/:id              — Update pin
DELETE /api/pins/:id              — Delete pin

POST   /api/chat                  — Send message to AI
```

### Database Migration (Neon)

See `mvp-specification.md` for full schema. Key tables:

```sql
cases
evidence
personas
pins (most important for timeline/AI)
```

### File Upload Flow

```
Frontend → Request SAS token from backend
Backend → Generate SAS token for Azure Blob
Frontend → Upload directly to Azure Blob
Frontend → Send file metadata to backend
Backend → Create evidence record in DB
Backend → Trigger Azure DI / Twelve Labs processing
```

---

## 6. AI System Prompt

**CRITICAL:** The AI chat must use this system prompt to ensure proper behavior:

```
คุณเป็นผู้ช่วยวิเคราะห์คดีอาชญากรรม (CSI Case Assistant) ของกรมสอบสวนคดีพิเศษ (DSI)

## บทบาทของคุณ:
- ช่วยเจ้าหน้าที่สอบสวนวิเคราะห์หลักฐานและ timeline
- ระบุช่องโหว่ในคดีที่อาจทำให้คดีแพ้ในชั้นศาล
- แนะนำหลักฐานเพิ่มเติมที่ควรหา
- เตือนเมื่อเห็นจุดอ่อนในข้อเท็จจริง

## หลักการสำคัญ:
1. **เป้าหมายคือ "ชนะคดี"** - ทุกคำแนะนำต้องมุ่งไปสู่การทำให้คดีแข็งแกร่งในชั้นศาล
2. **ระบุสิ่งที่ขาด** - หาช่องโหว่ หาหลักฐานที่ยังไม่มี
3. **ตั้งคำถามเสมอ** - "มี CCTV ตรงนี้ไหม?" "มีพยานยืนยันไหม?"
4. **พูดภาษาไทย** - ตอบเป็นภาษาไทยเสมอ ใช้คำศัพท์ทางกฎหมายที่เหมาะสม

## ข้อมูลคดีปัจจุบัน:
{case_context}

## Persona ที่เกี่ยวข้อง:
{personas_context}

## Pins (จุดสำคัญที่พบ):
{pins_context}

## คำแนะนำในการตอบ:
- เมื่อวิเคราะห์ timeline ให้ระบุช่องว่างที่อาจถูกทนายฝ่ายตรงข้ามโจมตี
- เมื่อดู pins ให้สังเกตว่ามีการ tag persona ครบหรือยัง
- เสนอหลักฐานที่ควรหาเพิ่ม (เช่น CCTV ระหว่างทาง, พยานบุคคล, บันทึกการโทรเพิ่มเติม)
- ใช้รูปแบบ timeline แบบ ASCII เมื่อช่วยให้เห็นภาพชัดเจนขึ้น
```

### Implementation Notes:

```javascript
// Backend: /api/chat
const systemPrompt = CSI_SYSTEM_PROMPT
  .replace('{case_context}', case.narrativeReport)
  .replace('{personas_context}', formatPersonas(personas))
  .replace('{pins_context}', formatPins(pins));

const response = await openrouter.chat({
  model: selectedModel, // claude-3.5-sonnet, gpt-4o, gemini-1.5-pro
  messages: [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]
});
```

---

## 7. Development Guidelines

### Git Workflow: Micro Commits

**RULE:** Commit after every feature built and tested. This gives rollback points.

```
✅ GOOD:
git commit -m "feat: add case creation form"
git commit -m "feat: connect case form to API"
git commit -m "test: verify case saves to Neon DB"
git commit -m "feat: add evidence upload UI"
git commit -m "feat: integrate Azure Blob upload"
git commit -m "fix: handle large file upload timeout"

❌ BAD:
git commit -m "add everything" (after 3 days of work)
```

### Commit Message Format:

```
feat: [what you built]
fix: [what you fixed]
test: [what you tested]
refactor: [what you cleaned up]
docs: [what you documented]
```

### Before Each Commit:

1. ✅ Test the feature manually
2. ✅ Check console for errors
3. ✅ Verify data persists in DB
4. ✅ Then commit

---

## 8. Cloudflare Tunnel Setup

**URL:** `csi.hotserver.uk`

### Prerequisites from Bitwarden:

- `cloudflare_api_token` - for DNS management
- `cloudflare_tunnel_token` - for tunnel authentication
- `cloudflare_zone_id` - for hotserver.uk zone

### Setup Steps:

```bash
# 1. Install cloudflared (if not installed)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# 2. Authenticate (use token from BW)
cloudflared tunnel login

# 3. Create tunnel (if not exists)
cloudflared tunnel create dsi-csi

# 4. Configure DNS
cloudflared tunnel route dns dsi-csi csi.hotserver.uk

# 5. Create config file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: dsi-csi
credentials-file: ~/.cloudflared/dsi-csi.json

ingress:
  - hostname: csi.hotserver.uk
    service: http://localhost:3000
  - service: http_status:404
EOF

# 6. Run tunnel
cloudflared tunnel run dsi-csi
```

### For Development (Quick Tunnel):

```bash
# Temporary URL for testing (no setup needed)
cloudflared tunnel --url http://localhost:3000
# Output: https://random-name.trycloudflare.com
```

### Production Tunnel (Persistent):

Use the token from BW to run as a service:

```bash
# Run with token (from BW: cloudflare_tunnel_token)
cloudflared tunnel run --token <TOKEN_FROM_BW>
```

### Testing Locally:

```bash
# 1. Start the app locally
npm run dev  # or yarn dev (port 3000)

# 2. Start cloudflare tunnel
cloudflared tunnel run dsi-csi

# 3. Access from anywhere:
# https://csi.hotserver.uk → your localhost:3000
```

---

## 9. Credentials Checklist

**All credentials verified in Bitwarden (2026-03-12):**

### ✅ Ready to Use:

| Credential | BW Item Name | Value/Notes |
|------------|--------------|-------------|
| **DATABASE_URL** (Neon) | `neon.tech key` | See BW notes field for full connection string |
| **AZURE_DI_ENDPOINT** | `Azure Service Principal - DSI Intel Platform` | `https://southeastasia.api.cognitive.microsoft.com/` |
| **AZURE_DI_KEY** | `Azure Service Principal - DSI Intel Platform` | In `login.password` field (redacted) |
| **AZURE_CLIENT_ID** | `Azure Service Principal - DSI Intel Platform` | In `login.username` field |
| **AZURE_TENANT_ID** | `Azure Service Principal - DSI Intel Platform` | `68678f9a-013f-491a-9512-d43b36a25817` |
| **TWELVE_LABS_API_KEY** | `Twelve Labs API Key` | See BW `login.password` field |
| **OPENROUTER_API_KEY** | `openrouter` | `<OPENROUTER_KEY>` |
| **CLOUDFLARE_API_TOKEN** | `Cloudflare cli token` | Zone-level (hotserver.uk) |
| **CLOUDFLARE_ZONE_ID** | - | `c1b98e7e9512cf09b61ce22b930d1598` |

### ⏳ Pending:

| Credential | Status | Action Needed |
|------------|--------|---------------|
| **AZURE_BLOB_CONNECTION_STRING** | ❌ Not in BW | Need to create storage account + grant SP access |
| **CLOUDFLARE_TUNNEL_TOKEN** | ❌ Token is zone-level only | Need account-level token OR create tunnel in dashboard |

### Environment Variables for `.env`:

```bash
# Database
DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@ep-lingering-glitter-a1g039y6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
# ↑ Get from BW: "neon.tech key" → notes field

# Azure Document Intelligence
AZURE_TENANT_ID="68678f9a-013f-491a-9512-d43b36a25817"
AZURE_CLIENT_ID="dfc3658c-b137-45a4-a8f6-4221843c6af4"
AZURE_CLIENT_SECRET="<from BW: Azure Service Principal - DSI Intel Platform>"
AZURE_DI_ENDPOINT="https://southeastasia.api.cognitive.microsoft.com/"

# Azure Blob Storage (PENDING - need to create)
# AZURE_BLOB_CONNECTION_STRING="..."

# Video AI
TWELVE_LABS_API_KEY="<from BW: Twelve Labs API Key>"

# AI Chat
OPENROUTER_API_KEY="<from BW: openrouter>"

# Cloudflare
CLOUDFLARE_API_TOKEN="<from BW: Cloudflare cli token>"
CLOUDFLARE_ZONE_ID="c1b98e7e9512cf09b61ce22b930d1598"
```

**All actual values are in Bitwarden. Use the BW item names above to retrieve them.**

### To Get Azure Blob Connection String:

Run these Azure CLI commands (or use the prompt I gave Champ earlier):

```bash
# 1. Create storage account
az storage account create \
  --name dsiintelplatform \
  --resource-group <your-rg> \
  --location southeastasia \
  --sku Standard_LRS

# 2. Get connection string
az storage account show-connection-string \
  --name dsiintelplatform \
  --resource-group <your-rg> \
  -o tsv

# 3. Grant SP access (after getting connection string)
az role assignment create \
  --assignee dfc3658c-b137-45a4-a8f6-4221843c6af4 \
  --role "Storage Blob Data Contributor" \
  --scope <storage-account-resource-id>
```

---

## 10. Build Order Recommendation

**Week 1-2: Foundation**
- Database schema + migrations
- Case CRUD
- Evidence upload (Azure Blob)
- Persona CRUD

**Week 3-4: Search & Pin**
- Azure DI integration (doc search)
- Twelve Labs integration (video search)
- Pin creation + management
- Pin list view

**Week 5: Timeline + AI**
- Timeline view
- AI chat (OpenRouter)
- Context injection

**Week 6: Polish**
- UI cleanup
- Error handling
- Testing with mock case data
- Bug fixes

---

**Ready for Jack to start building! 🚀**

Questions? Ping Milo.
