<template>
  <div class="tips-page">
    <div class="intro">
      <span class="eyebrow">ความรู้</span>
      <h1>เคล็ดลับกินอยู่ดี</h1>
      <p>รวมวิธีอ่านฉลากและข้อควรระวังที่ช่วยให้คุณเลือกกินได้อย่างมั่นใจมากขึ้น</p>
    </div>

    <div class="tips-list">
      <article
        v-for="(cat, i) in categories"
        :key="cat.title"
        class="tip-card"
        :class="{ open: openIndex === i }"
      >
        <button type="button" class="tip-head" @click="toggle(i)">
          <span class="tip-icon" :class="cat.tone" v-html="cat.icon"></span>
          <span class="tip-title">{{ cat.title }}</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <ul v-show="openIndex === i" class="tip-body">
          <li v-for="point in cat.points" :key="point">{{ point }}</li>
        </ul>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// เปิดหมวดแรกไว้ก่อนเป็นค่าเริ่มต้น ที่เหลือคลิกเพื่อขยายทีละหมวด
const openIndex = ref(0)
function toggle(i) {
  openIndex.value = openIndex.value === i ? -1 : i
}

const categories = [
  {
    title: 'วิธีอ่านฉลากโภชนาการให้เป็น',
    tone: 'green',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
    points: [
      'ดูรายการ "ส่วนประกอบ" ก่อนเสมอ — เรียงจากมากไปน้อยตามปริมาณ ตัวแรกๆ คือสิ่งที่มีเยอะที่สุด',
      'สังเกตหน่วย "ต่อหนึ่งหน่วยบริโภค" ให้ดี บางทีทั้งซองมีมากกว่า 1 หน่วยบริโภค ทำให้ตัวเลขบนฉลากดูน้อยกว่าที่กินจริง',
      'รหัส E-number หรือคำลงท้าย "-INS" คือสารเติมแต่งอาหาร ไม่ได้แปลว่าอันตรายเสมอไป แต่ควรเช็คถ้ามีโรคประจำตัว',
      'คำว่า "may contain" หรือ "ผลิตในโรงงานที่ใช้ร่วมกับ..." คือคำเตือนปนเปื้อนข้ามสาย สำคัญมากสำหรับคนแพ้อาหารรุนแรง',
    ],
  },
  {
    title: 'สำหรับผู้ป่วยเบาหวาน',
    tone: 'orange',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-2 4-6 7-6 12a6 6 0 0 0 12 0c0-5-4-8-6-12Z"/></svg>',
    points: [
      'มองหาคำว่า น้ำตาล, กลูโคส, ฟรุกโตส, น้ำเชื่อมข้าวโพด (HFCS), มอลโทเดกซ์ทริน — ล้วนคือน้ำตาลในชื่ออื่น',
      'สารให้ความหวานแทนน้ำตาล (เช่น สตีเวีย, ซูคราโลส) ปลอดภัยกว่าสำหรับเบาหวาน แต่ควรกินในปริมาณที่เหมาะสม',
      'ระวังคาร์โบไฮเดรตซ่อนรูปในของที่ไม่หวาน เช่น ซอส น้ำจิ้ม ขนมปังกรอบ ก็มีแป้ง/น้ำตาลแฝงอยู่',
      'เลือกอาหารที่มีใยอาหารสูง เพราะช่วยชะลอการดูดซึมน้ำตาลเข้าสู่กระแสเลือด',
    ],
  },
  {
    title: 'สำหรับผู้ป่วยความดัน/โรคไต (โซเดียม)',
    tone: 'blue',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/></svg>',
    points: [
      'โซเดียมไม่ได้มาจากเกลือเท่านั้น — ผงชูรส (MSG), ผงฟู, สารกันบูดหลายชนิดก็มีโซเดียมแฝงอยู่',
      'อาหารแปรรูป บะหมี่กึ่งสำเร็จรูป และขนมขบเคี้ยว มักมีโซเดียมสูงกว่าที่คิดมาก ควรเช็คตัวเลขบนฉลากทุกครั้ง',
      'คำแนะนำทั่วไปคือไม่เกิน 2,000 มก. โซเดียมต่อวัน (ประมาณเกลือ 1 ช้อนชา) — ผู้ป่วยไตควรปรึกษาแพทย์เพื่อกำหนดปริมาณที่เหมาะกับตัวเอง',
      'ตั้งค่าลิมิตโซเดียมในหน้าโปรไฟล์สุขภาพไว้ล่วงหน้า ระบบจะช่วยเตือนอัตโนมัติทุกครั้งที่สแกน',
    ],
  },
  {
    title: 'สำหรับคนแพ้อาหาร',
    tone: 'red',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4.5 8-11.5A5.5 5.5 0 0 0 12 6a5.5 5.5 0 0 0-8 4.5C4 17.5 12 22 12 22Z"/><path d="M12 9v4M12 16h.01"/></svg>',
    points: [
      'สารก่อภูมิแพ้อาจซ่อนอยู่ในชื่อพ้อง เช่น แพ้ถั่ว ให้ระวังคำว่า peanut, groundnut, nutty, almond, cashew ด้วย',
      'ระบบจะตั้งสถานะ "ควรหลีกเลี่ยง" ทันทีถ้าพบสารที่ตรงกับรายการแพ้ในโปรไฟล์ของคุณ — ไม่มีการลดระดับเป็นแค่ "ควรระวัง" เพราะอาการแพ้อาจรุนแรงถึงชีวิต',
      'พกยาแก้แพ้หรือ EpiPen ติดตัวเสมอถ้าเคยมีประวัติแพ้รุนแรง (anaphylaxis) และแจ้งคนใกล้ชิดให้รู้วิธีช่วยเหลือเบื้องต้น',
      'ตั้งค่ารายการอาหารที่แพ้ในหน้าโปรไฟล์สุขภาพให้ครบถ้วน รวมถึงชื่อเรียกอื่นๆ ที่คุณรู้จัก จะช่วยให้ระบบเช็คได้แม่นยำขึ้น',
    ],
  },
  {
    title: 'ข้อควรระวังอื่นๆ ที่ควรรู้จัก',
    tone: 'green',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    points: [
      'สีผสมอาหารสังเคราะห์กลุ่ม azo dye (tartrazine, sunset yellow, allura red ฯลฯ) และวัตถุกันเสียกลุ่มซัลไฟต์ อาจกระตุ้นอาการในผู้ที่พร่องเอนไซม์ G6PD',
      'ถั่วปากอ้า (fava beans) เป็นอีกหนึ่งวัตถุดิบที่ผู้ป่วย G6PD ควรระวังเป็นพิเศษ',
      'ข้อมูลในแอปนี้เป็นเพียงข้อมูลเบื้องต้นเพื่อช่วยตัดสินใจ ไม่ใช่คำวินิจฉัยทางการแพทย์ หากไม่แน่ใจควรปรึกษาแพทย์หรือเภสัชกร',
    ],
  },
]
</script>

