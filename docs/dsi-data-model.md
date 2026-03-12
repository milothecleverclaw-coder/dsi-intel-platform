# DSI Intel Platform - Data Model

## Core Entities

### 1. Person (Person Builder)
```json
{
  "person_id": "uuid",
  "case_id": "uuid",
  
  "identity": {
    "display_name": "Michy",
    
    "names": [
      {
        "lang": "th",
        "script": "thai",
        "first": "มิชชี่",
        "last": "เอส."
      },
      {
        "lang": "en",
        "script": "latin",
        "first": "Michy",
        "last": "S."
      }
    ],
    
    "aliases": [
      {"lang": "th", "value": "มิช"},
      {"lang": "en", "value": "Michyyy"},
      {"lang": "en", "value": "michy2905"}
    ],
    
    "dob": "1995-05-29",
    "nationality": "Thai",
    "id_numbers": [
      {"type": "citizen_id", "value": "1-2345-67890-12-3"},
      {"type": "passport", "value": "AA123456"}
    ],
    
    "phone_numbers": [
      {"type": "mobile", "value": "+66-81-234-5678", "country": "TH"},
      {"type": "work", "value": "+66-2-123-4567", "country": "TH"}
    ],
    
    "addresses": [
      {
        "type": "residence",
        "address_th": "123 ถนนสุขุมวิท กรุงเทพฯ",
        "address_en": "123 Sukhumvit Rd, Bangkok",
        "coordinates": {"lat": 13.7563, "lng": 100.5018}
      }
    ]
  },
  
  "visual_identity": {
    "photos": [
      {
        "photo_id": "uuid",
        "url": "s3://bucket/persons/p001/front.jpg",
        "type": "front|profile|candid|surveillance",
        "quality": "high|medium|low",
        "embedding": [0.23, -0.15, ...], // Twelve Labs vector
        "uploaded_at": "2025-03-11T14:00:00Z",
        "uploaded_by": "investigator_001"
      }
    ],
    "descriptions": [
      {
        "text": "Tall, shoulder-length black hair, glasses",
        "added_by": "investigator_001",
        "added_at": "2025-03-11T14:00:00Z"
      }
    ]
  },
  
  "classification": {
    "role": "suspect|witness|victim|person_of_interest|unknown",
    "priority": 1,
    "tags": ["financial_fraud", "ring_leader"],
    "status": "active|cleared|deceased|at_large"
  },
  
  "metadata": {
    "created_by": "investigator_001",
    "created_at": "2025-03-11T14:00:00Z",
    "updated_at": "2025-03-11T14:00:00Z",
    "version": 1
  }
}
```

---

### 2. Evidence (Documents from Azure DI)
```json
{
  "evidence_id": "uuid",
  "case_id": "uuid",
  
  "source": {
    "type": "document|image|audio|chat_log",
    "original_filename": "Bank_Statement_Mar2025.pdf",
    "s3_path": "s3://bucket/cases/001/evidence/doc_001.pdf",
    "uploaded_at": "2025-03-11T10:00:00Z",
    "uploaded_by": "investigator_001",
    "seized_from": "suspect_A_residence",
    "seized_date": "2025-03-10"
  },
  
  "azure_analysis": {
    "document_type": "bank_statement|contract|id_card|chat_log|receipt|other",
    "extracted_text": "full OCR text...",
    "confidence": 0.94,
    "processed_at": "2025-03-11T10:05:00Z",
    
    "entities": [
      {
        "type": "person_name",
        "value": "Michy S.",
        "value_th": "มิชชี่ เอส.",
        "lang": "en",
        "script": "latin",
        "confidence": 0.98,
        "bbox": [100, 200, 300, 250],
        "linked_person_id": "p_001"
      },
      {
        "type": "account_number",
        "value": "123-4-56789-0",
        "confidence": 0.95
      },
      {
        "type": "date",
        "value": "2025-03-15",
        "confidence": 0.99
      },
      {
        "type": "amount",
        "value": 500000,
        "currency": "THB"
      }
    ],
    
    "key_value_pairs": {
      "account_holder": "Michy S.",
      "account_number": "123-4-56789-0",
      "statement_period": "Feb 2025 - Mar 2025"
    }
  },
  
  "search_index": {
    "searchable_text": "michy มิชชี่ bank statement march 2025 500000 thb transfer...",
    "searchable_text_th": "มิชชี่ เอส ธนาคาร มีนาคม 2568 500000 บาท โอน...",
    "tags": ["financial", "banking", "march_2025"]
  }
}
```

---

