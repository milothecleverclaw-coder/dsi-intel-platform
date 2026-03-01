// Mock Data for DSI Intelligence Platform Demo
// Operation: Black Lotus (ดอกบัวดำ)

export const characters = [
  {
    id: 'char-001',
    name: 'สมชาย ศรีวิจิตร',
    alias: 'พ่อใหญ่',
    role: 'ผู้บงการหลัก',
    status: 'suspect',
    image: '/assets/characters/somchai.jpg',
    notes: 'อดีตนักการเมืองท้องถิ่น มีเครือข่ายกว้างขวางในจังหวัดชายแดน',
    connections: ['char-002', 'char-003', 'char-004'],
    riskLevel: 'high',
    firstSeen: '2024-01-15',
    lastActivity: '2024-03-20'
  },
  {
    id: 'char-002',
    name: 'วิไล มั่งมี',
    alias: 'นายหญิง',
    role: 'ธุรการเงิน',
    status: 'suspect',
    image: '/assets/characters/wilai.jpg',
    notes: 'อดีตผู้จัดการธนาคาร เชี่ยวชาญการโอนเงินข้ามพรมแดน',
    connections: ['char-001', 'char-005'],
    riskLevel: 'high',
    firstSeen: '2024-02-01',
    lastActivity: '2024-03-19'
  },
  {
    id: 'char-003',
    name: 'ธนกร เงินทอง',
    alias: 'เด็ก',
    role: 'คนขับขนเงิน',
    status: 'suspect',
    image: '/assets/characters/thanakorn.jpg',
    notes: 'วัย 28 ปี มีประวัติเป็นพนักงานขับรถ ถูกจับกุมคดียาเสพติดปี 2562',
    connections: ['char-001', 'char-005'],
    riskLevel: 'medium',
    firstSeen: '2024-02-10',
    lastActivity: '2024-03-18'
  },
  {
    id: 'char-004',
    name: 'อรุณ แสงสว่าง',
    alias: null,
    role: 'ทนายความ',
    status: 'person-of-interest',
    image: '/assets/characters/arun.jpg',
    notes: 'ทนายความที่ปรึกษากิจการ มีสำนักงานใกล้สถานี้รถไฟ',
    connections: ['char-001'],
    riskLevel: 'medium',
    firstSeen: '2024-02-20',
    lastActivity: '2024-03-15'
  },
  {
    id: 'char-005',
    name: 'นายแพทย์ กิตติ ศักดิ์สิทธิ์',
    alias: 'หมอ',
    role: 'ช่องทางฟอกเงิน',
    status: 'suspect',
    image: '/assets/characters/kitti.jpg',
    notes: 'เจ้าของคลินิกเวชกรรม 3 แห่ง มีรายได้ผิดปกติจากการรักษา',
    connections: ['char-002', 'char-003'],
    riskLevel: 'high',
    firstSeen: '2024-01-20',
    lastActivity: '2024-03-21'
  }
];

