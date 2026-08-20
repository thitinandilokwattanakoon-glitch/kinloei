<template>
  <div class="scan-page">
    <router-link to="/" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      กลับหน้าแรก
    </router-link>

    <div class="layout-grid">
    <div class="capture-col" v-if="!result">

    <div class="intro">
      <span class="eyebrow">STEP 01 · CAPTURE</span>
      <h1>ถ่ายรูปฉลาก ก่อน<em>กินเลย</em></h1>
      <p>เล็งกล้องไปที่ฉลากโภชนาการ หรือเลือกภาพจากคลังก็ได้</p>
    </div>

    <div class="stage">
      <Transition name="fade" mode="out-in">

        <!-- ยังไม่ได้เปิดกล้อง/ยังไม่มีรูป -->
        <div
          v-if="mode === 'idle'"
          key="idle"
          class="stage-card dropzone"
          :class="{ drag: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>

          <div class="idle-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3.2" />
            </svg>
          </div>

          <button class="btn-primary" @click="openCamera">เปิดกล้อง</button>
          <button class="btn-ghost" @click="triggerGallery">เลือกภาพจากคลัง</button>
          <p class="hint">หรือลากไฟล์รูปมาวางตรงนี้</p>

          <p v-if="cameraError" class="error-msg">{{ cameraError }}</p>

          <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="onGalleryChange"
          />
        </div>

        <!-- กล้องกำลังเปิดอยู่ -->
        <div v-else-if="mode === 'camera'" key="camera" class="stage-card camera-live">
          <video ref="videoEl" autoplay playsinline muted></video>

          <div class="corner tl light"></div>
          <div class="corner tr light"></div>
          <div class="corner bl light"></div>
          <div class="corner br light"></div>

          <button class="close-btn" @click="closeCamera" aria-label="ปิดกล้อง">✕</button>

          <div class="camera-controls">
            <button class="switch-btn" @click="switchCamera" aria-label="สลับกล้อง" :disabled="switching">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 2l4 4-4 4M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
            <button class="shutter-btn" @click="capturePhoto" aria-label="ถ่ายภาพ">
              <span class="shutter-ring"></span>
            </button>
            <span class="spacer"></span>
          </div>
        </div>

        <!-- ถ่าย/เลือกรูปแล้ว -->
        <div v-else key="preview" class="stage-card preview">
          <img :src="imageUrl" alt="ภาพที่เลือก" />
          <div class="preview-tag">READY</div>
          <button class="retake-btn" @click="retake">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
            </svg>
            ถ่ายใหม่
          </button>
        </div>

      </Transition>

      <canvas ref="canvasEl" class="hidden-input"></canvas>
    </div>

    <button
      class="analyze-btn"
      :disabled="mode !== 'preview' || analyzing"
      @click="analyzeImage"
    >
      <span v-if="analyzing">กำลังส่งตรวจสอบ...</span>
      <span v-else>ตรวจสอบภาพ</span>
    </button>
    <p v-if="analyzeNote" class="analyze-note error">{{ analyzeNote }}</p>

    </div><!-- /.capture-col -->

    <!-- ผลลัพธ์ตรวจสอบแบบมีโครงสร้างจาก backend -->
    <div class="result-col">
    <Transition name="fade">
      <div v-if="result" ref="resultBoxEl" class="result-box" :style="{ '--v-color': verdict?.color }">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>

        <!-- ===== ป้ายผลสรุป (verdict banner) — สิ่งแรกที่ต้องเห็น มองปุ๊บรู้เลยว่ากินได้ไหม ===== -->
        <div v-if="verdict" class="verdict-banner top-banner">
          <svg v-if="heroIcon === 'safe'" class="verdict-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6" /></svg>
          <svg v-else-if="heroIcon === 'danger'" class="verdict-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          <svg v-else class="verdict-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.3 4.4L2.7 18a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 4.4a1.6 1.6 0 0 0-2.8 0z" />
            <path d="M12 9.5v3.6" /><circle cx="12" cy="16.3" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <div class="verdict-banner-copy">
            <span class="verdict-banner-eyebrow">{{ verdict.eyebrow }}</span>
            <span class="verdict-banner-text">{{ verdict.title }}</span>
          </div>
        </div>

        <button type="button" class="rescan-link" @click="retake">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          สแกนใหม่
        </button>

        <!-- ===== การ์ดสรุปผลแบบเห็นชัด (hero) ===== -->
        <div class="hero-block">
          
          <!-- รูป + ชื่ออาหาร วางคู่กัน ให้ชื่ออาหารเด่นชัด อ่านง่ายกว่าเดิม -->
          <div class="identity-row">
            <div class="hero-photo-wrap">
              <div class="hero-glow"></div>
              <div class="hero-photo">
                <img v-if="imageUrl" :src="imageUrl" alt="ภาพสินค้าที่ตรวจสอบ" />
              </div>
              <div class="hero-badge">
                <svg v-if="heroIcon === 'safe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6" /></svg>
                <svg v-else-if="heroIcon === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.3 4.4L2.7 18a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 4.4a1.6 1.6 0 0 0-2.8 0z" />
                  <path d="M12 9.5v3.6" /><circle cx="12" cy="16.3" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
            </div>

            <div class="identity-copy">
              <p class="hero-product-name">{{ result.product_name || 'ไม่ทราบชื่อสินค้า' }}</p>
              <p v-if="result.brand" class="hero-product-brand">{{ result.brand }}</p>
            </div>
          </div>

          <div class="hero-summary-box">
            <!-- summary จาก Gemini เป็นข้อความเฉพาะของสินค้านี้ -->
            <p class="result-text">{{ result.summary }}</p>
            <button type="button" class="details-toggle-btn" @click="toggleDetails()">
              {{ showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด' }}
              <svg class="toggle-chevron" :class="{ flipped: showDetails }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>

          <!-- คำเตือนว่าผลมาจาก AI แสดงตลอดเวลา ไม่ต้องกด "ดูรายละเอียด" ก่อน -->
          <p class="ai-disclaimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.3 4.4L2.7 18a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 4.4a1.6 1.6 0 0 0-2.8 0z" />
              <path d="M12 9.5v3.6" /><circle cx="12" cy="16.3" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            <span>ผลตรวจสอบนี้ประมวลผลด้วย AI อาจมีความคลาดเคลื่อนได้ โปรดตรวจสอบฉลากจริงหรือปรึกษาแพทย์/ผู้เชี่ยวชาญก่อนตัดสินใจ</span>
          </p>
        </div>

        <!-- ===== คำแนะนำด้านสุขภาพและโภชนาการ (จากข้อมูลจริงของผลตรวจสอบเท่านั้น) ===== -->
        <div v-if="result.recommendation || result.flagged_ingredients?.length" class="tips-card">
          <span class="section-label tips-label">คำแนะนำด้านสุขภาพและโภชนาการ</span>
          <div class="tips-list">
            <div v-if="result.recommendation" class="tip-row">
              <span class="tip-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z" />
                </svg>
              </span>
              <p>{{ result.recommendation }}</p>
            </div>
            <button
              v-if="result.flagged_ingredients?.length"
              type="button"
              class="tip-row tip-row-link"
              @click="toggleDetails(true)"
            >
              <span class="tip-icon warn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.3 4.4L2.7 18a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 4.4a1.6 1.6 0 0 0-2.8 0z" />
                  <path d="M12 9.5v3.6" /><circle cx="12" cy="16.3" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <p>พบส่วนผสมที่ควรระวัง {{ result.flagged_ingredients.length }} รายการ — ดูรายละเอียด</p>
            </button>
          </div>
        </div>

        <!-- ===== รายละเอียดฉบับเต็ม (ซ่อนไว้ก่อน กดปุ่ม "ดูรายละเอียด" ถึงจะโชว์) ===== -->
        <Transition name="expand">
          <div v-if="showDetails" ref="detailPanelEl" class="detail-panel">
            <span class="section-label">รายละเอียดฉบับเต็ม</span>

            <div v-if="result.flagged_ingredients?.length" class="flagged-section">
              <span class="section-label">ส่วนผสมที่ควรระวัง</span>
              <div class="flagged-list">
                <div
                  v-for="(item, i) in result.flagged_ingredients"
                  :key="i"
                  class="flagged-item"
                  :class="`sev-${item.severity}`"
                >
                  <span class="flagged-dot"></span>
                  <div class="flagged-copy">
                    <span class="flagged-name">{{ item.name }}</span>
                    <span class="flagged-reason">{{ item.reason }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ผลค้นหาข้อมูลสินค้าเพิ่มเติมจากเว็บ (search_product_info second-pass) -->
            <div v-if="result.product_search" class="product-search-box">
              <div v-if="result.product_search.found" class="ps-content">
                <div class="ps-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                  ข้อมูลเพิ่มเติมจากการค้นหา
                </div>

                <div v-if="result.product_search.ingredients_from_web?.length" class="ps-block">
                  <b>ส่วนประกอบที่ค้นเจอ</b>
                  <span>{{ result.product_search.ingredients_from_web.join(', ') }}</span>
                </div>

                <div v-if="result.product_search.additives_from_web?.length" class="ps-block">
                  <b>วัตถุเจือปน</b>
                  <span>{{ result.product_search.additives_from_web.join(', ') }}</span>
                </div>

                <div v-if="result.product_search.authority_warnings?.length" class="ps-block ps-warning">
                  <b>⚠ คำเตือนจากหน่วยงาน</b>
                  <span>{{ result.product_search.authority_warnings.join(', ') }}</span>
                </div>

                <div v-if="result.product_search.recall_history?.length" class="ps-block ps-warning">
                  <b>⚠ ประวัติเรียกคืนสินค้า</b>
                  <span>{{ result.product_search.recall_history.join(', ') }}</span>
                </div>

                <p v-if="result.product_search.label_vs_reference" class="ps-block">
                  <b>เทียบกับฉลากที่อ่านได้</b> {{ result.product_search.label_vs_reference }}
                </p>

                <p v-if="result.product_search.health_insights" class="ps-block">
                  {{ result.product_search.health_insights }}
                </p>

                <p v-if="result.product_search.sources?.length" class="ps-sources">
                  แหล่งข้อมูล: {{ result.product_search.sources.join(', ') }}
                </p>
              </div>

              <p v-else class="ps-not-found">
                ค้นหาข้อมูลเพิ่มเติมจากเว็บแล้ว แต่ไม่พบข้อมูลของสินค้านี้
              </p>
            </div>

            <p v-if="result.disclaimer" class="result-disclaimer">{{ result.disclaimer }}</p>
          </div>
        </Transition>
      </div>
      <div v-else key="empty" class="result-placeholder">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
          <path d="M9.5 12l1.8 1.8L15 10" />
        </svg>
        <span class="eyebrow">STEP 02 · RESULT</span>
        <p>ผลตรวจสอบจะแสดงตรงนี้ หลังกดปุ่ม "ตรวจสอบภาพ"</p>
      </div>
    </Transition>
    </div><!-- /.result-col -->

    </div><!-- /.layout-grid -->

    <!-- ===== หน้ากำลังตรวจสอบ (full-screen overlay) ===== -->
    <!-- ขึ้นทันทีที่กดปุ่ม "ตรวจสอบภาพ" แล้วหายไปทันทีที่ผลลัพธ์พร้อม เผยหน้าผลลัพธ์ด้านหลังเลย -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="analyzing" class="analyzing-overlay">
          <div class="analyzing-card">
            <div class="analyzing-photo">
              <img v-if="imageUrl" :src="imageUrl" alt="ภาพที่กำลังตรวจสอบ" />
              <div class="scan-line"></div>
            </div>
            <div class="analyzing-spinner"></div>
            <h2 class="analyzing-title">กำลังตรวจสอบ...</h2>
            <p class="analyzing-step">{{ analyzingMessages[analyzingStep] }}</p>
            <div class="analyzing-progress"><span></span></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { scanFood, getHealthProfile } from '../lib/api.js'
import { getVerdict, statusToVerdictKey } from '../lib/verdict.js'
import { scanResetSignal } from '../lib/scanReset.js'

// ---------- ตั้งค่า Backend API ----------
// ใช้ scanFood() / getHealthProfile() จาก src/lib/api.js
// (client เดิมของโปรเจกต์ จัดการ device_id, JWT, error message ให้ครบอยู่แล้ว)

// mode: 'idle' -> 'camera' (กำลังเปิดกล้องอยู่) -> 'preview' (มีรูปพร้อมตรวจสอบ)
const mode = ref('idle')

const videoEl = ref(null)
const canvasEl = ref(null)
const galleryInput = ref(null)

const imageUrl = ref(null)   // URL สำหรับ <img> preview
const imageBlob = ref(null)  // ไฟล์รูปจริง เก็บไว้ส่งให้ backend ตอนกด "ตรวจสอบภาพ"

const isDragging = ref(false)
const cameraError = ref('')
const switching = ref(false)

const analyzing = ref(false)
const analyzeNote = ref('')
const result = ref(null)   // ผลลัพธ์ JSON แบบมีโครงสร้างจาก backend (analyze_food)
const resultBoxEl = ref(null)

// ข้อความสลับหมุนเวียนตอนหน้า "กำลังตรวจสอบ" (แค่ให้ดูมีความคืบหน้า ไม่ผูกกับ progress จริงจาก backend)
const analyzingMessages = [
  'กำลังอ่านฉลากโภชนาการ...',
  'กำลังตรวจสอบส่วนผสม...',
  'กำลังเทียบกับข้อมูลสุขภาพของคุณ...',
  'กำลังประเมินความปลอดภัย...',
]
const analyzingStep = ref(0)
let analyzingTimer = null

// การ์ดสรุปผล (hero) จะโชว์แค่สรุปก่อน ต้องกดปุ่ม "ดูรายละเอียด" ถึงจะขยายเห็นรายละเอียดเต็ม
const showDetails = ref(false)
const detailPanelEl = ref(null)

let mediaStream = null
let facingMode = 'environment' // เริ่มจากกล้องหลัง (สำหรับส่องฉลาก)

// ---------- เปิด/ปิดกล้อง ----------
async function openCamera() {
  cameraError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'เบราว์เซอร์นี้ไม่รองรับกล้อง ลองเลือกภาพจากคลังแทน'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    })
    mode.value = 'camera'
    // ต้องรอให้ <video> ถูก render ก่อน (v-if) ค่อยผูก stream
    await nextFrame()
    if (videoEl.value) videoEl.value.srcObject = mediaStream
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      cameraError.value = 'ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์'
    } else if (err.name === 'NotFoundError') {
      cameraError.value = 'ไม่พบกล้องบนอุปกรณ์นี้ ลองเลือกภาพจากคลังแทน'
    } else {
      cameraError.value = 'เปิดกล้องไม่ได้ ลองเลือกภาพจากคลังแทน'
    }
  }
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function stopStream() {
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
}

