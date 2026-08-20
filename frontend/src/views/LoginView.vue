<template>
  <div class="auth-shell">
    <div class="bg-dots"></div>
    <div class="scan-line"></div>

    <header class="top-bar">
      <router-link to="/" class="brand-logo">
        <img src="../assets/logo-full.png" alt="Kinloei" class="logo-full-img" />
      </router-link>
    </header>

    <main class="auth-main">
      <div class="form-card">
        <span class="eyebrow-pill">
          <span class="pill-dot"></span>
          แอปพลิเคชันตรวจสอบความเสี่ยงของอาหารจากฉลากบนบรรจุภัณฑ์
        </span>


        <form @submit.prevent="handleLogin">
          <div class="field">
            <label>อีเมล</label>
            <input type="email" v-model="email" placeholder="you@example.com" required />
          </div>

          <div class="field">
            <label>รหัสผ่าน</label>
            <div class="password-row">
              <input :type="showPw ? 'text' : 'password'" v-model="password" placeholder="••••••••" required />
              <button type="button" class="eye-btn" @click="showPw = !showPw">
                <svg v-if="!showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 4.24A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-3.15 3.94M6.1 6.1C3.5 7.9 2 11 2 11s3.5 7 10 7c1.3 0 2.47-.28 3.5-.74" />
                </svg>
              </button>
            </div>
          </div>

          <div class="field-row">
            <label class="checkbox">
              <input type="checkbox" v-model="remember" />
              <span>จำฉันไว้</span>
            </label>
            <router-link to="/forgot-password" class="link-btn">ลืมรหัสผ่าน?</router-link>
          </div>

          <button class="cta-btn" type="submit" :disabled="loading">
            <span v-if="!loading">เข้าสู่ระบบ</span>
            <span v-else class="loading-dots">กำลังเข้าสู่ระบบ<i></i><i></i><i></i></span>
          </button>
        </form>

        <router-link to="/register" class="signup-link">ยังไม่มีบัญชี? สร้างโปรไฟล์ใหม่</router-link>

        <Transition name="fade">
          <div class="toast" :class="{ 'toast-error': toastIsError }" v-if="toast">{{ toast }}</div>
        </Transition>
      </div>
    </main>

    <footer class="bottom-bar">
      <div class="brand-badge">
        <div class="badge-dot"></div>
        <span>Power by GEMINI 3 FLASH</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginUser } from '../lib/api.js'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPw = ref(false)
const remember = ref(true)
const loading = ref(false)
const toast = ref('')
const toastIsError = ref(false)

async function handleLogin() {
  loading.value = true
  toast.value = ''
  toastIsError.value = false

  try {
    await loginUser({ email: email.value, password: password.value })
    toast.value = 'เข้าสู่ระบบสำเร็จ'
    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    setTimeout(() => router.push(redirectTo), 600)
  } catch (err) {
    toastIsError.value = true
    toast.value = err.message || 'เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--dark);
  color: #fff;
  overflow: hidden;
}

.bg-dots {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.5; z-index: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 22px 22px;
}
.scan-line {
  position: absolute; left: 0; right: 0; height: 1.5px; z-index: 0;
  background: linear-gradient(90deg, transparent, var(--green) 20%, #dcefe0 50%, var(--green) 80%, transparent);
  box-shadow: 0 0 20px 2px rgba(79, 146, 113, 0.45);
  animation: scan 4.4s ease-in-out infinite;
}
@keyframes scan {
  0% { top: 6%; opacity: 0.12; }
  50% { top: 94%; opacity: 0.7; }
  100% { top: 6%; opacity: 0.12; }
}

/* Top bar */
.top-bar {
  position: relative; z-index: 2;
  padding: 28px 40px 0;
}
.brand-logo { display: inline-flex; align-items: center; text-decoration: none; color: #fff; width: fit-content; }
.brand-logo .logo-full-img { height: 44px; width: auto; object-fit: contain; display: block; }

/* Center card */
.auth-main {
  position: relative; z-index: 2;
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 32px 20px;
}

.form-card {
  max-width: 420px; width: 100%;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  padding: 38px 34px 30px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
  position: relative;
}
.form-card::before {
  content: ''; position: absolute; top: 0; left: 22px; right: 22px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(79, 146, 113, 0.7), transparent);
}

.eyebrow-pill {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(79, 146, 113, 0.3); background: rgba(79, 146, 113, 0.1);
  color: #a8d9bb; font-family: 'IBM Plex Mono', monospace;
  font-weight: 600; font-size: 10.5px; letter-spacing: 0.03em; line-height: 1.5;
  padding: 7px 13px; border-radius: 999px; margin-bottom: 22px; max-width: 100%;
}
.eyebrow-pill .pill-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); flex-shrink: 0; }

