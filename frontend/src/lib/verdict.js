// Shared verdict lookup — used by ScanView (live analysis result)
// and HistoryView (past scan badges) so the colors/labels always match.
export const verdictMap = {
  green: {
    eyebrow: 'SAFE',
    title: 'ทานได้',
    color: '#4f9271',
    desc: 'ไม่พบส่วนประกอบที่ต้องระวังเป็นพิเศษเทียบกับโปรไฟล์ของคุณ',
  },
  amber: {
    eyebrow: 'CAUTION',
    title: 'ไม่แนะนำ ควรหลีกเลี่ยง',
    color: '#c98a3e',
    desc: 'พบส่วนประกอบที่ควรจำกัดปริมาณ 2 รายการ เทียบกับเป้าหมายโซเดียมของคุณวันนี้',
  },
  red: {
    eyebrow: 'AVOID',
    title: 'ห้ามรับประทาน',
    color: '#c1503f',
    desc: 'พบส่วนประกอบที่มีความเสี่ยงสูงตามโปรไฟล์ของคุณ',
  },
}

// backend ส่ง status เป็น SAFE / CAUTION / AVOID — map มาเป็น key ของ verdictMap
export function statusToVerdictKey(status) {
  if (status === 'SAFE') return 'green'
  if (status === 'AVOID') return 'red'
  return 'amber' // CAUTION และค่าอื่นๆ ที่ไม่รู้จัก fallback เป็น amber
}

export function getVerdict(status) {
  return verdictMap[statusToVerdictKey(status)]
}