function closeCamera() {
  stopStream()
  mode.value = 'idle'
}

async function switchCamera() {
  if (switching.value) return
  switching.value = true
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  stopStream()
  await openCamera()
  switching.value = false
}

// ---------- ถ่ายภาพจากวิดีโอ ----------
function capturePhoto() {
  const video = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas || !video.videoWidth) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      setImage(blob)
      stopStream()
      mode.value = 'preview'
    },
    'image/jpeg',
    0.92
  )
}

// ---------- เลือกจากคลัง / ลากวาง ----------
function triggerGallery() {
  galleryInput.value?.click()
}

function onGalleryChange(e) {
  const file = e.target.files?.[0]
  if (file) setImage(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) setImage(file)
}

function setImage(blobOrFile) {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageBlob.value = blobOrFile
  imageUrl.value = URL.createObjectURL(blobOrFile)
  analyzeNote.value = ''
  mode.value = 'preview'
}

function retake() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  imageBlob.value = null
  analyzeNote.value = ''
  result.value = null
  showDetails.value = false
  if (galleryInput.value) galleryInput.value.value = ''
  mode.value = 'idle'
}

// ---------- ตรวจสอบภาพ: ส่งไป backend ผ่าน scanFood() (POST /analyze/scan) ----------
async function analyzeImage() {
  if (!imageBlob.value) return

  analyzing.value = true
  analyzeNote.value = ''
  result.value = null
  showDetails.value = false

  // เริ่มสลับข้อความบนหน้ากำลังตรวจสอบ ทุก 1.4 วิ วนไปเรื่อยๆ จนกว่าจะเสร็จ
  analyzingStep.value = 0
  analyzingTimer = setInterval(() => {
    analyzingStep.value = (analyzingStep.value + 1) % analyzingMessages.length
  }, 1400)

  try {
    // ดึงโปรไฟล์สุขภาพล่าสุดจาก backend ก่อนส่งตรวจสอบ
    // (ถ้ายังไม่เคยตั้งค่า/ยังไม่ login ก็ปล่อยเป็น {} ได้ — backend จัดการ fallback ให้)
    let healthProfile = {}
    try {
      healthProfile = (await getHealthProfile()) || {}
    } catch {
      healthProfile = {}
    }

    const { result: analysis } = await scanFood({
      imageBlob: imageBlob.value,
      healthProfile,
    })

    // analysis ควรมีโครงตาม RESPONSE_SCHEMA ใน gemini.py
    // เช่น { status, product_name, brand, ingredients, flagged_ingredients, summary, recommendation, disclaimer, ... }
    result.value = analysis
  } catch (err) {
    analyzeNote.value = err.message || 'เกิดข้อผิดพลาดในการตรวจสอบ'
  } finally {
    clearInterval(analyzingTimer)
    analyzingTimer = null
    analyzing.value = false
  }

  // ตรวจสอบเสร็จและสำเร็จ -> เลื่อนจอขึ้นไปบนสุดให้เห็นหน้าผลลัพธ์ทันที
  if (result.value) {
    await nextTick()
    resultBoxEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const verdict = computed(() => (result.value ? getVerdict(result.value.status) : null))

// ไอคอนใหญ่บนรูปสินค้า (safe / caution / danger) — อิงจาก status จริงที่ backend ส่งมา (SAFE/CAUTION/AVOID)
// โดยตรง ไม่เดาจากคำในข้อความ eyebrow อีกต่อไป (เดิมเดาผิดตอน eyebrow เป็น "FLAG" ซึ่งไม่ตรงกับ
// AVOID/DANGER ที่เช็คไว้ เลยได้ไอคอนสามเหลี่ยม caution ทั้งที่สถานะจริงคือ AVOID สีแดง)
const heroIcon = computed(() => {
  if (!result.value) return 'caution'
  const key = statusToVerdictKey(result.value.status)
  if (key === 'green') return 'safe'
  if (key === 'red') return 'danger'
  return 'caution'
})

// สลับเปิด/ปิด panel รายละเอียดเต็ม แล้วเลื่อนจอไปให้เห็นอัตโนมัติตอนเปิด
// เรียก toggleDetails(true) เพื่อ "บังคับเปิด" เสมอ (ใช้ตอนกดจาก tips card ที่ลิงก์มาที่ส่วนผสม)
async function toggleDetails(forceOpen = false) {
  showDetails.value = forceOpen ? true : !showDetails.value
  if (showDetails.value) {
    await nextTick()
    detailPanelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onBeforeUnmount(() => {
  stopStream()
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  if (analyzingTimer) clearInterval(analyzingTimer)
})

// ---------- รีเซ็ตกลับเป็นหน้าสแกนใหม่ ----------
// ถูกเรียกตอนกดปุ่ม "หน้าแรก" ในนาวบาร์ ทั้งที่อยู่หน้านี้อยู่แล้ว (route ไม่เปลี่ยน component เลย
// ไม่ re-mount เอง) ใช้ scanResetSignal จาก App.vue เป็นตัวบอกจังหวะ
watch(scanResetSignal, () => {
  stopStream()   // เผื่อกำลังเปิดกล้องค้างอยู่
  retake()       // เคลียร์ภาพ/ผลลัพธ์เดิม กลับไปโหมด 'idle'
})
</script>

<style scoped>
.scan-page { position: relative; z-index: 0; max-width: 520px; margin: 0 auto; padding: 28px 20px 20px; min-height: 100vh; }
.scan-page::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: 50%; width: 100vw;
  transform: translateX(-50%); z-index: -1;
  background: linear-gradient(135deg, #E7A459 0%, #70AF7A 50%, #70D3D4 100%);
}

/* --- เลย์เอาต์คอลัมน์เดียว จัดกึ่งกลาง: ตอนถ่าย/เลือกรูป โชว์แค่การ์ดถ่ายรูป
   พอตรวจสอบเสร็จ การ์ดถ่ายรูปหายไป โชว์แค่การ์ดผลลัพธ์แทน (ไม่แบ่ง 2 คอลัมน์อีกต่อไป) --- */
.layout-grid { display: block; }
.result-col { margin-top: 0; }
.result-placeholder { display: none; }

.rescan-link {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; color: var(--muted);
  background: none; border: none; padding: 0; margin-bottom: 14px; cursor: pointer;
}
.rescan-link svg { width: 15px; height: 15px; }
.rescan-link:hover { color: var(--ink); }

.back-link {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; color: #111; margin-bottom: 16px;
}
.back-link svg { width: 15px; height: 15px; }
.back-link:hover { color: var(--ink); }

.intro { margin-bottom: 20px; }
.eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: #111; letter-spacing: 0.08em;
}
.intro h1 {
  font-size: 26px; margin: 8px 0 6px; line-height: 1.3; color: #111;
}
.intro h1 em { font-style: normal; color: #111; }
.intro p {
  margin: 0; color: #111; font-size: 14px; line-height: 1.5;
}

.stage { position: relative; }
.stage-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  min-height: 360px;
}

/* --- idle / dropzone --- */
.dropzone {
  background: var(--bg);
  border: 1.5px dashed var(--line);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 40px 24px;
  transition: border-color 0.15s, background 0.15s;
}
.dropzone.drag { border-color: var(--green); background: #eef2e8; }
.idle-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--white); border: 1px solid var(--line);
  display: flex; align-items: center; justify-content: center;
  color: var(--green); margin-bottom: 6px;
}
.idle-icon svg { width: 26px; height: 26px; }
.hint { font-size: 12.5px; color: var(--muted); margin: 4px 0 0; }
.error-msg {
  font-size: 12.5px; color: var(--red); background: rgba(193, 80, 63, 0.08);
  padding: 8px 12px; border-radius: 10px; margin-top: 8px; text-align: center;
}
.hidden-input { display: none; }

/* --- camera live --- */
.camera-live { background: var(--dark); }
.camera-live video {
  width: 100%; height: 400px; object-fit: cover; display: block;
}
.corner.light { border-color: rgba(255, 255, 255, 0.85); }
.close-btn {
  position: absolute; top: 12px; right: 12px; width: 34px; height: 34px;
  border-radius: 50%; border: none; background: rgba(0, 0, 0, 0.45); color: #fff;
  font-size: 14px; cursor: pointer;
}
.camera-controls {
  position: absolute; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px 22px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}
.spacer { width: 42px; }
.switch-btn {
  width: 42px; height: 42px; border-radius: 50%; cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.5); background: rgba(255, 255, 255, 0.1);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.switch-btn svg { width: 18px; height: 18px; }
.switch-btn:disabled { opacity: 0.5; }
.shutter-btn {
  width: 66px; height: 66px; border-radius: 50%; border: 3px solid #fff;
  background: rgba(255, 255, 255, 0.15); cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
}
.shutter-ring { width: 52px; height: 52px; border-radius: 50%; background: #fff; }

/* --- preview --- */
.preview { background: var(--dark); }
.preview img { width: 100%; height: 400px; object-fit: contain; display: block; }
.preview-tag {
  position: absolute; top: 12px; left: 12px;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em;
  color: var(--orange); background: rgba(0, 0, 0, 0.4); padding: 4px 10px; border-radius: 999px;
}
.retake-btn {
  position: absolute; top: 12px; right: 12px;
  display: flex; align-items: center; gap: 6px;
  background: rgba(0, 0, 0, 0.5); color: #fff; border: none;
  padding: 8px 13px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer;
}
.retake-btn svg { width: 13px; height: 13px; }

/* --- buttons --- */
.btn-primary {
  background: var(--green); color: #fff; border: none; padding: 13px 28px;
  border-radius: 999px; font-weight: 700; font-size: 14.5px; cursor: pointer;
  box-shadow: 0 3px 0 var(--green-deep);
}
.btn-primary:hover { background: var(--green-deep); }
.btn-ghost {
  background: none; border: none; color: var(--green); font-weight: 600;
  font-size: 13.5px; cursor: pointer; padding: 4px;
}

.analyze-btn {
  width: 100%; margin-top: 16px; padding: 15px; border-radius: 999px; border: none;
  background: var(--orange); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
  box-shadow: 0 3px 0 var(--orange-deep); transition: opacity 0.15s;
}
.analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.analyze-note { text-align: center; font-size: 12.5px; color: var(--muted); margin-top: 10px; }
.analyze-note.error { color: var(--red); }

.result-box {
  --v-color: var(--green);
  position: relative;
  margin-top: 18px; padding: 22px 20px 18px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 0 var(--line);
}
.result-box .corner { border-color: color-mix(in srgb, var(--v-color) 55%, var(--line)); }

.result-identity { display: none; } /* แทนที่ด้วย .hero-block ด้านล่างแล้ว */

.result-text { margin: 0; font-size: 14px; line-height: 1.75; white-space: pre-wrap; color: var(--ink); }

/* ===== hero: การ์ดสรุปผลแบบเห็นชัด ===== */
.hero-block {
  display: flex; flex-direction: column; align-items: stretch; text-align: left;
  padding: 4px 0 18px; margin-bottom: 4px;
}

/* รูป + ชื่ออาหาร วางแนวนอน ให้ชื่ออาหารเด่นและอ่านง่ายกว่าเดิม */
.identity-row {
  display: flex; align-items: center; gap: 14px; width: 100%; margin-bottom: 16px;
}
.identity-copy { min-width: 0; }
.hero-product-name {
  margin: 0 0 2px; font-size: 19px; font-weight: 800; line-height: 1.3;
  color: var(--ink); overflow-wrap: break-word;
}
.hero-product-brand { margin: 0; font-size: 13px; font-weight: 600; color: var(--muted); }

.hero-photo-wrap { position: relative; width: 84px; height: 84px; margin-bottom: 0; flex: none; }
.hero-glow {
  position: absolute; inset: -16px;
  background: radial-gradient(circle, color-mix(in srgb, var(--v-color) 30%, transparent) 0%, transparent 70%);
  z-index: 0;
}
.hero-photo {
  position: relative; z-index: 1; width: 84px; height: 84px; border-radius: 50%;
  overflow: hidden; background: var(--bg);
  border: 3px solid var(--white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--v-color) 45%, white), 0 10px 24px -8px color-mix(in srgb, var(--v-color) 45%, transparent);
}
.hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-badge {
  position: absolute; z-index: 2; right: -3px; bottom: -3px;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--v-color); color: #fff;
  border: 2.5px solid var(--white);
}
.hero-badge svg { width: 13px; height: 13px; }

/* ป้ายผลสรุป — สิ่งแรกบนสุดของการ์ดผล มองปุ๊บรู้ทันทีว่ากินได้ไหม ไม่ใช่ปุ่มกด (ไม่มี hover/cursor) */
.verdict-banner.top-banner {
  display: flex; align-items: center; justify-content: flex-start; gap: 14px;
  width: 100%; padding: 18px 18px; margin: 0 0 18px;
  background: var(--v-color); border-radius: var(--radius-md);
  box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--v-color) 70%, transparent);
  animation: verdict-pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.3);
}
.verdict-banner-icon {
  flex: none; width: 30px; height: 30px; color: #fff;
  padding: 7px; box-sizing: content-box;
  background: rgba(255, 255, 255, 0.18); border-radius: 50%;
}
.verdict-banner-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.verdict-banner-eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; color: rgba(255, 255, 255, 0.8); text-transform: uppercase;
}
.verdict-banner-text { font-size: 20px; font-weight: 800; line-height: 1.25; color: #fff; }
@keyframes verdict-pop {
  0% { transform: scale(0.96); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* คำเตือนว่าผลมาจาก AI — แสดงตลอด ไม่ซ่อนไว้หลังปุ่ม "ดูรายละเอียด" */
.ai-disclaimer {
  display: flex; align-items: flex-start; gap: 8px;
  margin: 12px 0 0; padding: 10px 12px; border-radius: 10px;
  background: var(--bg); border: 1px dashed var(--line);
  font-size: 11.5px; line-height: 1.55; color: var(--muted); text-align: left;
}
.ai-disclaimer svg { flex: none; width: 14px; height: 14px; margin-top: 1px; color: var(--orange); }

.hero-summary-box {
  width: 100%; padding: 16px 18px 14px; border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--v-color) 10%, white);
  border: 1px solid color-mix(in srgb, var(--v-color) 22%, white);
}
.hero-summary-box .result-text {
  margin: 0 0 12px; padding: 0; border: none; text-align: left;
  color: var(--ink);
}
.details-toggle-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--white); border: 1px solid var(--line); color: var(--ink);
  font-size: 12.5px; font-weight: 700; padding: 8px 16px; border-radius: 999px; cursor: pointer;
}
.details-toggle-btn:hover { border-color: color-mix(in srgb, var(--v-color) 40%, var(--line)); }
.toggle-chevron { width: 13px; height: 13px; transition: transform 0.2s ease; }
.toggle-chevron.flipped { transform: rotate(180deg); }