.form-card h2 { font-size: 25px; font-weight: 700; color: #fff; margin: 0 0 6px; }
.form-sub { color: #9aa79c; font-size: 14px; margin: 0 0 26px; }

form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12.5px; font-weight: 600; color: #9aa79c; }
.field input {
  width: 100%; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 12px; padding: 12px 14px;
  font-size: 14px; font-family: inherit; color: #fff; background: rgba(255, 255, 255, 0.06);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input::placeholder { color: #6b756c; }
.field input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.25); }

.password-row { display: flex; align-items: center; gap: 8px; }
.password-row input { flex: 1; }
.eye-btn {
  flex-shrink: 0; width: 42px; height: 42px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06); color: #9aa79c; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.eye-btn svg { width: 17px; height: 17px; }
.eye-btn:hover { color: #fff; border-color: var(--green); }

.field-row { display: flex; align-items: center; justify-content: space-between; }
.checkbox { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #9aa79c; cursor: pointer; }
.checkbox input { accent-color: var(--green); width: 15px; height: 15px; }
.link-btn { font-size: 13px; color: var(--green); font-weight: 600; text-decoration: none; }
.link-btn:hover { text-decoration: underline; }

.cta-btn {
  width: 100%; padding: 14px; border-radius: 999px; border: none; font-weight: 700; font-size: 15px;
  background: var(--green); color: #fff; cursor: pointer; margin-top: 4px;
  box-shadow: 0 3px 0 var(--green-deep); transition: transform 0.15s, box-shadow 0.15s;
}
.cta-btn:hover:not(:disabled) { background: var(--green-deep); transform: translateY(-1px); }
.cta-btn:disabled { opacity: 0.75; cursor: not-allowed; }

.signup-link {
  display: block; text-align: center; margin-top: 18px;
  font-size: 13px; color: #9aa79c; text-decoration: none;
}
.signup-link:hover { color: #fff; text-decoration: underline; }

.loading-dots i { width: 4px; height: 4px; background: #fff; border-radius: 50%; display: inline-block; margin-left: 3px; animation: blink-dot 1.2s infinite; }
.loading-dots i:nth-child(2) { animation-delay: 0.2s; }
.loading-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink-dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: #fff; color: var(--dark); font-size: 13px; font-weight: 600;
  padding: 10px 20px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35); z-index: 40;
}
.toast.toast-error { background: var(--red); color: #fff; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Bottom bar */
.bottom-bar {
  position: relative; z-index: 2;
  display: flex; justify-content: center;
  padding: 0 20px 26px;
}
.brand-badge {
  display: inline-flex; align-items: center; gap: 8px; width: fit-content;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: #9aa79c;
  border: 1px solid rgba(255, 255, 255, 0.14); padding: 8px 14px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.3); animation: pulse-dot 1.4s ease-in-out infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

@media (max-width: 480px) {
  .top-bar { padding: 22px 20px 0; }
  .form-card { padding: 30px 22px 24px; border-radius: 18px; }
}
</style>  