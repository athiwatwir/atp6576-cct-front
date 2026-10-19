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
        <ul v-else class="mt-4 grid gap-3 sm:grid-cols-2">
          <li v-for="item in group.items" :key="`${item.kind}-${item.id}`">
            <NuxtLink :to="item.to" class="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-blue-50">
              <span class="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl" :class="coverClass(item.kind)">
                <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="h-full w-full object-cover">
                <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'" class="absolute inset-0 m-auto h-6 w-6" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-bold text-slate-900">{{ item.name }}</span>
                <span class="block text-xs font-semibold text-slate-500">{{ item.kindLabel }}</span>
                <span class="block text-xs" :class="expiringSoon(item.expires_at) ? 'font-bold text-amber-600' : 'text-slate-400'">
                  {{ item.expires_at ? `ใช้ได้ถึง ${formatThaiDate(item.expires_at)}` : 'ไม่จำกัดเวลา' }}
                </span>
              </span>
              <span class="shrink-0 text-xs font-bold text-blue-700">เข้าเรียน</span>
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

const soonMs = 7 * 24 * 60 * 60 * 1000

function expiringSoon(value: string | null | undefined) {
  if (!value) return false
  const time = new Date(value).getTime()
  return Number.isFinite(time) && time - Date.now() < soonMs
}

function coverClass(kind: string) {
  if (kind === 'exam') return 'bg-amber-100 text-amber-600'
  if (kind === 'curriculum') return 'bg-sky-100 text-sky-600'
  return 'bg-blue-100 text-blue-600'
}
</script>
