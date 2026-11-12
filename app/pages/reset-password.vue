<template>
  <section class="mx-auto max-w-md px-4 py-10 md:py-16">
    <div class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-violet-50 md:p-8">
      <template v-if="done">
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <LearnIcon name="check" class="h-7 w-7" />
        </span>
        <h1 class="mt-4 text-2xl font-extrabold text-slate-900">ตั้งรหัสผ่านใหม่แล้ว</h1>
        <p class="mt-2 text-sm text-slate-600">เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย อุปกรณ์อื่นที่เคยเข้าสู่ระบบไว้จะถูกออกจากระบบ</p>
        <NuxtLink :to="{ path: '/signin', query: { login: email } }"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
          <LearnIcon name="login" class="h-4 w-4" />
          ไปหน้าเข้าสู่ระบบ
        </NuxtLink>
      </template>

      <template v-else-if="!token || !email">
        <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl" aria-hidden="true">🔗</span>
        <h1 class="mt-4 text-2xl font-extrabold text-slate-900">ลิงก์ไม่ครบ</h1>
        <p class="mt-2 text-sm text-slate-600">เปิดลิงก์จากอีเมลอีกครั้ง หรือขอลิงก์ใหม่</p>
        <NuxtLink to="/forgot-password" class="mt-6 inline-flex w-full items-center justify-center rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700">
          ขอลิงก์ใหม่
        </NuxtLink>
      </template>

      <form v-else @submit.prevent="submit">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h1 class="mt-4 text-2xl font-extrabold text-slate-900">ตั้งรหัสผ่านใหม่</h1>
        <p class="mt-1 truncate text-sm text-slate-500">สำหรับบัญชี {{ email }}</p>

        <label class="mt-6 block text-sm font-semibold text-slate-700">
          รหัสผ่านใหม่
          <span class="relative mt-1 block">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required minlength="8" autocomplete="new-password"
              class="w-full rounded-2xl border border-slate-200 px-4 py-3 pe-16 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
            <button type="button" class="absolute inset-y-0 end-3 text-xs font-bold text-violet-700" @click="showPassword = !showPassword">
              {{ showPassword ? 'ซ่อน' : 'แสดง' }}
            </button>
          </span>
        </label>
        <div class="mt-2 flex items-center gap-2" aria-hidden="true">
          <span v-for="index in 3" :key="index" class="h-1.5 flex-1 rounded-full transition"
            :class="index <= strength.level ? strength.bar : 'bg-slate-100'" />
          <span class="w-16 text-end text-xs font-bold" :class="strength.text">{{ strength.label }}</span>
        </div>

        <label class="mt-4 block text-sm font-semibold text-slate-700">
          ยืนยันรหัสผ่านใหม่
          <input v-model="confirm" :type="showPassword ? 'text' : 'password'" required autocomplete="new-password"
            class="mt-1 w-full rounded-2xl border px-4 py-3 font-normal outline-none focus:ring-2"
            :class="confirm && confirm !== password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'">
        </label>
        <p v-if="confirm && confirm !== password" class="mt-1.5 text-xs font-semibold text-rose-600">รหัสผ่านทั้งสองช่องไม่ตรงกัน</p>

        <p v-if="errorMessage" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
          <NuxtLink v-if="linkExpired" to="/forgot-password" class="mt-1 block font-bold text-rose-800 underline">ขอลิงก์ใหม่</NuxtLink>
        </p>

        <button type="submit"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          :disabled="pending || password.length < MIN_LENGTH || confirm !== password">
          {{ pending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'ตั้งรหัสผ่านใหม่ | ClickClass Tutor' })

const MIN_LENGTH = 8

const route = useRoute()
const router = useRouter()
const { api } = useApi()
const { token: sessionToken, user } = useAuth()

const token = typeof route.query.token === 'string' ? route.query.token : ''
const email = typeof route.query.email === 'string' ? route.query.email : ''

// ไม่ให้ token ค้างใน URL หรือประวัติเบราว์เซอร์
if (token) await router.replace({ query: {} })

const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const pending = ref(false)
const done = ref(false)
const errorMessage = ref('')
const linkExpired = ref(false)

const strength = computed(() => {
  const value = password.value
  if (!value) return { level: 0, label: '', bar: '', text: 'text-slate-400' }
  if (value.length < MIN_LENGTH) return { level: 1, label: 'สั้นไป', bar: 'bg-rose-400', text: 'text-rose-500' }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(pattern => pattern.test(value)).length
  if (variety >= 3 && value.length >= 10) return { level: 3, label: 'ดีมาก', bar: 'bg-emerald-500', text: 'text-emerald-600' }
  return { level: 2, label: 'พอใช้', bar: 'bg-amber-400', text: 'text-amber-600' }
})

async function submit() {
  if (pending.value || password.value.length < MIN_LENGTH || confirm.value !== password.value) return
  errorMessage.value = ''
  linkExpired.value = false
  pending.value = true
  try {
    await api('/auth/password/reset', {
      method: 'POST',
      body: { token, email, password: password.value, password_confirmation: confirm.value },
    })
    done.value = true
    password.value = ''
    confirm.value = ''
    // token เดิมทุกอุปกรณ์ถูกยกเลิกแล้ว ล้างสถานะในเครื่องนี้ด้วย (ไม่ใช้ logout() เพราะจะพาออกจากหน้านี้)
    sessionToken.value = null
    user.value = null
  }
  catch (error: unknown) {
    linkExpired.value = Boolean(apiFieldError(error, 'token'))
    errorMessage.value = apiStatus(error) === 429
      ? 'ลองบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
      : apiErrorMessage(error, 'ตั้งรหัสผ่านไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  finally {
    pending.value = false
  }
}
</script>
