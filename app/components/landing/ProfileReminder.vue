<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" @click.self="later">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-reminder-title"
        class="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-xl"
      >
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl" aria-hidden="true">🏫</span>
        <h2 id="profile-reminder-title" class="mt-4 text-xl font-extrabold text-slate-900">
          {{ greeting }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          ช่วยบอกเราหน่อยว่าเรียนอยู่โรงเรียนไหน ใช้เวลาไม่ถึงนาที แล้วเราจะแนะนำคอร์สและกิจกรรมที่เหมาะกับน้องได้ดีขึ้น
        </p>
        <button
          ref="primaryEl"
          type="button"
          class="mt-6 w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
          @click="fillNow"
        >
          เติมข้อมูลโรงเรียน
        </button>
        <button type="button" class="mt-2 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50" @click="later">
          ไว้ทีหลัง
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { PROFILE_REMINDER_KEY } from '@/composables/useAuth'

const { user, loggedIn } = useAuth()
const route = useRoute()
const dismissed = ref(true)
const primaryEl = ref<HTMLButtonElement | null>(null)

const hiddenPaths = ['/profile', '/signin', '/signup', '/verify-email']

const missingSchool = computed(() => Boolean(user.value && !user.value.school_name?.trim()))
const open = computed(() => loggedIn.value && missingSchool.value && !dismissed.value && !hiddenPaths.includes(route.path))
const greeting = computed(() => {
  const name = user.value?.name?.trim()
  return name ? `ยินดีต้อนรับ ${name} 👋` : 'ยินดีต้อนรับ 👋'
})

function later() {
  dismissed.value = true
  sessionStorage.setItem(PROFILE_REMINDER_KEY, '1')
}

async function fillNow() {
  later()
  await navigateTo({ path: '/profile', query: { complete: 'school' } })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) later()
}

// login() clears the stored flag, so the popup comes back right after every sign-in.
watch(user, () => {
  dismissed.value = sessionStorage.getItem(PROFILE_REMINDER_KEY) === '1'
}, { immediate: true })

watch(open, (value) => {
  if (value) nextTick(() => primaryEl.value?.focus())
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
