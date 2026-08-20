import { createRouter, createWebHistory } from 'vue-router'
import ScanView from '../views/ScanView.vue'
import ProfileView from '../views/ProfileView.vue'
import TipsView from '../views/TipsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import { isLoggedIn } from '../lib/api.js'

// เส้นทางที่เข้าได้โดยไม่ต้องล็อกอิน (ต้องเป็นชุดนี้เท่านั้น — หน้าอื่นทั้งหมดบังคับล็อกอิน)
const PUBLIC_ROUTE_NAMES = new Set(['login', 'register', 'forgot-password'])

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // หน้าแรก = หน้าสแกนเลย (ไม่มี HomeView แยกแล้ว)
    { path: '/', name: 'home', component: ScanView, meta: { requiresAuth: true } },
    // เผื่อลิงก์/บุ๊กมาร์กเก่าที่ยังชี้ไป /scan — ส่งกลับไปหน้าแรกแทน
    { path: '/scan', redirect: '/' },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/tips', name: 'tips', component: TipsView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
  ],
})

// บังคับล็อกอินก่อนเข้าทุกหน้า ยกเว้นหน้า login/register/forgot-password
router.beforeEach((to) => {
  const isPublic = PUBLIC_ROUTE_NAMES.has(to.name)
  if (!isPublic && !isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // ถ้าล็อกอินอยู่แล้ว ไม่ต้องให้กลับไปหน้า login/register ได้อีก
  if (isPublic && to.name !== 'forgot-password' && isLoggedIn()) {
    return { name: 'home' }
  }
  return true
})

export default router