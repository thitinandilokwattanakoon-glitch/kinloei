<template>
  <div class="profile-page">
    <div class="intro">
      <span class="eyebrow">HEALTH PROFILE</span>
      <h1>โปรไฟล์สุขภาพของคุณ</h1>
      <p>ข้อมูลนี้จะถูกใช้ทุกครั้งที่ตรวจสอบฉลาก เพื่อเช็คว่าเหมาะกับคุณไหม</p>
    </div>

    <div v-if="loading" class="state-box">กำลังโหลดโปรไฟล์...</div>

    <template v-else>
      <!-- ข้อมูลบัญชี -->
      <section class="field-group account-group">
        <label>ข้อมูลบัญชี</label>

        <div class="account-row">
          <span class="account-label">อีเมล</span>
          <span class="account-value">{{ account.email || '—' }}</span>
        </div>

        <form class="account-form" @submit.prevent="saveDisplayName">
          <span class="account-label">ชื่อที่แสดง</span>
          <div class="account-inline">
            <input v-model="displayNameInput" type="text" placeholder="ชื่อของคุณ" />
            <button type="submit" class="btn-ghost-add" :disabled="savingName">
              {{ savingName ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
        </form>

        <button type="button" class="link-toggle" @click="showPwForm = !showPwForm">
          {{ showPwForm ? 'ยกเลิกเปลี่ยนรหัสผ่าน' : 'เปลี่ยนรหัสผ่าน' }}
        </button>

        <form v-if="showPwForm" class="account-form pw-form" @submit.prevent="savePassword">
          <input v-model="currentPassword" type="password" placeholder="รหัสผ่านปัจจุบัน" autocomplete="current-password" />
          <input v-model="newPassword" type="password" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)" autocomplete="new-password" />
          <button type="submit" class="save-btn pw-submit" :disabled="savingPw">
            {{ savingPw ? 'กำลังเปลี่ยน...' : 'ยืนยันเปลี่ยนรหัสผ่าน' }}
          </button>
        </form>
      </section>

      <form class="profile-form" @submit.prevent="save">
        <!-- โรคประจำตัว -->
      <section class="field-group">
        <label>โรคประจำตัว</label>
        <div class="tag-input">
          <span v-for="(item, i) in conditions" :key="item" class="chip">
            {{ item }}
            <button type="button" class="chip-x" @click="conditions.splice(i, 1)">✕</button>
          </span>
          <input
            v-model="conditionInput"
            type="text"
            placeholder="พิมพ์แล้วกด Enter เช่น เบาหวาน"
            @keydown.enter.prevent="addTag(conditions, 'conditionInput')"
          />
          <button type="button" class="btn-ghost-add" @click="addTag(conditions, 'conditionInput')">+ เพิ่ม</button>
        </div>
      </section>

      <!-- อาหารที่แพ้ -->
      <section class="field-group">
        <label>อาหารที่แพ้</label>
        <div class="tag-input">
          <span v-for="(item, i) in allergies" :key="item" class="chip">
            {{ item }}
            <button type="button" class="chip-x" @click="allergies.splice(i, 1)">✕</button>
          </span>
          <input
            v-model="allergyInput"
            type="text"
            placeholder="พิมพ์แล้วกด Enter เช่น กุ้ง, ถั่วลิสง"
            @keydown.enter.prevent="addTag(allergies, 'allergyInput')"
          />
          <button type="button" class="btn-ghost-add" @click="addTag(allergies, 'allergyInput')">+ เพิ่ม</button>
        </div>
      </section>

      <!-- ส่วนผสมที่ต้องเลี่ยง -->
      <section class="field-group">
        <label>ส่วนผสมที่ต้องเลี่ยงเป็นพิเศษ</label>
        <div class="tag-input">
          <span v-for="(item, i) in avoidIngredients" :key="item" class="chip">
            {{ item }}
            <button type="button" class="chip-x" @click="avoidIngredients.splice(i, 1)">✕</button>
          </span>
          <input
            v-model="avoidInput"
            type="text"
            placeholder="พิมพ์แล้วกด Enter เช่น ผงชูรส, สีผสมอาหาร"
            @keydown.enter.prevent="addTag(avoidIngredients, 'avoidInput')"
          />
          <button type="button" class="btn-ghost-add" @click="addTag(avoidIngredients, 'avoidInput')">+ เพิ่ม</button>
        </div>
      </section>

      <!-- หมายเหตุ -->
      <section class="field-group">
        <label>หมายเหตุเพิ่มเติม</label>
        <textarea v-model="notes" rows="3" placeholder="เช่น แพ้กุ้งรุนแรงมาก ระวังเป็นพิเศษ"></textarea>
      </section>

      <button class="save-btn" type="submit" :disabled="saving">
        <span v-if="!saving">บันทึกโปรไฟล์</span>
        <span v-else>กำลังบันทึก...</span>
      </button>
      </form>
    </template>

    <Transition name="fade">
      <div class="toast" :class="{ 'toast-error': toastIsError }" v-if="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getHealthProfile,
  updateHealthProfile,
  getMe,
  updateDisplayName,
  changePassword,
  logoutUser,
} from '../lib/api.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const toast = ref('')
const toastIsError = ref(false)