export const files = [
  {
    id: 'file-001',
    name: 'meeting_2024-03-15.mp4',
    type: 'video',
    size: '45.2 MB',
    duration: '03:24',
    dateCreated: '2024-03-15',
    dateAdded: '2024-03-16',
    thumbnail: '/assets/thumbnails/meeting.jpg',
    description: 'บันทึกการประชุมลับที่ภัตตาคมแห่งหนึ่ง มีผู้เข้าร่วม 3 คน',
    tags: ['ประชุม', 'ลับ', 'สมชาย'],
    relatedCharacters: ['char-001', 'char-002', 'char-004'],
    transcription: 'การประชุมเรื่องโครงการใหม่...มีการหารือเกี่ยวกับการโอนเงินก้อนใหญ่',
    aiSummary: 'การประชุมเกี่ยวกับการจัดตั้งบริษัทใหม่เพื่อรองรับเงินทุน โดยมีสมชายเป็นผู้นำการประชุม วิไลรับผิดชอบการเงิน และอรุณให้คำปรึกษาด้านกฎหมาย'
  },
  {
    id: 'file-002',
    name: 'cctv_bank_deposit.mp4',
    type: 'video',
    size: '12.8 MB',
    duration: '00:45',
    dateCreated: '2024-03-10',
    dateAdded: '2024-03-11',
    thumbnail: '/assets/thumbnails/cctv.jpg',
    description: 'กล้องวงจรปิดธนาคาร บันทึกการฝากเงิน',
    tags: ['CCTV', 'ธนาคาร', 'โอนเงิน'],
    relatedCharacters: ['char-003'],
    transcription: '-',
    aiSummary: 'ธนกร เงินทอง ฝากเงินสดจำนวน 2.5 ล้านบาท ที่ธนาคารกรุงไทย สาขาสีลม เวลา 14:32 น.'
  },
  {
    id: 'file-003',
    name: 'interview_witness.mp4',
    type: 'video',
    size: '89.1 MB',
    duration: '15:30',
    dateCreated: '2024-03-18',
    dateAdded: '2024-03-18',
    thumbnail: '/assets/thumbnails/interview.jpg',
    description: 'บันทึกการให้การพยาน นายประยุทธ์ พยานในคดี',
    tags: ['พยาน', 'ให้การ', 'สอบสวน'],
    relatedCharacters: [],
    transcription: 'เห็นรถตู้คันหนึ่งจอดที่หน้าอาคาร...มีคนยกถุงผ้าใบใหญ่ 3-4 ใบเข้าไป',
    aiSummary: 'พยานเห็นกิจกรรมน่าสงสัยที่อาคารพาณิชย์แห่งหนึ่งในวันที่ 10 มีนาคม เห็นบุคคล 2-3 คนเคลื่อนย้ายสัมภาระขนาดใหญ่'
  },
  {
    id: 'file-004',
    name: 'call_intercept_001.mp3',
    type: 'audio',
    size: '2.1 MB',
    duration: '01:45',
    dateCreated: '2024-03-15',
    dateAdded: '2024-03-16',
    thumbnail: '/assets/thumbnails/audio.svg',
    url: '/assets/audio/call_intercept_001.mp3',
    description: 'บันทึกการสนทนาโทรศัพท์ หมายเลข 089-XXX-XXXX',
    tags: ['โทรศัพท์', 'ดักฟัง', 'สมชาย', 'วิไล'],
    relatedCharacters: ['char-001', 'char-002'],
    transcription: `
      [00:00] สมชาย: คุณวิไล การโอนเงินก้อนนี้เรียบร้อยไหม
      [00:05] วิไล: เรียบร้อยแล้วค่ะ โอนไปที่บัญชีคลินิกหมอกิตติแล้ว
      [00:12] สมชาย: ดีมาก อย่าลืมทำลายร่องรอยนะ
      [00:18] วิไล: ค่ะทราบแล้วค่ะ ทุกอย่างจะเรียบร้อย
      [00:25] สมชาย: คราวหน้าจะเพิ่มเป็น 5 ล้าน ให้เตรียมตัวรับ
      [00:32] วิไล: ได้ค่ะ จะจัดการให้
    `,
    aiSummary: 'สมชายสั่งการให้วิไลโอนเงินไปยังคลินิกของหมอกิตติ และเตรียมรับเงินก้อนใหญ่กว่าเดิมในครั้งต่อไป'
  },
  {
    id: 'file-005',
    name: 'call_intercept_002.mp3',
    type: 'audio',
    size: '1.8 MB',
    duration: '01:20',
    dateCreated: '2024-03-16',
    dateAdded: '2024-03-17',
    thumbnail: '/assets/thumbnails/audio.svg',
    url: '/assets/audio/call_intercept_002.mp3',
    description: 'บันทึกการสนทนาโทรศัพท์ หมายเลข 062-XXX-XXXX',
    tags: ['โทรศัพท์', 'ดักฟัง', 'ธนกร', 'หมอ'],
    relatedCharacters: ['char-003', 'char-005'],
    transcription: `
      [00:00] ธนกร: หมอครับ เงินเข้าไหม
      [00:03] หมอกิตติ: เข้าแล้ว 3 ล้าน พรุ่งนี้จะจัดการต่อ
      [00:10] ธนกร: โอเคครับ เดี๋ยวผมไปรับส่วนแบ่งที่ไหน
      [00:15] หมอกิตติ: มาที่คลินิกหลังเที่ยงครับ เอาไปเลย 30%
      [00:22] ธนกร: ขอบคุณครับหมอ
    `,
    aiSummary: 'ธนกรและหมอกิตติหารือเรื่องแบ่งเงิน โดยธนกรจะได้รับ 30% ของเงิน 3 ล้านบาท'
  },
  {
    id: 'file-006',
    name: 'company_registration.pdf',
    type: 'document',
    size: '1.2 MB',
    dateCreated: '2024-02-01',
    dateAdded: '2024-03-10',
    thumbnail: '/assets/thumbnails/document.svg',
    description: 'หนังสือจดทะเบียนบริษัท สยามพัฒนาการจำกัด',
    tags: ['เอกสาร', 'บริษัท', 'จดทะเบียน'],
    relatedCharacters: ['char-001', 'char-004'],
    transcription: '-',
    aiSummary: 'บริษัท สยามพัฒนาการจำกัด จดทะเบียนเมื่อวันที่ 1 กุมภาพันธ์ 2567 ทุนจดทะเบียน 5 ล้านบาท ผู้ถือหุ้นใหญ่คือ นางสาววิไล มั่งมี (60%) ที่ปรึกษากฎหมายคือ นายอรุณ แสงสว่าง'
  },
  {
    id: 'file-007',
    name: 'bank_transfer_evidence.pdf',
    type: 'document',
    size: '3.5 MB',
    dateCreated: '2024-03-12',
    dateAdded: '2024-03-12',
    thumbnail: '/assets/thumbnails/document.svg',
    description: 'หลักฐานการโอนเงินจากธนาคาร',
    tags: ['เอกสาร', 'ธนาคาร', 'โอนเงิน', 'หลักฐาน'],
    relatedCharacters: ['char-002', 'char-005'],
    transcription: '-',
    aiSummary: 'รายการโอนเงินระหว่างบัญชี พบรายการโอนเงินผิดปกติ 15 รายการ รวมมูลค่า 23.5 ล้านบาท จากบัญชีบริษัท สยามพัฒนาการ ไปยังคลินิกเวชกรรม 3 แห่ง'
  },
  {
    id: 'file-008',
    name: 'property_deed.jpg',
    type: 'image',
    size: '8.2 MB',
    dateCreated: '2024-01-20',
    dateAdded: '2024-03-14',
    thumbnail: '/assets/thumbnails/deed.svg',
    description: 'โฉนดที่ดิน เลขที่ 12345 ตำบลหนองบัว',
    tags: ['โฉนด', 'ที่ดิน', 'ทรัพย์สิน'],
    relatedCharacters: ['char-001'],
    transcription: '-',
    aiSummary: 'โฉนดที่ดิน 50 ไร่ อยู่ในชื่อ นายสมชาย ศรีวิจิตร ซื้อเมื่อวันที่ 20 มกราคม 2567 ราคาประเมิน 15 ล้านบาท แต่ราคาจดทะเบียนเพียง 3 ล้านบาท'
  }
];

