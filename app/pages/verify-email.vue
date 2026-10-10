<template>
  <section class="mx-auto max-w-xl px-4 py-12 md:px-6">
    <div class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-blue-50 md:p-8">
      <template v-if="status === 'success'">
        <p class="text-sm font-bold text-emerald-600">ยืนยันอีเมลแล้ว</p>
        <h1 class="mt-2 text-3xl font-extrabold text-slate-900">อีเมลพร้อมใช้งาน</h1>
        <p class="mt-3 text-slate-600">บัญชีนี้ยืนยันอีเมลแล้ว สามารถเข้าห้องเรียนได้</p>
        <NuxtLink :to="loggedIn ? '/home' : '/signin'" class="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
          {{ loggedIn ? 'เข้าห้องเรียน' : 'เข้าสู่ระบบ' }}
        </NuxtLink>
      </template>

      <template v-else-if="status === 'invalid'">
        <p class="text-sm font-bold text-rose-600">ลิงก์ใช้ไม่ได้</p>
        <h1 class="mt-2 text-3xl font-extrabold text-slate-900">ลิงก์หมดอายุหรือไม่ถูกต้อง</h1>
        <p class="mt-3 text-slate-600">ลิงก์ยืนยันมีอายุ 60 นาที ส่งลิงก์ใหม่ไปที่อีเมลที่ใช้สมัครได้</p>
      </template>

      <template v-else>
        <p class="text-sm font-bold text-amber-600">รอการยืนยัน</p>
        <h1 class="mt-2 text-3xl font-extrabold text-slate-900">กรุณายืนยันอีเมล</h1>
        <p class="mt-3 text-slate-600">
          เราส่งลิงก์ยืนยันไปให้แล้ว เปิดอีเมลแล้วกดปุ่มยืนยัน ลิงก์มีอายุ 60 นาที
        </p>
      </template>

      <form v-if="status !== 'success'" class="mt-6 space-y-3" @submit.prevent="resend">
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

const route = useRoute()
const { loggedIn, user, verifyNotice, resendVerification } = useAuth()

const status = computed(() => {
  const value = route.query.status
  return value === 'success' || value === 'invalid' ? value : ''
})

const resendEmail = ref('')
const feedback = ref('')
const errorMessage = ref('')
const pending = ref(false)

watch(status, (value) => {
  if (value === 'success') verifyNotice.value = null
}, { immediate: true })

watchEffect(() => {
  const queryEmail = route.query.email
  if (typeof queryEmail === 'string' && queryEmail) resendEmail.value = queryEmail
  else if (user.value?.email) resendEmail.value = user.value.email
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
