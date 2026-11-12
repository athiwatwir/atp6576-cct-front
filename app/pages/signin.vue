<template>
  <section class="relative isolate mx-auto grid overflow-x-clip max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
    <span class="si-blob pointer-events-none absolute -start-10 top-6 -z-10 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" aria-hidden="true" />
    <span class="si-blob si-blob-late pointer-events-none absolute -end-10 bottom-4 -z-10 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" aria-hidden="true" />

    <div class="si-enter-left relative order-2 overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-blue-100 p-8 shadow-sm md:order-1">
      <p class="si-rise inline-flex items-center gap-1.5 text-sm font-bold text-blue-600" style="--d: 0.15s">
        <span class="si-wave inline-block" aria-hidden="true">👋</span>
        ยินดีต้อนรับกลับมา
      </p>
      <h1 class="si-rise mt-2 text-4xl font-extrabold leading-tight text-slate-900" style="--d: 0.25s">
        เข้าสู่ระบบ<br>
        <span class="si-shimmer bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 bg-clip-text text-transparent">แล้วเรียนต่อได้เลย</span>
      </h1>
      <p class="si-rise mt-4 max-w-md text-slate-600" style="--d: 0.35s">
        คอร์ส หนังสือ และรางวัลที่สะสมไว้ รออยู่ในห้องเรียนหลังเข้าสู่ระบบ
      </p>
      <div class="si-rise relative mt-6" style="--d: 0.45s">
        <img src="/images/cover/cover-05.webp" alt="นักเรียนเรียนออนไลน์อย่างสนุกกับ ClickClass Tutor"
          width="1024" height="576" loading="eager" decoding="async"
          class="si-float aspect-video w-full rounded-3xl object-cover shadow-lg shadow-sky-200/60 ring-4 ring-white">
        <span v-for="spark in SPARKLES" :key="spark.icon + spark.style" class="si-sparkle pointer-events-none absolute text-xl drop-shadow" :style="spark.style" aria-hidden="true">{{ spark.icon }}</span>
      </div>
    </div>

    <form class="si-enter-right order-1 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-blue-50 md:order-2 md:p-8"
      @submit.prevent="handleSubmit">
      <h2 class="si-rise text-2xl font-extrabold text-slate-900" style="--d: 0.2s">เข้าสู่ระบบ</h2>
      <p class="si-rise mt-1 text-sm text-slate-500" style="--d: 0.28s">ใช้อีเมลหรือเบอร์โทร กับรหัสผ่านที่สมัครไว้</p>

      <label class="si-rise mt-6 block text-sm font-semibold text-slate-700" style="--d: 0.36s">
        อีเมลหรือเบอร์โทร
        <span class="relative mt-1 block">
          <LearnIcon :name="looksLikePhone ? 'phone' : 'mail'"
            class="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors"
            :class="looksLikePhone ? 'text-emerald-500' : 'text-sky-500'" />
          <input v-model="identifier" type="text" required autocomplete="username" autocapitalize="none"
            spellcheck="false" placeholder="name@example.com หรือ 081-234-5678"
            class="w-full rounded-2xl border border-slate-200 py-3 pe-4 ps-12 font-normal outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
        </span>
      </label>

      <label class="si-rise mt-4 block text-sm font-semibold text-slate-700" style="--d: 0.44s">
        <span class="flex items-center justify-between gap-2">
          รหัสผ่าน
          <NuxtLink :to="{ path: '/forgot-password', query: identifier.trim() ? { login: identifier.trim() } : {} }"
            class="text-xs font-bold text-violet-700 hover:underline">ลืมรหัสผ่าน?</NuxtLink>
        </span>
        <span class="relative mt-1 block">
          <input v-model="password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password"
            class="w-full rounded-2xl border border-slate-200 px-4 py-3 pe-16 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          <button type="button" class="absolute inset-y-0 end-3 text-xs font-bold text-blue-700"
            @click="showPassword = !showPassword">
            {{ showPassword ? 'ซ่อน' : 'แสดง' }}
          </button>
        </span>
      </label>

      <p v-if="errorMessage" :key="errorCount" class="si-shake mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
        <NuxtLink v-if="needsVerify" :to="{ path: '/verify-email', query: isEmail ? { email: identifier.trim() } : {} }"
          class="mt-1 block font-bold text-rose-800 underline">ส่งลิงก์ยืนยันอีกครั้ง</NuxtLink>
      </p>

      <div class="si-rise mt-6" style="--d: 0.52s">
        <button type="submit"
          class="si-cta group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          :disabled="pending">
          <span class="si-cta-shine pointer-events-none absolute inset-y-0 -start-1/3 w-1/3" aria-hidden="true" />
          <span v-if="pending" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          <LearnIcon v-else name="login" class="h-4 w-4 transition group-hover:translate-x-0.5" />
          {{ pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
      </div>

      <p class="si-rise mt-5 text-center text-sm text-slate-500" style="--d: 0.6s">
        ยังไม่มีบัญชี?
        <NuxtLink :to="{ path: '/signup', query: route.query }" class="font-bold text-blue-700 hover:text-blue-800">
          สมัครสมาชิก</NuxtLink>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'เข้าสู่ระบบ | ClickClass Tutor' })