export const relationships = [
  { from: 'char-001', to: 'char-002', type: 'financial', label: 'สั่งการโอนเงิน', strength: 5 },
  { from: 'char-001', to: 'char-003', type: 'operational', label: 'จ้างงาน', strength: 4 },
  { from: 'char-001', to: 'char-004', type: 'advisory', label: 'ปรึกษากฎหมาย', strength: 3 },
  { from: 'char-002', to: 'char-005', type: 'financial', label: 'โอนเงิน', strength: 5 },
  { from: 'char-003', to: 'char-005', type: 'financial', label: 'รับเงิน', strength: 4 },
  { from: 'char-001', to: 'file-001', type: 'appears_in', label: 'ปรากฏใน', strength: 5 },
  { from: 'char-002', to: 'file-001', type: 'appears_in', label: 'ปรากฏใน', strength: 5 },
  { from: 'char-003', to: 'file-002', type: 'appears_in', label: 'ปรากฏ in', strength: 5 },
  { from: 'char-001', to: 'file-004', type: 'speaks_in', label: 'พูดใน', strength: 5 },
  { from: 'char-002', to: 'file-004', type: 'speaks_in', label: 'พูดใน', strength: 5 },
  { from: 'char-003', to: 'file-005', type: 'speaks_in', label: 'พูดใน', strength: 5 },
  { from: 'char-005', to: 'file-005', type: 'speaks_in', label: 'พูดใน', strength: 5 },
  { from: 'char-001', to: 'file-008', type: 'owns', label: 'เป็นเจ้าของ', strength: 5 },
  { from: 'char-002', to: 'file-006', type: 'owns', label: 'ถือหุ้นใหญ่', strength: 5 },
  { from: 'char-004', to: 'file-006', type: 'advisory', label: 'ที่ปรึกษากฎหมาย', strength: 3 },
  { from: 'char-002', to: 'file-007', type: 'involved_in', label: 'เกี่ยวข้อง', strength: 5 },
  { from: 'char-005', to: 'file-007', type: 'involved_in', label: 'เกี่ยวข้อง', strength: 5 },
];