### 3. Video (Twelve Labs Index)
```json
{
  "video_id": "uuid",
  "case_id": "uuid",
  "index_id": "twelve_labs_index_001",
  
  "source": {
    "filename": "CCTV_CoffeeShop_Cam01_20250310.mp4",
    "s3_path": "s3://bucket/cases/001/videos/vid_001.mp4",
    "duration_sec": 3600,
    "fps": 25,
    "resolution": "1920x1080",
    "camera_location": "Coffee Shop - Main Entrance",
    "recorded_date": "2025-03-10",
    "recorded_time_range": "14:00:00-15:00:00"
  },
  
  "twelve_labs": {
    "indexed_asset_id": "tl_asset_abc123",
    "index_status": "completed|processing|failed",
    "indexed_at": "2025-03-11T12:00:00Z",
    "model": "Marengo-retrieval-2.7",
    
    "embeddings_extracted": true,
    "embedding_segments": [
      {
        "segment_id": "seg_001",
        "start_offset_sec": 45.2,
        "end_offset_sec": 52.8,
        "embedding_vector": [0.23, -0.15, ...],
        "visual_description": "person in red shirt entering"
      }
    ]
  }
}
```

---

### 4. Observation (Linking Person → Evidence/Video)
```json
{
  "observation_id": "uuid",
  "case_id": "uuid",
  "person_id": "p_001",
  
  "source": {
    "type": "document|video",
    "evidence_id": "doc_001",  // if document
    "video_id": "vid_001",     // if video
    
    // For video observations
    "video_segment": {
      "start_sec": 145.5,
      "end_sec": 162.0,
      "confidence": 0.87,
      "visual_match_score": 0.92
    },
    
    // For document observations
    "document_location": {
      "page": 1,
      "bbox": [100, 200, 300, 250],
      "context_text": "...Michy S. transferred 500,000 THB..."
    }
  },
  
  "verification": {
    "status": "ai_suggested|human_verified|disputed",
    "verified_by": "investigator_001",
    "verified_at": "2025-03-11T15:00:00Z",
    "notes": "Confirmed match based on facial features and context"
  },
  
  "timeline_position": "2025-03-10T14:30:00Z",  // When observed
  
  "created_at": "2025-03-11T14:30:00Z"
}
```

---

### 5. Case (Investigation Container)
```json
{
  "case_id": "uuid",
  "case_number": "DSI-2025-001",
  
  "metadata": {
    "title": "Investment Fraud Ring - Bangkok",
    "description": "Investigation into suspected Ponzi scheme...",
    "type": "financial_fraud|cybercrime|drug_trafficking|human_trafficking|other",
    "priority": "high",
    "status": "active|closed|archived",
    "created_at": "2025-03-01T00:00:00Z",
    "lead_investigator": "investigator_001"
  },
  
  "stats": {
    "person_count": 15,
    "evidence_count": 250,
    "video_hours": 120,
    "observation_count": 500
  },
  
  "access_control": {
    "investigators": ["inv_001", "inv_002", "inv_003"],
    "viewers": ["supervisor_001"]
  }
}
```

---

### 6. Search Query (Audit Trail)
```json
{
  "query_id": "uuid",
  "case_id": "uuid",
  "user_id": "investigator_001",
  
  "query": {
    "raw_text": "find @michy meeting @john_doe at coffee shop",
    "parsed_entities": ["@michy", "@john_doe"],
    "entity_ids": ["p_001", "p_002"],
    "filters": {
      "date_range": ["2025-03-01", "2025-03-15"],
      "evidence_types": ["video", "document"],
      "locations": ["coffee_shop"]
    }
  },
  
  "results": {
    "video_matches": 5,
    "document_matches": 3,
    "execution_time_ms": 450
  },
  
  "executed_at": "2025-03-11T16:00:00Z"
}
```

---

### 7. Financial Transaction (Bank Network)
```json
{
  "transaction_id": "uuid",
  "case_id": "uuid",
  
  "source": {
    "evidence_id": "doc_001",
    "extracted_at": "2025-03-11T10:00:00Z",
    "extraction_method": "azure_di|structured_import|manual_entry"
  },
  
  "from_party": {
    "account_number": "123-4-56789-0",
    "account_name": "Michy S.",
    "bank_code": "SCB",
    "bank_name": "Siam Commercial Bank",
    "person_id": "p_001",
    "account_type": "savings|current|corporate"
  },
  
  "to_party": {
    "account_number": "987-6-54321-0",
    "account_name": "John Doe Co., Ltd.",
    "bank_code": "KBANK",
    "bank_name": "Kasikorn Bank",
    "person_id": "p_002",
    "account_type": "corporate"
  },
  
  "transaction": {
    "amount": 500000.00,
    "currency": "THB",
    "date": "2025-03-15",
    "time": "14:30:00",
    "reference_number": "TXN123456789",
    "channel": "online|atm|branch|wire|mobile",
    "type": "transfer|withdrawal|deposit|payment",
    "description": "Payment for services"
  },
  
  "location": {
    "atm_id": "ATM_SIAM_001",
    "branch_name": "Siam Paragon Branch",
    "coordinates": {"lat": 13.7462, "lng": 100.5347}
  },
  
  "flags": {
    "is_suspicious": false,
    "is_structuring": false,
    "is_high_value": true,
    "notes": "Large transfer to newly opened account"
  },
  
  "linked_observations": ["obs_001", "obs_002"],
  "created_at": "2025-03-11T10:00:00Z"
}
```

