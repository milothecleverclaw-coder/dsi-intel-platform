# DSI Mock Case: เซลล์วัตถุระเบิดยะลา (Yala Bomb Cell)

**Case Number:** DSI-2026-SB-042  
**Case Type:** การก่อการร้าย / วัตถุระเบิด (Terrorism / Bombing)  
**Status:** Closed - Attack Prevented

---

## Overview

This mock investigation case simulates a BRN-C style bomb cell operating in Southern Thailand (ยะลา, ปัตตานี, นราธิวาส). The case spans 45 days from procurement to arrest, designed to test AI-powered investigation platforms.

## Case Summary

- **Duration:** Day 1 - Day 45 (Jan 14 - Feb 27, 2026)
- **Suspects:** 4 (P01-P04)
- **Witnesses:** 3 (P05-P07)
- **Evidence Items:** 27 (pinIds E001-E027)
- **Outcome:** Raid successful, VBIED defused, all suspects arrested

## Directory Structure

```
mock-case-dsi-2026-sb-042/
├── 00_CASE_OVERVIEW.md          # Case summary
├── 01_GROUND_TRUTH.md           # 7 patterns AI should detect
├── 02_PERSONAS/                 # 7 persona files
│   ├── P01_abdulleh.md         # Bomb maker (suspect)
│   ├── P02_wichai.md           # Financier (suspect)
│   ├── P03_suriya.md           # Scout/coordinator (suspect)
│   ├── P04_nikon.md            # Courier/driver (suspect)
│   ├── P05_malik_witness.md    # Shop owner (witness)
│   ├── P06_fatima_witness.md   # Teacher (witness)
│   └── P07_sgt_somsak_witness.md # Police officer (witness)
├── 03_EVIDENCE/
│   ├── receipts/               # E001-E004
│   ├── financial/              # E005-E006
│   ├── cctv/                   # E007-E015
│   ├── phone/                  # E016-E019
│   └── witness/                # E020-E021
├── 04_POLICE/                  # E022-E027
└── README.md
```

## Ground Truth (Detection Targets)

AI investigation platforms should detect these 7 patterns:

| # | Pattern | Evidence | Priority |
|---|---------|----------|----------|
| 1 | Procurement anomaly | 3 material purchases in 8 days | ⚠️ High |
| 2 | Geographic movement | Pattani → Yala → Narathiwat | Medium |
| 3 | Reconnaissance | P03 visits target 3× | Medium |
| 4 | Financial trail | P02 → P01 ฿80,000 | Medium |
| 5 | Communication spike | Day 25: 19 calls among 4 suspects | High |
| 6 | Escalation | Day 38: all 4 suspects meet | ⚠️ Critical |
| 7 | Imminent attack | Vehicle at target, bomb assembled | ⚠️ Critical |

## Timeline

| Phase | Days | Activity |
|-------|------|----------|
| Procurement | 1-10 | Material purchases, vehicle rental |
| Reconnaissance | 11-20 | Target surveillance by P03 |
| Assembly | 21-30 | Safehouse activity, coordination |
| Final Movement | 31-42 | Vehicle deployment, raid |
| Arrest | 43-45 | Suspects captured, case closed |

## Personas

### Suspects
- **P01 อับดุลเลข** - Bomb maker, technical skills, primary
- **P02 วิชัย** - Financier, provides funds
- **P03 สุริยา** - Scout, reconnaissance, communications
- **P04 นิกร** - Driver, moves materials

### Witnesses
- **P05 มะลิ** - Shop owner, saw P01 purchase materials
- **P06 ฟาติมา** - Teacher, saw P03/P04 surveying
- **P07 ร.ต.ท.สมศักดิ์** - Police, checkpoint + arrest

## Evidence Categories

| Type | Count | pinIds |
|------|-------|--------|
| Receipts | 4 | E001-E004 |
| Financial | 2 | E005-E006 |
| CCTV | 9 | E007-E015 |
| Phone Intercepts | 4 | E016-E019 |
| Witness Statements | 2 | E020-E021 |
| Police Reports | 6 | E022-E027 |

## Usage

This case is designed for testing:
- AI-powered investigation platforms
- Pattern detection algorithms
- Timeline reconstruction
- Network analysis (suspect connections)
- Citation grounding (pinId references)

## License

Mock data for testing purposes only. Not based on real events.