export const chatHistory = [
  {
    id: 'msg-001',
    type: 'user',
    content: 'ใครเชื่อมโยงกับสมชายบ้าง',
    timestamp: '2024-03-21T10:30:00'
  },
  {
    id: 'msg-002',
    type: 'ai',
    content: `จากการวิเคราะห์ข้อมูล พบบุคคลที่เชื่อมโยงกับ **สมชาย ศรีวิจิตร (พ่อใหญ่)** ดังนี้:\n\n1. **วิไล มั่งมี (นายหญิง)** - ธุรการเงิน\n   - รับผิดชอบการโอนเงิน\n   - ปรากฏในวิดีโอการประชุม และบันทึกการสนทนา\n   \n2. **ธนกร เงินทอง (เด็ก)** - คนขับขนเงิน\n   - ถูกจ้างให้ขนส่งเงินสด\n   - ปรากฏในกล้องวงจรปิดขณะฝากเงิน\n   \n3. **อรุณ แสงสว่าง** - ทนายความ\n   - ให้คำปรึกษาด้านกฎหมาย\n   - ร่วมประชุมในวิดีโอ\n   \n4. **นพ.กิตติ ศักดิ์สิทธิ์ (หมอ)** - ช่องทางฟอกเงิน\n   - รับเงินผ่านคลินิก\n   - มีการติดต่อกับวิไลและธนกร`,
    timestamp: '2024-03-21T10:30:05'
  },
  {
    id: 'msg-003',
    type: 'user',
    content: 'แสดงเส้นทางการโอนเงินทั้งหมด',
    timestamp: '2024-03-21T10:35:00'
  },
  {
    id: 'msg-004',
    type: 'ai',
    content: `📊 **เส้นทางการโอนเงินที่ตรวจพบ**\n\n\`\`\`\n[สมชาย \"พ่อใหญ่\"]\n        │\n        │ สั่งการ\n        ▼\n   [วิไล \"นายหญิง\"]\n        │\n        │ โอนเงิน 23.5 ล้านบาท\n        │ (ผ่านบริษัท สยามพัฒนาการ)\n        ▼\n[นพ.กิตติ \"หมอ\"] ──── แบ่ง 30% ────▶ [ธนกร \"เด็ก\"]\n        │\n        │ ฟอกเงินผ่าน\n        ▼\n   [คลินิกเวชกรรม 3 แห่ง]\n\`\`\`\n\n**สรุปยอดเงิน:**\n- ยอดโอนรวม: 23.5 ล้านบาท\n- จำนวนรายการ: 15 รายการ\n- ช่วงเวลา: กุมภาพันธ์ - มีนาคม 2567`,
    timestamp: '2024-03-21T10:35:08'
  },
  {
    id: 'msg-005',
    type: 'user',
    content: 'มีหลักฐานอะไรบ้างที่เกี่ยวกับการฟอกเงิน',
    timestamp: '2024-03-21T10:40:00'
  },
  {
    id: 'msg-006',
    type: 'ai',
    content: `📁 **หลักฐานที่เกี่ยวข้องกับการฟอกเงิน**\n\n**1. 📄 เอกสาร (2 ไฟล์)**\n- \`company_registration.pdf\` - จดทะเบียนบริษัทเปลือก\n- \`bank_transfer_evidence.pdf\` - หลักฐานการโอนเงิน 15 รายการ\n\n**2. 🎤 บันทึกเสียง (2 ไฟล์)**\n- \`call_intercept_001.mp3\` - สมชายสั่งการโอนเงิน\n- \`call_intercept_002.mp3\` - ธนกรและหมอแบ่งเงิน\n\n**3. 📹 วิดีโอ (2 ไฟล์)**\n- \`meeting_2024-03-15.mp4\` - ประชุมวางแผน\n- \`cctv_bank_deposit.mp4\` - ธนกรฝากเงินสด\n\n**4. 🖼️ ภาพ (1 ไฟล์)**\n- \`property_deed.jpg\` - โฉนดที่ดินที่ซื้อด้วยเงินฟอก\n\n**ความเชื่อมโยงหลัก:** บริษัท สยามพัฒนาการ → คลินิกเวชกรรม → ทรัพย์สิน`,
    timestamp: '2024-03-21T10:40:10'
  }
];

export const caseInfo = {
  name: 'Operation Black Lotus',
  thaiName: 'ดอกบัวดำ',
  caseNumber: 'DSI-2024-0315',
  status: 'active',
  priority: 'high',
  startDate: '2024-03-15',
  leadInvestigator: 'พันตำรวจเอก สมศักดิ์ ไทย',
  summary: 'คดีฉ้อโกงเงินทุนสาธารณะและฟอกเงิน กลุ่มบุคคลร่วมกันจัดตั้งบริษัทเปลือกเพื่อฟอกเงินผ่านธุรกิจคลินิกเวชกรรม',
  totalFiles: 8,
  totalCharacters: 5,
  totalConnections: 12
};
