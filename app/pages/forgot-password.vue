<template>
  <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
    <div class="order-2 rounded-[2rem] bg-gradient-to-br from-violet-100 via-white to-sky-100 p-8 shadow-sm md:order-1">
      <p class="text-sm font-bold text-violet-600">ไม่ต้องกังวล</p>
      <h1 class="mt-2 text-4xl font-extrabold leading-tight text-slate-900">
        ลืมรหัสผ่าน?<br>
        <span class="text-violet-600">ตั้งใหม่ได้ใน 3 ขั้นตอน</span>
      </h1>
      <ol class="mt-8 space-y-3">
        <li v-for="(step, index) in steps" :key="step" class="flex items-center gap-3 rounded-3xl bg-white/80 p-4 ring-1 ring-white">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-extrabold text-white">{{ index + 1 }}</span>
          <span class="text-sm font-bold text-slate-700">{{ step }}</span>
        </li>
      </ol>
    </div>

    <div class="order-1 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-violet-50 md:order-2 md:p-8">
      <template v-if="sent">
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <LearnIcon name="mail" class="h-7 w-7" />
        </span>
        <h2 class="mt-4 text-2xl font-extrabold text-slate-900">ตรวจอีเมลของคุณ</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ sentMessage }}</p>
        <ul class="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
          <li>• ไม่เจออีเมล ลองดูในกล่องจดหมายขยะ (Spam / Junk)</li>
          <li>• บัญชีที่สมัครด้วยเบอร์โทรอย่างเดียว รับลิงก์ทางอีเมลไม่ได้ ติดต่อทีมงานทาง LINE <a :href="contactInfo.lineUrl" target="_blank" rel="noopener" class="font-bold text-emerald-600 hover:underline">{{ contactInfo.lineId }}</a></li>
        </ul>
        <button type="button"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="cooldown > 0 || pending" @click="submit">
          {{ cooldown > 0 ? `ส่งอีกครั้งได้ใน ${cooldown} วินาที` : pending ? 'กำลังส่ง...' : 'ส่งลิงก์อีกครั้ง' }}
        </button>
      </template>

      <form v-else @submit.prevent="submit">
        <h2 class="text-2xl font-extrabold text-slate-900">ลืมรหัสผ่าน</h2>
        <p class="mt-1 text-sm text-slate-500">กรอกอีเมลหรือเบอร์โทรของบัญชี เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลของบัญชี</p>

        <label class="mt-6 block text-sm font-semibold text-slate-700">
          อีเมลหรือเบอร์โทร
          <span class="relative mt-1 block">
            <LearnIcon :name="looksLikePhone ? 'phone' : 'mail'"
              class="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors"
              :class="looksLikePhone ? 'text-emerald-500' : 'text-sky-500'" />
            <input v-model="identifier" type="text" required autocomplete="username" autocapitalize="none" spellcheck="false"
              placeholder="name@example.com หรือ 081-234-5678"
              class="w-full rounded-2xl border border-slate-200 py-3 pe-4 ps-12 font-normal outline-none placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
          </span>
        </label>

        <p v-if="errorMessage" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</p>

        <button type="submit"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          :disabled="pending">
          <LearnIcon name="mail" class="h-4 w-4" />
          {{ pending ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-500">
        นึกออกแล้ว?
        <NuxtLink :to="{ path: '/signin', query: route.query }" class="font-bold text-blue-700 hover:text-blue-800">กลับไปเข้าสู่ระบบ</NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'ลืมรหัสผ่าน | ClickClass Tutor' })

const RESEND_SECONDS = 60

const route = useRoute()
const { api } = useApi()
const identifier = ref(typeof route.query.login === 'string' ? route.query.login : '')
const pending = ref(false)
const sent = ref(false)
const sentMessage = ref('')
const errorMessage = ref('')
const cooldown = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const steps = [
  'กรอกอีเมลหรือเบอร์โทรของบัญชี',
  'เปิดลิงก์ที่ส่งไปทางอีเมล',
  'ตั้งรหัสผ่านใหม่ แล้วเข้าสู่ระบบ',
]

const looksLikePhone = computed(() => !identifier.value.includes('@') && /^\s*[+\d]/.test(identifier.value))

function startCooldown() {
  cooldown.value = RESEND_SECONDS
  clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function submit() {
  if (pending.value || !identifier.value.trim()) return
  errorMessage.value = ''
  pending.value = true
  try {
    const response = await api<{ message: string }>('/auth/password/forgot', {
      method: 'POST',
      body: { login: identifier.value.trim() },
    })
    sentMessage.value = response.message
    sent.value = true
    startCooldown()
  }
  catch (error: unknown) {
    errorMessage.value = apiStatus(error) === 429
      ? 'ขอลิงก์บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
      : apiErrorMessage(error, 'ส่งลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  finally {
    pending.value = false
  }
}

onBeforeUnmount(() => clearInterval(timer))
</script>