---

### 8. Financial Network Path (Computed)
```json
{
  "path_id": "uuid",
  "case_id": "uuid",
  "query": {
    "from_person_id": "p_001",
    "to_person_id": "p_004",
    "max_hops": 3,
    "min_amount": 100000,
    "date_range": ["2025-01-01", "2025-03-31"]
  },
  
  "path_result": {
    "hops": 2,
    "total_amount": 800000,
    "path": [
      {
        "step": 1,
        "from_person_id": "p_001",
        "to_person_id": "p_002",
        "transaction_ids": ["txn_001", "txn_002"],
        "amount": 500000
      },
      {
        "step": 2,
        "from_person_id": "p_002",
        "to_person_id": "p_004",
        "transaction_ids": ["txn_003"],
        "amount": 300000
      }
    ]
  },
  
  "computed_at": "2025-03-11T16:00:00Z"
}
```

---

## Relationships

```
Case (1)
  ├── Persons (n)
  ├── Evidence/Documents (n) 
  ├── Videos (n)
  ├── Observations (n) — links Person to Evidence/Video
  └── Financial Transactions (n) — money flows

Person (1)
  ├── Observations (n) — where/when they appeared
  ├── Incoming Transactions (n) — money received
  └── Outgoing Transactions (n) — money sent

Evidence (1)
  ├── Observations (n) — people found in this evidence
  └── Financial Transactions (n) — transactions extracted from this evidence

Video (1)  
  └── Observations (n) — people seen in this video

Financial Transaction (1)
  ├── From Person (1) — sender
  ├── To Person (1) — receiver
  ├── Source Evidence (1) — where extracted from
  └── Linked Observations (n) — video evidence of transaction
```

## Database Schema (PostgreSQL + JSONB)

```sql
-- Core tables
CREATE TABLE cases (
    case_id UUID PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE persons (
    person_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(case_id),
    identity JSONB NOT NULL,
    visual_identity JSONB,
    classification JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence (
    evidence_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(case_id),
    source JSONB NOT NULL,
    azure_analysis JSONB,
    search_index TSVECTOR,  -- Full-text search
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE videos (
    video_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(case_id),
    source JSONB NOT NULL,
    twelve_labs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observations (
    observation_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(case_id),
    person_id UUID REFERENCES persons(person_id),
    evidence_id UUID REFERENCES evidence(evidence_id),
    video_id UUID REFERENCES videos(video_id),
    source JSONB NOT NULL,
    verification JSONB,
    timeline_position TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_persons_case ON persons(case_id);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_videos_case ON videos(case_id);
CREATE INDEX idx_observations_person ON observations(person_id);
CREATE INDEX idx_observations_timeline ON observations(timeline_position);

-- Full-text search on evidence
CREATE INDEX idx_evidence_search ON evidence USING GIN(search_index);

-- Financial network tracking
CREATE TABLE financial_transactions (
    transaction_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(case_id),
    
    from_account VARCHAR(50),
    from_person_id UUID REFERENCES persons(person_id),
    from_bank_code VARCHAR(10),
    
    to_account VARCHAR(50),
    to_person_id UUID REFERENCES persons(person_id),
    to_bank_code VARCHAR(10),
    
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'THB',
    transaction_date DATE,
    transaction_time TIME,
    reference_number VARCHAR(100),
    channel VARCHAR(20),
    type VARCHAR(20),
    description TEXT,
    
    location_atm_id VARCHAR(50),
    location_branch VARCHAR(100),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    
    flags JSONB,
    source_evidence_id UUID REFERENCES evidence(evidence_id),
    linked_observation_ids UUID[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_case ON financial_transactions(case_id);
CREATE INDEX idx_transactions_from_account ON financial_transactions(from_account);
CREATE INDEX idx_transactions_to_account ON financial_transactions(to_account);
CREATE INDEX idx_transactions_from_person ON financial_transactions(from_person_id);
CREATE INDEX idx_transactions_to_person ON financial_transactions(to_person_id);
CREATE INDEX idx_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_transactions_amount ON financial_transactions(amount);

-- Cache for computed network paths
CREATE TABLE financial_network_paths (
    path_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(case_id),
    query_params JSONB,
    path_result JSONB,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_network_paths_case ON financial_network_paths(case_id);
```
