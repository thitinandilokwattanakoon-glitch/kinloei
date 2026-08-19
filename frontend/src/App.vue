<template>
  <div class="app-shell">
    <header class="topbar">
      <router-link to="/" class="brand">
        <span class="brand-leaf">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 3-7 7-7 11a7 7 0 0 0 14 0c0-4-3-8-7-11z"/></svg>
        </span>
        <span class="brand-text">
          <b>กินเลย</b>
          <em>GIN LOEI</em>
        </span>
      </router-link>

      <nav class="main-nav" v-if="loggedIn">
        <router-link to="/" class="nav-link" exact-active-class="active" @click="onHomeClick">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9"/></svg>
          <span>หน้าแรก</span>
        </router-link>
        <router-link to="/history" class="nav-link" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
          <span>ประวัติ</span>
        </router-link>
        <router-link to="/tips" class="nav-link" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>ความรู้</span>
        </router-link>
        <router-link to="/profile" class="nav-link" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c1.4-4 4.2-6 7-6s5.6 2 7 6"/></svg>
          <span>โปรไฟล์</span>
        </router-link>
      </nav>

      <div class="topbar-actions" v-if="loggedIn">
        <button class="icon-btn" aria-label="ออกจากระบบ" title="ออกจากระบบ" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLoggedIn, logoutUser } from './lib/api.js'
import { triggerScanReset } from './lib/scanReset.js'

const router = useRouter()
const route = useRoute()
const loggedIn = ref(isLoggedIn())

// เช็คสถานะล็อกอินใหม่ทุกครั้งที่เปลี่ยนหน้า (เช่น หลัง login/logout)
router.afterEach(() => {
  loggedIn.value = isLoggedIn()
})

// กดปุ่ม "หน้าแรก" ทั้งที่อยู่หน้าแรก (= หน้าสแกน) อยู่แล้ว -> route ไม่เปลี่ยน ไม่ re-mount
// ต้องยิงสัญญาณแยกไปบอก ScanView ให้เคลียร์ภาพ/ผลลัพธ์เก่า กลับไปเริ่มสแกนใหม่เอง
function onHomeClick() {
  if (route.path === '/') triggerScanReset()
}

function handleLogout() {
  logoutUser()
  loggedIn.value = false
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }

.topbar {
  display: flex; align-items: center; gap: 28px;
  padding: 14px 28px;
  background: var(--white);
  border-bottom: 1px solid var(--line);
  position: sticky; top: 0; z-index: 10;
  flex-wrap: wrap;
}

.brand { display: inline-flex; align-items: center; gap: 8px; margin-right: auto; }
.brand-leaf {
  width: 30px; height: 30px; color: var(--green);
  display: flex; align-items: center; justify-content: center;
}
.brand-leaf svg { width: 24px; height: 24px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-text b { font-size: 17px; color: var(--orange); }
.brand-text em {
  font-style: normal; font-family: var(--font-mono);
  font-size: 9px; letter-spacing: 0.1em; color: var(--muted);
}

.main-nav { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.nav-link {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 600; color: var(--muted);
  padding: 6px 2px; border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.nav-link svg { width: 17px; height: 17px; }
.nav-link.active { color: var(--orange); border-color: var(--orange); }
.nav-link:hover { color: var(--ink); }

.topbar-actions { display: flex; align-items: center; gap: 6px; }
.icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 50%;
  border: none; background: var(--bg); color: var(--ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.icon-btn svg { width: 17px; height: 17px; }
.icon-btn[aria-label="ออกจากระบบ"]:hover { background: var(--red); color: #fff; }

.app-main { flex: 1; }

@media (max-width: 720px) {
  .topbar { gap: 12px; padding: 12px 16px; }
  .main-nav { order: 3; width: 100%; justify-content: space-between; gap: 4px; }
  .nav-link span { display: none; }
}
</style>