const route = useRoute()
const identifier = ref(typeof route.query.login === 'string' ? route.query.login : '')
const password = ref('')
const isEmail = computed(() => identifier.value.includes('@'))
/** ยังไม่มี @ และขึ้นต้นด้วยตัวเลขหรือ + ถือว่ากำลังพิมพ์เบอร์โทร */
const looksLikePhone = computed(() => !isEmail.value && /^\s*[+\d]/.test(identifier.value))
const showPassword = ref(false)
const errorMessage = ref('')
const needsVerify = ref(false)
const pending = ref(false)

/** เปลี่ยน key ของกล่อง error ให้สั่นใหม่ทุกครั้งที่เข้าไม่สำเร็จ */
const errorCount = ref(0)

const SPARKLES = [
  { icon: '✨', style: 'top: -10px; inset-inline-start: 8%; --sd: 0s' },
  { icon: '⭐', style: 'top: 12%; inset-inline-end: -8px; --sd: 0.8s' },
  { icon: '🎓', style: 'bottom: -12px; inset-inline-start: 18%; --sd: 1.4s' },
  { icon: '✨', style: 'bottom: 18%; inset-inline-end: 6%; --sd: 2s' },
]

function nextPath() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
  return '/home'
}

async function handleSubmit() {
  errorMessage.value = ''
  needsVerify.value = false
  pending.value = true
  try {
    const { login, user, verifyNotice } = useAuth()
    await login(identifier.value, password.value)
    if (user.value?.email_verified === false) {
      verifyNotice.value = 'กรุณายืนยันอีเมลจากลิงก์ที่เราส่งให้'
    }
    await navigateTo(nextPath())
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'อีเมล เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง')
    errorCount.value += 1
    needsVerify.value = apiStatus(error) === 403 && errorMessage.value.includes('ยืนยัน')
  }
  finally {
    pending.value = false
  }
}
</script>

<style scoped>
.si-enter-left {
  animation: si-in-left 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.si-enter-right {
  animation: si-in-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

.si-rise {
  animation: si-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0s) both;
}

.si-wave {
  transform-origin: 70% 70%;
  animation: si-wave 2.4s ease-in-out 0.8s infinite;
}

.si-shimmer {
  background-size: 200% auto;
  animation: si-shimmer 3.5s linear infinite;
}

.si-float {
  animation: si-float 5s ease-in-out 1.2s infinite;
}

.si-sparkle {
  animation: si-twinkle 2.6s ease-in-out var(--sd, 0s) infinite;
}

.si-blob {
  animation: si-blob 9s ease-in-out infinite;
}

.si-blob-late {
  animation-delay: -4.5s;
}

.si-cta {
  animation: si-glow 2.6s ease-in-out 1.2s infinite;
}

.si-cta:disabled {
  animation: none;
}

.si-cta-shine {
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 0.55), transparent);
  transform: skewX(-20deg);
  animation: si-shine 3.2s ease-in-out 1.5s infinite;
}

.si-shake {
  animation: si-shake 0.45s ease both;
}

@keyframes si-in-left {
  from { opacity: 0; transform: translateX(-40px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

@keyframes si-in-right {
  from { opacity: 0; transform: translateX(40px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

@keyframes si-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

@keyframes si-wave {
  0%, 60%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(18deg); }
  20%, 40% { transform: rotate(-10deg); }
}

@keyframes si-shimmer {
  to { background-position: 200% center; }
}

@keyframes si-float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-8px) rotate(-0.6deg); }
}

@keyframes si-twinkle {
  0%, 100% { opacity: 0.35; transform: scale(0.8) rotate(0); }
  50% { opacity: 1; transform: scale(1.15) rotate(12deg); }
}

@keyframes si-blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(24px, -18px) scale(1.12); }
}

@keyframes si-glow {
  0%, 100% { box-shadow: 0 4px 14px rgb(249 115 22 / 0.25); }
  50% { box-shadow: 0 6px 24px rgb(244 63 94 / 0.45); }
}

@keyframes si-shine {
  0% { inset-inline-start: -33%; }
  40%, 100% { inset-inline-start: 120%; }
}

@keyframes si-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(7px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(3px); }
}

@media (prefers-reduced-motion: reduce) {
  .si-enter-left,
  .si-enter-right,
  .si-rise,
  .si-wave,
  .si-shimmer,
  .si-float,
  .si-sparkle,
  .si-blob,
  .si-cta,
  .si-cta-shine,
  .si-shake {
    animation: none;
  }

  .si-cta-shine,
  .si-sparkle {
    display: none;
  }
}
</style>
