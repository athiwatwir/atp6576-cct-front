<template>
  <div class="space-y-6">
    <section class="rounded-[2rem] bg-gradient-to-r from-sky-100 to-blue-50 p-6 md:p-8">
      <p class="text-sm font-bold text-blue-600">สวัสดี{{ user?.name ? ` ${user.name}` : '' }}</p>
      <h1 class="mt-1 text-3xl font-extrabold text-slate-900">ห้องเรียนของฉัน</h1>
      <p v-if="user?.school_name" class="mt-2 text-sm font-semibold text-slate-700">{{ user.school_name }}</p>
      <p class="mt-2 max-w-xl text-sm text-slate-600">รายการคอร์ส หลักสูตร และข้อสอบที่เปิดสิทธิ์ให้เรียนได้ทั้งหมด</p>
    </section>

    <p v-if="!user" class="text-sm text-slate-500">กำลังโหลดห้องเรียน...</p>

    <section v-else-if="!classroom.items.length" class="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
      <p class="font-extrabold text-slate-900">ยังไม่มีสิทธิ์เรียน</p>
      <p class="mt-2 text-sm text-slate-500">เมื่อชำระเงินสำเร็จ รายการจะแสดงที่นี่และในเมนูเข้าห้องเรียน</p>
      <NuxtLink to="/courses" class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
        <LearnIcon name="course" class="h-4 w-4" />
        ดูคอร์สเรียน
      </NuxtLink>
    </section>

    <template v-else>
      <section v-for="group in groups" :key="group.kind" class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">{{ group.title }}</h2>
        <p v-if="!group.items.length" class="mt-3 text-sm text-slate-400">{{ group.empty }}</p>
        <ul v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="item in group.items" :key="`${item.kind}-${item.id}`">
            <NuxtLink :to="item.to" class="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-200">
              <span class="relative block aspect-video w-full overflow-hidden" :class="coverClass(item.kind)">
                <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="h-full w-full object-cover transition duration-300 group-hover:scale-105">
                <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'" class="absolute inset-0 m-auto h-12 w-12" />
                <span class="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">{{ item.kindLabel }}</span>
              </span>

              <span class="flex flex-1 flex-col gap-3 p-4">
                <span class="block font-bold leading-snug text-slate-900">{{ item.name }}</span>

                <span class="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <span class="inline-flex items-center gap-2 rounded-xl px-3 py-1.5" :class="expiry(item.expires_at).tone">
                    <LearnIcon :name="item.expires_at ? 'clock' : 'infinity'" class="h-5 w-5 shrink-0" />
                    <span class="leading-tight">
                      <span class="block text-sm font-extrabold">{{ expiry(item.expires_at).headline }}</span>
                      <span v-if="item.expires_at" class="block text-[11px] font-semibold opacity-80">ใช้ได้ถึง {{ formatThaiDate(item.expires_at) }}</span>
                    </span>
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-200 transition group-hover:bg-blue-700">
                    <LearnIcon :name="item.kind === 'exam' ? 'exam' : 'play'" class="h-4 w-4" />
                    {{ item.kind === 'exam' ? 'เข้าสอบ' : 'เข้าเรียน' }}
                  </span>
                </span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'ห้องเรียนของฉัน | ClickClass Tutor' })

const { user, classroom, fetchUser } = useAuth()

onMounted(() => {
  fetchUser()
})

const groups = computed(() => [
  {
    kind: 'learning',
    title: 'คอร์ส/หลักสูตรของฉัน',
    empty: 'ยังไม่มีคอร์สหรือหลักสูตรที่เปิดสิทธิ์',
    items: [...classroom.value.courses, ...classroom.value.curriculums],
  },
  {
    kind: 'exam',
    title: 'ข้อสอบ',
    empty: 'ยังไม่มีข้อสอบที่เปิดสิทธิ์',
    items: classroom.value.exams,
  },
])

const hourMs = 60 * 60 * 1000
const dayMs = 24 * hourMs
const now = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = Date.now()
  }, 60 * 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

function expiry(value: string | null | undefined) {
  if (!value) return { headline: 'เรียนได้ไม่จำกัดเวลา', tone: 'bg-sky-100 text-sky-700' }
  const left = new Date(value).getTime() - now.value
  if (!Number.isFinite(left)) return { headline: 'ไม่ทราบวันหมดอายุ', tone: 'bg-slate-100 text-slate-600' }
  if (left <= 0) return { headline: 'หมดอายุแล้ว', tone: 'bg-rose-100 text-rose-700' }
  if (left < dayMs) {
    const hours = Math.max(1, Math.ceil(left / hourMs))
    return { headline: `เหลือ ${hours} ชั่วโมง`, tone: 'bg-rose-100 text-rose-700' }
  }
  const days = Math.ceil(left / dayMs)
  if (days <= 3) return { headline: `เหลือ ${days} วัน`, tone: 'bg-rose-100 text-rose-700' }
  if (days <= 7) return { headline: `เหลือ ${days} วัน`, tone: 'bg-amber-100 text-amber-700' }
  return { headline: `เหลือ ${days} วัน`, tone: 'bg-emerald-100 text-emerald-700' }
}

function coverClass(kind: string) {
  if (kind === 'exam') return 'bg-amber-100 text-amber-600'
  if (kind === 'curriculum') return 'bg-sky-100 text-sky-600'
  return 'bg-blue-100 text-blue-600'
}
</script>