// ── ข้อมูลบัญชี ──────────────────────────────────────────────────────────────
const account = ref({ email: '', display_name: '' })
const displayNameInput = ref('')
const savingName = ref(false)

const showPwForm = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const savingPw = ref(false)

function flashToast(message, isError = false) {
  toastIsError.value = isError
  toast.value = message
  setTimeout(() => (toast.value = ''), 3000)
}

async function loadAccount() {
  try {
    const me = await getMe()
    account.value = me
    displayNameInput.value = me.display_name || ''
  } catch (err) {
    // ถ้า token หมดอายุระหว่างอยู่หน้านี้ ให้เด้งกลับไปล็อกอินใหม่
    if (String(err.message || '').includes('เข้าสู่ระบบ')) {
      logoutUser()
      router.push({ name: 'login' })
    }
  }
}

async function saveDisplayName() {
  const name = displayNameInput.value.trim()
  if (!name) {
    flashToast('กรุณาระบุชื่อ', true)
    return
  }
  savingName.value = true
  try {
    await updateDisplayName(name)
    account.value.display_name = name
    flashToast('บันทึกชื่อเรียบร้อยแล้ว')
  } catch (err) {
    flashToast(err.message || 'บันทึกชื่อไม่สำเร็จ', true)
  } finally {
    savingName.value = false
  }
}

async function savePassword() {
  if (!currentPassword.value || !newPassword.value) {
    flashToast('กรุณากรอกรหัสผ่านให้ครบ', true)
    return
  }
  if (newPassword.value.length < 8) {
    flashToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร', true)
    return
  }
  savingPw.value = true
  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    currentPassword.value = ''
    newPassword.value = ''
    showPwForm.value = false
    flashToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
  } catch (err) {
    flashToast(err.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', true)
  } finally {
    savingPw.value = false
  }
}

const conditions = ref([])
const allergies = ref([])
const avoidIngredients = ref([])
const notes = ref('')

const conditionInput = ref('')
const allergyInput = ref('')
const avoidInput = ref('')

// map ของ ref แต่ละอัน เพื่อให้ addTag เคลียร์ input ที่ถูกต้องได้
const inputRefs = { conditionInput, allergyInput, avoidInput }

function addTag(list, inputKey) {
  const inputRef = inputRefs[inputKey]
  const value = inputRef.value.trim()
  if (value && !list.includes(value)) list.push(value)
  inputRef.value = ''
}

