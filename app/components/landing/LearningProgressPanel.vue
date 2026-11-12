<template>
  <aside class="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 ring-1 ring-sky-100 md:p-5"
    aria-labelledby="learning-progress-title">
    <div class="flex items-center justify-between gap-2">
      <h2 id="learning-progress-title" class="flex items-center gap-2 text-sm font-extrabold text-slate-800">
        <span class="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500 text-white">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
          </svg>
        </span>
        Learning progress
      </h2>
      <span v-if="courses.length" class="text-xs font-bold text-slate-400">{{ courses.length }} คอร์ส</span>
    </div>

    <div v-if="!courses.length"
      class="mt-4 rounded-2xl bg-white/80 p-4 text-center text-sm text-slate-500 ring-1 ring-slate-100">
      <p class="font-bold text-slate-700">ยังไม่มีคอร์สที่กำลังเรียน</p>
      <NuxtLink to="/courses" class="mt-2 inline-flex items-center gap-1 font-bold text-blue-700 hover:underline">
        เลือกคอร์สแรกของหนู
        <LearnIcon name="arrow" class="h-3.5 w-3.5" />
      </NuxtLink>
    </div>

    <template v-else>
      <div class="mt-4 flex items-center gap-4">
        <div class="relative h-24 w-24 shrink-0" role="img" :aria-label="`ความคืบหน้าเฉลี่ย ${overall}%`">
          <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke-width="10" class="stroke-sky-100" />
            <circle cx="50" cy="50" r="42" fill="none" stroke-width="10" stroke-linecap="round"
              class="stroke-emerald-500 transition-[stroke-dashoffset] duration-700" :stroke-dasharray="RING"
              :stroke-dashoffset="RING - (RING * overall) / 100" />
          </svg>
          <span class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-extrabold text-slate-900">{{ overall }}<span class="text-sm">%</span></span>
            <span class="text-[10px] font-bold text-slate-400">เฉลี่ย</span>
          </span>
        </div>
        <dl class="grid flex-1 gap-2 text-sm">
          <div class="flex items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
            <dt class="text-slate-500">เรียนจบแล้ว</dt>
            <dd class="font-extrabold text-emerald-600">{{ finishedCount }}/{{ courses.length }} คอร์ส</dd>
          </div>
          <div class="flex items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
            <dt class="text-slate-500">ดูคลิปจบ</dt>
            <dd class="font-extrabold text-sky-600">{{ clipsDone }} คลิป</dd>
          </div>
        </dl>
      </div>



      <NuxtLink v-if="nextCourse" :to="`/learn/${nextCourse.slug}`"
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">
        <LearnIcon name="play" class="h-4 w-4" />
        {{ nextCourse.progress ? 'เรียนต่อ' : 'เริ่มเรียน' }} {{ nextCourse.name }}
      </NuxtLink>
      <p v-if="courses.length > topCourses.length" class="mt-2 text-center text-xs text-slate-400">
        และอีก {{ courses.length - topCourses.length }} คอร์สด้านล่าง
      </p>
    </template>
  </aside>
</template>

<script setup lang="ts">
import type { LearningItem } from '@/composables/useAuth'

const props = defineProps<{ courses: LearningItem[] }>()

const RING = 2 * Math.PI * 42
const TOP_COUNT = 3

function percentOf(course: LearningItem) {
  return Math.min(100, Math.round(course.progress?.percent ?? 0))
}

function activityTime(course: LearningItem) {
  return course.progress?.last_activity_at ? new Date(course.progress.last_activity_at).getTime() : 0
}

const overall = computed(() => {
  if (!props.courses.length) return 0
  return Math.round(props.courses.reduce((sum, course) => sum + percentOf(course), 0) / props.courses.length)
})

const finishedCount = computed(() => props.courses.filter(course => percentOf(course) >= 100).length)
const clipsDone = computed(() => props.courses.reduce((sum, course) => sum + (course.progress?.completed_items ?? 0), 0))

/** เรียนล่าสุดก่อน คอร์สที่จบแล้วไปท้ายสุด */
const sortedCourses = computed(() => [...props.courses].sort((a, b) => {
  const finishedDiff = Number(percentOf(a) >= 100) - Number(percentOf(b) >= 100)
  return finishedDiff || activityTime(b) - activityTime(a)
}))

const topCourses = computed(() => sortedCourses.value.slice(0, TOP_COUNT))
const nextCourse = computed(() => sortedCourses.value.find(course => percentOf(course) < 100) ?? null)

function relativeDay(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'วันนี้'
  if (days === 1) return 'เมื่อวาน'
  if (days < 30) return `${days} วันก่อน`
  return formatThaiDate(iso)
}
</script>