/* ===== tips card: คำแนะนำด้านสุขภาพและโภชนาการ ===== */
.tips-card {
  margin-bottom: 4px; padding: 16px 18px; border-radius: var(--radius-md);
  background: var(--white); border: 1px solid var(--line);
}
.tips-label { text-align: center; margin-bottom: 12px; }
.tips-list { display: flex; flex-direction: column; gap: 8px; }
.tip-row {
  display: flex; align-items: flex-start; gap: 11px;
  padding: 11px 12px; border-radius: 12px;
  background: color-mix(in srgb, var(--v-color) 12%, white);
  border: none; width: 100%; text-align: left; font: inherit; cursor: default;
}
.tip-row-link { cursor: pointer; background: var(--bg); }
.tip-row-link:hover { background: color-mix(in srgb, var(--v-color) 8%, var(--bg)); }
.tip-icon {
  flex: none; width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--v-color); background: color-mix(in srgb, var(--v-color) 16%, white);
}
.tip-icon.warn { color: var(--orange); background: color-mix(in srgb, var(--orange) 16%, white); }
.tip-icon svg { width: 15px; height: 15px; }
.tip-row p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--ink); font-weight: 600; padding-top: 4px; }

/* ===== รายละเอียดฉบับเต็ม (ซ่อน/โชว์ได้) ===== */
.detail-panel { margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--line); }
.expand-enter-active, .expand-leave-active { transition: opacity 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; }