async function loadProfile() {
  loading.value = true
  try {
    const profile = (await getHealthProfile()) || {}
    conditions.value = profile.conditions || []
    allergies.value = profile.allergies || []
    avoidIngredients.value = profile.avoid_ingredients || []
    notes.value = profile.notes || ''
  } catch (err) {
    toastIsError.value = true
    toast.value = err.message || 'โหลดโปรไฟล์ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  toast.value = ''
  toastIsError.value = false
  try {
    await updateHealthProfile({
      conditions: conditions.value,
      allergies: allergies.value,
      avoid_ingredients: avoidIngredients.value,
      notes: notes.value,
      nutrient_limits: [], // เอาฟีเจอร์นี้ออกจาก UI แล้ว ส่ง [] ไว้เผื่อ backend schema ยังคาด field นี้อยู่
    })
    toast.value = 'บันทึกโปรไฟล์เรียบร้อยแล้ว'
  } catch (err) {
    toastIsError.value = true
    toast.value = err.message || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'
  } finally {
    saving.value = false
    setTimeout(() => (toast.value = ''), 3000)
  }
}

onMounted(() => {
  loadAccount()
  loadProfile()
})
</script>

<style scoped>
.profile-page { max-width: 560px; margin: 0 auto; padding: 28px 20px 80px; }

.intro { margin-bottom: 22px; }
.eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: var(--green); letter-spacing: 0.08em;
}
.intro h1 { font-size: 24px; margin: 8px 0 6px; }
.intro p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }

.state-box {
  text-align: center; padding: 40px 20px; color: var(--muted); font-size: 14px;
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius-lg);
}

.profile-form { display: flex; flex-direction: column; gap: 20px; }
.field-group {
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 16px 18px;
}
.field-group > label { display: block; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }

.tag-input {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  border: 1px solid var(--line); border-radius: 12px; padding: 8px 10px; background: var(--paper);
}
.tag-input input {
  flex: 1; min-width: 140px; border: none; outline: none; background: none;
  font-size: 13.5px; font-family: inherit; color: var(--ink); padding: 4px 2px;
}
.chip {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600;
  padding: 5px 8px 5px 12px; border-radius: 999px; background: var(--green-tint); color: var(--green-deep);
}
.chip-x {
  border: none; background: none; cursor: pointer; color: inherit; opacity: 0.6;
  font-size: 11px; padding: 2px; line-height: 1;
}
.chip-x:hover { opacity: 1; }

.tag-input .btn-ghost-add { flex-shrink: 0; white-space: nowrap; }

textarea {
  width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px;
  font-size: 13.5px; font-family: inherit; color: var(--ink); background: var(--paper); resize: vertical;
}
textarea:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.15); }

.btn-ghost-add {
  border: 1px dashed var(--green); background: none; color: var(--green-deep);
  border-radius: 10px; padding: 8px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer;
}
.btn-ghost-add:hover { background: var(--green-tint); }

.save-btn {
  width: 100%; padding: 15px; border-radius: 999px; border: none;
  background: var(--green); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
  box-shadow: 0 3px 0 var(--green-deep);
}
.save-btn:hover:not(:disabled) { background: var(--green-deep); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.account-group { margin-bottom: 20px; }
.account-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 13.5px; }
.account-label { color: var(--muted); font-size: 12.5px; }
.account-value { font-weight: 600; }
.account-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.account-inline { display: flex; gap: 8px; }
.account-inline input {
  flex: 1; border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px;
  font-size: 13px; font-family: inherit; background: var(--paper); color: var(--ink);
}
.pw-form input {
  border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px;
  font-size: 13px; font-family: inherit; background: var(--paper); color: var(--ink);
}
.pw-submit { padding: 10px; font-size: 13.5px; box-shadow: none; }
.link-toggle {
  border: none; background: none; color: var(--green-deep); font-size: 12.5px; font-weight: 700;
  cursor: pointer; padding: 4px 0; text-decoration: underline;
}

.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: var(--dark); color: #fff; font-size: 13px; font-weight: 600;
  padding: 10px 20px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25); z-index: 40;
}
.toast.toast-error { background: var(--red); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>