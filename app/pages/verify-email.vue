<template>
  <section class="mx-auto max-w-xl px-4 py-12 md:px-6">
    <div class="rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-blue-50 md:p-8">
      <template v-if="state === 'verifying'">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100" aria-hidden="true">
          <span class="h-8 w-8 animate-spin rounded-full border-4 border-sky-300 border-t-sky-600" />
        </span>
        <h1 class="mt-4 text-2xl font-extrabold text-slate-900">กำลังยืนยันอีเมล...</h1>
        <p class="mt-2 text-slate-600">รอสักครู่นะ</p>
      </template>

      <template v-else-if="state === 'success'">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl" aria-hidden="true">🎉</span>
        <p class="mt-4 text-sm font-bold text-emerald-600">{{ alreadyVerified ? 'ยืนยันไว้แล้ว' : 'ยืนยันอีเมลแล้ว' }}</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">อีเมลพร้อมใช้งาน</h1>
        <p class="mt-3 text-slate-600">
          {{ verifiedEmail ? `${verifiedEmail} ` : '' }}{{ alreadyVerified ? 'ยืนยันอีเมลเรียบร้อยตั้งแต่ก่อนหน้านี้แล้ว' : 'ยืนยันเรียบร้อย พร้อมเริ่มเรียนแล้ว' }}
        </p>
        <NuxtLink :to="loggedIn ? '/home' : '/signin'" class="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
          {{ loggedIn ? 'เข้าห้องเรียน' : 'เข้าสู่ระบบ' }}
        </NuxtLink>
      </template>

      <template v-else-if="state === 'invalid'">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl" aria-hidden="true">⏰</span>
        <p class="mt-4 text-sm font-bold text-rose-600">ลิงก์ใช้ไม่ได้</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">ลิงก์หมดอายุหรือไม่ถูกต้อง</h1>
        <p class="mt-3 text-slate-600">ลิงก์ยืนยันมีอายุ 60 นาที ขอลิงก์ใหม่ไปที่อีเมลที่ใช้สมัครได้ด้านล่าง</p>
      </template>

      <template v-else>
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl" aria-hidden="true">📬</span>
        <p class="mt-4 text-sm font-bold text-amber-600">รอการยืนยัน</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">กรุณายืนยันอีเมล</h1>
        <p class="mt-3 text-slate-600">
          เราส่งลิงก์ยืนยันไปให้แล้ว เปิดอีเมลแล้วกดปุ่มยืนยัน ลิงก์มีอายุ 60 นาที
        </p>
      </template>

      <form v-if="state === 'invalid' || state === 'waiting'" class="mt-6 space-y-3 text-start" @submit.prevent="resend">
        <label class="block text-sm font-semibold text-slate-700">
          อีเมล
          <input v-model="resendEmail" type="email" required class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
        </label>
        <p v-if="feedback" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ feedback }}</p>
        <p v-if="errorMessage" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</p>
        <button type="submit" class="inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300" :disabled="pending">
          {{ pending ? 'กำลังส่ง...' : 'ส่งลิงก์ยืนยันอีกครั้ง' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'ยืนยันอีเมล | ClickClass Tutor' })

type VerifyState = 'waiting' | 'verifying' | 'success' | 'invalid'

interface ConfirmResponse {
  message: string
  status: 'verified' | 'already_verified'
  email: string
}

const route = useRoute()
const router = useRouter()
const { api } = useApi()
const { loggedIn, user, verifyNotice, resendVerification, fetchUser } = useAuth()

const state = ref<VerifyState>('waiting')
const alreadyVerified = ref(false)
const verifiedEmail = ref('')
const resendEmail = ref('')
const feedback = ref('')
const errorMessage = ref('')
const pending = ref(false)

function queryText(key: string) {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}

async function confirmFromLink() {
  const id = queryText('id')
  const hash = queryText('hash')
  const expires = queryText('expires')
  const signature = queryText('signature')
  if (!id || !hash || !expires || !signature) return false

  state.value = 'verifying'
  alreadyVerified.value = false
  verifiedEmail.value = ''
  try {
    const response = await api<ConfirmResponse>('/auth/email/verify', {
      method: 'POST',
      body: { id: Number(id), hash, expires: Number(expires), signature },
    })
    alreadyVerified.value = response.status === 'already_verified'
    verifiedEmail.value = response.email
    state.value = 'success'
    verifyNotice.value = null
    if (loggedIn.value) await fetchUser()
  }
  catch {
    state.value = 'invalid'
  }
  await router.replace({ query: { status: state.value === 'success' ? 'success' : 'invalid' } })
  return true
}

watch(() => route.query, async () => {
  if (await confirmFromLink()) return
  const status = queryText('status')
  if (status === 'success') {
    state.value = 'success'
    verifyNotice.value = null
  }
  else if (status === 'invalid') {
    state.value = 'invalid'
  }
}, { immediate: true })

watchEffect(() => {
  const queryEmail = queryText('email')
  if (queryEmail) resendEmail.value = queryEmail
  else if (user.value?.email && !resendEmail.value) resendEmail.value = user.value.email
})

async function resend() {
  feedback.value = ''
  errorMessage.value = ''
  pending.value = true
  try {
    feedback.value = await resendVerification(resendEmail.value.trim())
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'ส่งลิงก์ยืนยันไม่สำเร็จ')
  }
  finally {
    pending.value = false
  }
}
</script>