.section-label {
  display: block; font-family: var(--font-mono); font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.06em; color: var(--muted); margin-bottom: 8px;
}
.flagged-section { margin-bottom: 14px; }
.flagged-list { display: flex; flex-direction: column; gap: 7px; }
.flagged-item {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 10px 12px; border-radius: 10px;
  background: var(--bg); font-size: 13px;
}
.flagged-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; }
.flagged-item.sev-high .flagged-dot { background: var(--red); }
.flagged-item.sev-medium .flagged-dot { background: var(--orange); }
.flagged-item.sev-low .flagged-dot { background: var(--green); }
.flagged-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.flagged-name { font-weight: 700; color: var(--ink); }
.flagged-reason { color: var(--muted); font-size: 12.5px; line-height: 1.5; }


.result-disclaimer {
  margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line);
  font-size: 11.5px; color: var(--muted); line-height: 1.5;
}

.product-search-box {
  margin: 0 0 14px; padding: 14px 16px; border-radius: 12px;
  background: var(--bg); border: 1px solid var(--line);
}
.ps-header {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; color: var(--muted);
  margin-bottom: 10px; letter-spacing: 0.05em; text-transform: uppercase;
}
.ps-header svg { width: 13px; height: 13px; }
.ps-block { font-size: 12.5px; line-height: 1.65; color: var(--ink); margin-bottom: 7px; }
.ps-block b { display: block; font-weight: 700; color: var(--ink); margin-bottom: 1px; }
.ps-warning, .ps-warning b { color: var(--red); }
.ps-sources { font-size: 11px; color: var(--muted); margin: 8px 0 0; padding-top: 8px; border-top: 1px dashed var(--line); }
.ps-not-found { font-size: 12.5px; color: var(--muted); margin: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== หน้ากำลังตรวจสอบ (full-screen overlay, teleport ไปที่ body) ===== */
.analyzing-overlay {
  position: fixed; inset: 0; z-index: 999;
  display: flex; align-items: center; justify-content: center;
  padding: 24px; background: var(--dark);
}
.analyzing-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  width: 100%; max-width: 300px;
}
.analyzing-photo {
  position: relative; width: 172px; height: 172px; margin-bottom: 26px;
  border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.analyzing-photo img {
  width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.8);
}
.scan-line {
  position: absolute; left: 0; right: 0; top: 4%; height: 3px;
  background: linear-gradient(90deg, transparent, var(--green), transparent);
  box-shadow: 0 0 14px 2px color-mix(in srgb, var(--green) 70%, transparent);
  animation: scan-sweep 1.8s ease-in-out infinite;
}
@keyframes scan-sweep {
  0% { top: 4%; opacity: 0; }
  12% { opacity: 1; }
  50% { top: 92%; opacity: 1; }
  62% { opacity: 0; }
  100% { top: 4%; opacity: 0; }
}
.analyzing-spinner {
  width: 38px; height: 38px; margin-bottom: 18px; border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15); border-top-color: var(--green);
  animation: analyzing-spin 0.9s linear infinite;
}
@keyframes analyzing-spin { to { transform: rotate(360deg); } }
.analyzing-title { margin: 0 0 8px; font-size: 19px; font-weight: 800; color: #fff; }
.analyzing-step {
  min-height: 20px; margin: 0 0 22px; font-size: 13.5px; color: rgba(255, 255, 255, 0.65);
}
.analyzing-progress {
  width: 100%; height: 4px; border-radius: 999px; overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
}
.analyzing-progress span {
  display: block; width: 40%; height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--green), var(--orange));
  animation: analyzing-progress-slide 1.3s ease-in-out infinite;
}
@keyframes analyzing-progress-slide {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(260%); }
}
</style>