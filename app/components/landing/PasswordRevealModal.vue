<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" @click.self="emit('close')">
      <div role="dialog" aria-modal="true" aria-labelledby="password-title" class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <header class="relative bg-gradient-to-br from-violet-500 to-indigo-600 px-5 pb-5 pt-4 text-white">
          <button type="button" class="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30" aria-label="ปิด" @click="emit('close')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <h2 id="password-title" class="mt-3 text-lg font-extrabold">รหัสผ่านของฉัน</h2>
          <p v-if="email" class="mt-0.5 truncate text-sm text-white/80">ใช้คู่กับอีเมล {{ email }}</p>
        </header>

        <div class="p-5">
          <div v-if="pending" class="flex flex-col items-center gap-3 py-6 text-sm font-semibold text-slate-500">
            <span class="h-9 w-9 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" aria-hidden="true" />
            กำลังโหลดรหัสผ่าน...
          </div>

          <div v-else-if="error" class="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
            <p>{{ error }}</p>
            <NuxtLink v-if="missing" to="/profile" class="mt-2 inline-flex font-bold text-rose-800 underline" @click="emit('close')">ตั้งรหัสผ่านใหม่ที่หน้าโปรไฟล์</NuxtLink>
          </div>

          <template v-else-if="password">
            <div class="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 ps-4 ring-1 ring-slate-200">
              <span class="min-w-0 flex-1 select-all break-all font-mono text-xl font-bold tracking-wider text-slate-900" :aria-label="visible ? 'รหัสผ่าน' : 'รหัสผ่านถูกซ่อน'">
                {{ visible ? password : '•'.repeat(Math.max(8, password.length)) }}
              </span>
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-violet-700"
                :aria-label="visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                :aria-pressed="visible"
                @click="visible = !visible"
              >
                <svg v-if="visible" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2.5 12s3.5 7 9.5 7a9.7 9.7 0 0 0 4.4-1" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              class="mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-md transition"
              :class="copied ? 'bg-emerald-500 shadow-emerald-200' : 'bg-violet-600 shadow-violet-200 hover:bg-violet-700'"
              @click="copy"
            >
              <svg v-if="copied" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m5 12 5 5 9-10" />
              </svg>
              <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </svg>
              {{ copied ? 'คัดลอกแล้ว' : 'Copy รหัสผ่าน' }}
            </button>
            <p v-if="copyError" class="mt-2 text-center text-xs font-semibold text-rose-600">{{ copyError }}</p>

            <p class="mt-4 flex items-start gap-1.5 rounded-2xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <span aria-hidden="true">🔒</span>
              <span>อย่าบอกรหัสผ่านนี้กับใคร หน้าต่างนี้จะปิดเองใน {{ secondsLeft }} วินาที อยากเปลี่ยนรหัสผ่าน ไปที่
                <NuxtLink to="/profile" class="font-bold underline" @click="emit('close')">หน้าโปรไฟล์</NuxtLink>
              </span>
            </p>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ email?: string | null }>()

const emit = defineEmits<{ close: [] }>()

const AUTO_CLOSE_SECONDS = 60

const { api } = useApi()
const password = ref<string | null>(null)
const pending = ref(true)
const error = ref('')
const missing = ref(false)
const visible = ref(true)
const copied = ref(false)
const copyError = ref('')
const secondsLeft = ref(AUTO_CLOSE_SECONDS)
let countdown: ReturnType<typeof setInterval> | undefined
let copiedTimer: ReturnType<typeof setTimeout> | undefined

/** ดึงรหัสผ่านตอนเปิดหน้าต่างเท่านั้น ปิดแล้วค่าหายไปกับ component */
async function load() {
  try {
    const response = await api<{ data: { password: string | null } }>('/profile/password/reveal', { method: 'POST' })
    password.value = response.data.password
    if (!password.value) {
      missing.value = true
      error.value = 'ยังไม่มีรหัสผ่านให้ดู ออกจากระบบแล้วเข้าสู่ระบบด้วยรหัสผ่านอีกครั้ง หรือตั้งรหัสผ่านใหม่'
      return
    }
    countdown = setInterval(() => {
      secondsLeft.value -= 1
      if (secondsLeft.value <= 0) emit('close')
    }, 1000)
  }
  catch (exception: unknown) {
    error.value = apiErrorMessage(exception, 'ดูรหัสผ่านไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  finally {
    pending.value = false
  }
}

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  area.remove()
}

async function copy() {
  if (!password.value) return
  copyError.value = ''
  try {
    await writeClipboard(password.value)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copied.value = false }, 2000)
  }
  catch {
    copyError.value = 'คัดลอกไม่สำเร็จ กดรูปตาเพื่อดูแล้วจดไว้แทน'
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  load()
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  clearInterval(countdown)
  clearTimeout(copiedTimer)
  password.value = null
})
</script>
