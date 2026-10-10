<template>
  <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
    <div class="order-2 rounded-[2rem] bg-gradient-to-br from-orange-50 via-white to-sky-100 p-8 shadow-sm md:order-1">
      <p class="text-sm font-bold text-orange-500">เริ่มเรียนได้ทันที</p>
      <h1 class="mt-2 text-4xl font-extrabold leading-tight text-slate-900">
        สมัครสมาชิก<br>
        <span class="text-blue-600">ฟรี ไม่ยุ่งยาก</span>
      </h1>
      <p class="mt-4 max-w-md text-slate-600">
        สร้างบัญชีนักเรียนเพื่อเข้าห้องเรียน ดูคอร์ส และสั่งซื้อหนังสือ
      </p>
      <ul class="mt-8 space-y-3">
        <li v-for="item in perks" :key="item" class="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-white">
          <span class="text-lg" aria-hidden="true">✓</span>
          {{ item }}
        </li>
      </ul>
    </div>

    <form class="order-1 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-blue-50 md:order-2 md:p-8" @submit.prevent="handleSubmit">
      <h2 class="text-2xl font-extrabold text-slate-900">สร้างบัญชี</h2>
      <p class="mt-1 text-sm text-slate-500">กรอกข้อมูลแล้วเข้าห้องเรียนได้เลย</p>

      <label class="mt-6 block text-sm font-semibold text-slate-700">
        ชื่อ-นามสกุล
        <input
          v-model="name"
          type="text"
          required
          maxlength="150"
          autocomplete="name"
          class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
      </label>

      <label class="mt-4 block text-sm font-semibold text-slate-700">
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
        เบอร์โทร
        <input
          v-model="phone"
          type="tel"
          maxlength="30"
          autocomplete="tel"
          placeholder="ไม่บังคับ"
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
            minlength="8"
            autocomplete="new-password"
            class="w-full rounded-2xl border border-slate-200 px-4 py-3 pe-16 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
          <button type="button" class="absolute inset-y-0 end-3 text-xs font-bold text-blue-700" @click="showPassword = !showPassword">
            {{ showPassword ? 'ซ่อน' : 'แสดง' }}
          </button>
        </span>
        <span class="mt-1 block text-xs font-normal text-slate-400">อย่างน้อย 8 ตัวอักษร</span>
      </label>

      <p v-if="errorMessage" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</p>

      <button
        type="submit"
        class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        :disabled="pending"
      >
        <LearnIcon name="signup" class="h-4 w-4" />
        {{ pending ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
      </button>

      <p class="mt-5 text-center text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?
        <NuxtLink :to="{ path: '/signin', query: route.query }" class="font-bold text-blue-700 hover:text-blue-800">เข้าสู่ระบบ</NuxtLink>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'สมัครสมาชิก | ClickClass Tutor' })

const route = useRoute()
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const pending = ref(false)

const perks = [
  'สมัครแล้วเข้าสู่ระบบให้อัตโนมัติ',
  'สั่งซื้อหนังสือและติดตามคำสั่งซื้อ',
  'เก็บรางวัลจากการเรียน',
]

function nextPath() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
  return '/home'
}

async function handleSubmit() {
  errorMessage.value = ''
  pending.value = true
  try {
    const { register } = useAuth()
    const result = await register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      phone: phone.value.trim() || undefined,
    })
    await navigateTo(result.loggedIn ? nextPath() : { path: '/verify-email', query: { email: result.email } })
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'สมัครสมาชิกไม่สำเร็จ')
  }
  finally {
    pending.value = false
  }
}
</script>
