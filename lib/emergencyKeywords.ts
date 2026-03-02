export const EMERGENCY_KEYWORDS = [
  // ภาษาไทย
  'ชัก', 'หมดสติ', 'เป็นลม', 'หายใจไม่ออก', 'หายใจลำบาก',
  'กินยา', 'กินสารพิษ', 'กินของมีพิษ', 'ถูกพิษ', 'โดนพิษ',
  'เลือดออกมาก', 'เลือดไหลไม่หยุด', 'กระดูกหัก', 'ถูกรถชน',
  'ตกจากที่สูง', 'จมน้ำ', 'ไม่หายใจ', 'ตัวเย็น', 'ตาค้าง',
  'ยาเบื่อ', 'กินช็อคโกแลต', 'กินหัวหอม', 'กินกระเทียม',
  // ภาษาอังกฤษ
  'seizure', 'convulsion', 'unconscious', 'not breathing',
  'difficulty breathing', 'poisoning', 'poison', 'toxic',
  'bleeding heavily', 'hit by car', 'drowning', 'collapsed',
  'overdose', 'ate chocolate', 'swallowed',
];

export function isEmergency(message: string): boolean {
  const lower = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lower.includes(keyword));
}