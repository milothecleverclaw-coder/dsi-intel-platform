# Ground Truth - Detection Patterns
## DSI-2026-SB-042: คดีเซลล์วัตถุระเบิดยะลา

This document outlines the 7 key patterns that the AI investigation system should detect when analyzing evidence from this case.

---

## Pattern 1: Procurement Anomaly
**Anomaly Type:** Temporal clustering of purchases

**Description:** Three separate purchases of bomb precursor materials occurred within an 8-day window, each from different locations across the three provinces.

**Expected Detection:**
- Purchase of ammonium nitrate fertilizer (Pattani) - Day 12
- Purchase of electronic components (Yala) - Day 15  
- Purchase of hydrogen peroxide (Narathiwas) - Day 20

**AI Flag:** "Unusual clustering of purchases related to explosive precursors"

---

## Pattern 2: Geographic Movement
**Anomaly Type:** Multi-province coordination

**Description:** Suspects traveled systematically between the three Southern Border Provinces in a pattern indicating operational coordination rather than normal travel.

**Movement Trail:**
- Pattani → Yala (P02 meeting P01) - Day 5
- Yala → Narathiwas (P01 meeting P04) - Day 18
- Pattani → Narathiwas (P02 transferring funds) - Day 22
- All suspects converging in Yala - Day 38

**AI Flag:** "Coordinated inter-province movements consistent with cell operations"

---

## Pattern 3: Reconnaissance Activity
**Anomaly Type:** Repeated target surveillance

**Description:** Suspect P03 (Suriya) visited the target location (Yala Central Market) three times within a 10-day period, exhibiting behavior inconsistent with normal shopping patterns.

**Timeline:**
- Day 30: 45-minute visit, photographed entry/exit points
- Day 35: 30-minute visit, noted security camera positions
- Day 40: 20-minute visit, timed peak traffic flow

**AI Flag:** "Systematic reconnaissance of potential target location"

---

## Pattern 4: Financial Trail
**Anomaly Type:** Suspicious fund transfers

**Description:** Money flowed from P02 (financier) to P01 (bomb maker) through multiple intermediaries to obscure the connection.

**Transaction Pattern:**
- Day 8: P02 withdraws ฿150,000 from Pattani bank
- Day 10: Cash deposited to hawala network
- Day 14: P01 receives equivalent amount via informal transfer in Yala

**AI Flag:** "Structured fund transfer suggestive of terrorist financing"

---

## Pattern 5: Communication Spike
**Anomaly Type:** Unusual contact pattern

**Description:** On Day 25, all four suspects contacted each other within a 3-hour window - a dramatic deviation from their normal communication patterns.

**Pattern Details:**
- Baseline: Minimal inter-suspect communication (1-2 contacts per week)
- Day 25 spike: 12 calls/SMS between all pairs within 3 hours
- Trigger: Likely coordination for final attack planning

**AI Flag:** "Communication spike indicating coordinated cell activation"

---

## Pattern 6: Escalation Pattern
**Anomaly Type:** Convergence of suspects

**Description:** Day 38 marked the first time all four suspects were physically present in the same location simultaneously, indicating imminent operational execution.

**Convergence Details:**
- Location: Safe house in Yala
- Duration: 4-hour meeting
- Subsequent activity: Vehicle loaded with device, moved to target area

**AI Flag:** "All cell members converging - imminent threat indicator"

---

## Pattern 7: Imminent Attack Indicators
**Anomaly Type:** Final preparation signatures

**Description:** Multiple indicators of an imminent attack detected in the final 48 hours before interception.

**Key Indicators:**
- Vehicle positioned at target location overnight (Day 41)
- Bomb assembly completed (based on procurement timeline)
- Final "test" communication between suspects (Day 41 evening)
- No further precursor purchases (indicating readiness)

**AI Flag:** "CRITICAL: Imminent attack indicators present - immediate intervention required"

---

## Summary Table

| Pattern | Suspects Involved | Time Window | Criticality |
|---------|------------------|-------------|-------------|
| 1. Procurement | All | Days 12-20 | Medium |
| 2. Geographic Movement | All | Days 5-38 | Medium |
| 3. Reconnaissance | P03 | Days 30-40 | High |
| 4. Financial Trail | P01, P02 | Days 8-14 | Medium |
| 5. Communication Spike | All | Day 25 | High |
| 6. Escalation | All | Day 38 | Critical |
| 7. Imminent Attack | All | Days 41-42 | Critical |

---
*These patterns form the ground truth for validating AI detection accuracy*