<style scoped>
.tips-page { max-width: 720px; margin: 0 auto; padding: 28px 24px 60px; }

.intro { text-align: center; margin-bottom: 26px; }
.eyebrow { font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--orange); letter-spacing: 0.08em; }
.intro h1 { margin: 8px 0 6px; font-size: 24px; }
.intro p { margin: 0; color: var(--muted); font-size: 14px; }

.tips-list { display: flex; flex-direction: column; gap: 12px; }

.tip-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.tip-card.open { border-color: var(--orange); }

.tip-head {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px;
  background: none; border: none; cursor: pointer;
  text-align: left; font-family: inherit;
}
.tip-icon {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--green-tint); color: var(--green);
}
.tip-icon svg { width: 17px; height: 17px; }
.tip-icon.orange { background: var(--orange-tint); color: var(--orange); }
.tip-icon.blue { background: var(--blue-tint); color: var(--blue); }
.tip-icon.red { background: #faeae7; color: var(--red); }

.tip-title { flex: 1; font-weight: 700; font-size: 14.5px; }
.chevron { width: 18px; height: 18px; color: var(--muted); flex-shrink: 0; transition: transform 0.15s ease; }
.tip-card.open .chevron { transform: rotate(180deg); color: var(--orange); }

.tip-body {
  margin: 0; padding: 0 18px 18px 62px;
  display: flex; flex-direction: column; gap: 9px;
  list-style: disc;
}
.tip-body li { font-size: 13.5px; line-height: 1.6; color: var(--ink); }

@media (max-width: 560px) {
  .tip-body { padding-left: 18px; }
}
</style>