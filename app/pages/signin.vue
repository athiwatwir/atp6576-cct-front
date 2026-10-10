<template>
  <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
    <div class="order-2 rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-blue-100 p-8 shadow-sm md:order-1">
      <p class="text-sm font-bold text-blue-600">ยินดีต้อนรับกลับมา</p>
      <h1 class="mt-2 text-4xl font-extrabold leading-tight text-slate-900">
        เข้าสู่ระบบ<br>
        <span class="text-blue-600">แล้วเรียนต่อได้เลย</span>
      </h1>
      <p class="mt-4 max-w-md text-slate-600">
        คอร์ส หนังสือ และรางวัลที่สะสมไว้ รออยู่ในห้องเรียนหลังเข้าสู่ระบบ
      </p>
      <div class="mt-8 grid grid-cols-3 gap-3 text-center">
        <div v-for="item in highlights" :key="item.label" class="rounded-3xl bg-white/80 p-4 ring-1 ring-white">
          <span class="text-3xl" aria-hidden="true">{{ item.emoji }}</span>
          <span class="mt-2 block text-sm font-bold text-slate-700">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <form class="order-1 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-blue-50 md:order-2 md:p-8" @submit.prevent="handleSubmit">
      <h2 class="text-2xl font-extrabold text-slate-900">เข้าสู่ระบบ</h2>
      <p class="mt-1 text-sm text-slate-500">ใช้อีเมลและรหัสผ่านที่สมัครไว้</p>

      <label class="mt-6 block text-sm font-semibold text-slate-700">
        อีเมล
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
      </label>

      <label class="mt-4 block text-sm font-semibold text-slate-700">
        รหัสผ่าน
        <span class="relative mt-1 block">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            class="w-full rounded-2xl border border-slate-200 px-4 py-3 pe-16 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
          <button type="button" class="absolute inset-y-0 end-3 text-xs font-bold text-blue-700" @click="showPassword = !showPassword">
            {{ showPassword ? 'ซ่อน' : 'แสดง' }}
          </button>
        </span>
      </label>

      <p v-if="errorMessage" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
        <NuxtLink v-if="needsVerify" :to="{ path: '/verify-email', query: { email: email.trim() } }" class="mt-1 block font-bold text-rose-800 underline">ส่งลิงก์ยืนยันอีกครั้ง</NuxtLink>
      </p>

      <button
        type="submit"
        class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        :disabled="pending"
      >
        <LearnIcon name="login" class="h-4 w-4" />
        {{ pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>

      <p class="mt-5 text-center text-sm text-slate-500">
        ยังไม่มีบัญชี?
        <NuxtLink :to="{ path: '/signup', query: route.query }" class="font-bold text-blue-700 hover:text-blue-800">สมัครสมาชิก</NuxtLink>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'เข้าสู่ระบบ | ClickClass Tutor' })

const route = useRoute()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const needsVerify = ref(false)
const pending = ref(false)

const highlights = [
  { label: 'คอร์สเรียน', emoji: '📘' },
  { label: 'หนังสือ', emoji: '📚' },
  { label: 'รางวัล', emoji: '🎁' },
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
    await login(email.value, password.value)
    if (user.value?.email_verified === false) {
      verifyNotice.value = 'กรุณายืนยันอีเมลจากลิงก์ที่เราส่งให้'
    }
    await navigateTo(nextPath())
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    needsVerify.value = apiStatus(error) === 403 && errorMessage.value.includes('ยืนยัน')
  }
  finally {
    pending.value = false
  }
}
</script>
