<template>
  <div>
    <section class="relative overflow-hidden bg-sky-50">
      <img
        src="/images/cover/clickclass-demo-cover.webp"
        alt=""
        width="1891"
        height="831"
        fetchpriority="high"
        class="pointer-events-none absolute inset-0 h-full w-full object-cover object-[78%_center]"
        aria-hidden="true"
      >
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10 md:from-white/80 md:via-white/40 md:to-transparent" aria-hidden="true" />
      <div class="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-12 md:min-h-[26rem] md:px-6 md:py-16">
        <span class="inline-flex items-center gap-1.5 self-start rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-purple-700 shadow-sm">
          <LearnIcon name="play" class="h-3.5 w-3.5" />
          ทดลองเรียนฟรี ไม่ต้องจ่ายก่อน
        </span>
        <h1 class="mt-4 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          ลองเรียนก่อน<br>
          <span class="text-purple-600">แล้วค่อยตัดสินใจ</span>
        </h1>
        <p class="mt-4 max-w-xl text-base text-slate-600">
          รวมคอร์สที่เปิดให้ดูคลิปทดลองเรียน ดูวิธีสอนของครู เนื้อหา และบรรยากาศการเรียน ก่อนเลือกคอร์สที่ใช่สำหรับน้อง
        </p>
        <dl class="mt-8 flex flex-wrap gap-3">
          <div class="rounded-2xl bg-white/80 px-5 py-3 shadow-sm ring-1 ring-white">
            <dt class="text-xs font-semibold text-slate-500">คอร์สที่ทดลองเรียนได้</dt>
            <dd class="text-2xl font-extrabold text-slate-900">{{ pending ? '…' : courses.length }}</dd>
          </div>
          <div class="rounded-2xl bg-white/80 px-5 py-3 shadow-sm ring-1 ring-white">
            <dt class="text-xs font-semibold text-slate-500">คลิปทดลองทั้งหมด</dt>
            <dd class="text-2xl font-extrabold text-slate-900">{{ pending ? '…' : totalClips }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div v-if="subjects.length > 1" class="mb-6 flex flex-wrap gap-2" role="group" aria-label="กรองตามวิชา">
        <button
          v-for="option in subjects"
          :key="option.value"
          type="button"
          class="rounded-full px-4 py-2 text-sm font-bold transition"
          :class="option.value === subject ? 'bg-purple-600 text-white shadow-sm shadow-purple-200' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-purple-50'"
          :aria-pressed="option.value === subject"
          @click="subject = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="pending" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="index in 3" :key="index" class="h-96 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
      </div>

      <p v-else-if="failed" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">โหลดรายการไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง</p>

      <div v-else-if="!courses.length" class="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <p class="text-4xl" aria-hidden="true">🎬</p>
        <p class="mt-3 font-extrabold text-slate-900">ยังไม่มีคอร์สที่เปิดทดลองเรียน</p>
        <p class="mt-1 text-sm text-slate-500">ระหว่างนี้ดูคอร์สทั้งหมดก่อนได้</p>
        <NuxtLink to="/courses" class="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">ดูคอร์สเรียน</NuxtLink>
      </div>

      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="course in visibleCourses"
          :key="course.id"
          class="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <button
            type="button"
            class="relative block aspect-video shrink-0 overflow-hidden bg-gradient-to-br from-purple-100 to-sky-100 text-start"
            :disabled="!course.clips.length"
            :aria-label="course.clips.length ? `ดูคลิปทดลอง ${course.name}` : course.name"
            @click="openCourse(course)"
          >
            <img v-if="course.thumbnail_url" :src="course.thumbnail_url" :alt="course.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
            <LearnIcon v-else name="course" class="absolute inset-0 m-auto h-14 w-14 text-purple-300" />
            <span v-if="course.clips.length" class="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" aria-hidden="true" />
            <span
              v-if="course.clips.length"
              class="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-purple-600 shadow-lg transition group-hover:scale-110"
              aria-hidden="true"
            >
              <LearnIcon name="play" class="h-9 w-9" />
            </span>
            <span class="absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm" :class="course.clips.length ? 'bg-purple-600 text-white' : 'bg-white/90 text-slate-600'">
              {{ course.clips.length ? `ทดลองฟรี ${course.clips.length} คลิป` : 'คลิปทดลองกำลังจะมา' }}
            </span>
            <span v-if="course.trialSeconds" class="absolute bottom-3 end-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white">
              {{ lessonClock(course.trialSeconds) }}
            </span>
          </button>

          <div class="flex flex-1 flex-col p-5">
            <p class="text-xs font-semibold text-purple-600">{{ [course.category?.name, course.subject?.name].filter(Boolean).join(' · ') || 'คอร์สเรียน' }}</p>
            <h2 class="mt-1 text-lg font-extrabold leading-snug text-slate-900">{{ course.name }}</h2>
            <p v-if="course.instructor" class="mt-1 text-sm text-slate-500">สอนโดย {{ course.instructor.name }}</p>
            <p v-if="course.short_description" class="mt-2 line-clamp-2 text-sm text-slate-500">{{ course.short_description }}</p>

            <ul v-if="course.clips.length" class="mt-3 space-y-1">
              <li v-for="clip in course.clips.slice(0, 3)" :key="clip.id" class="flex items-center gap-2 text-sm text-slate-600">
                <LearnIcon name="play" class="h-4 w-4 shrink-0 text-purple-500" />
                <span class="truncate">{{ clip.title }}</span>
              </li>
              <li v-if="course.clips.length > 3" class="ps-6 text-xs text-slate-400">และอีก {{ course.clips.length - 3 }} คลิป</li>
            </ul>

            <div class="mt-auto flex items-end justify-between gap-3 pt-4">
              <div>
                <p v-if="course.sale_price && course.sale_price < course.price" class="text-xs text-slate-400 line-through">{{ formatBaht(course.price) }}</p>
                <p class="font-extrabold text-blue-700">{{ hasPlanChoice(course) ? `เริ่มต้น ${formatBaht(course.effective_price)}` : formatBaht(course.effective_price) }}</p>
              </div>
              <span v-if="course.chapter_count" class="text-xs text-slate-400">{{ course.chapter_count }} บท</span>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 rounded-full bg-purple-600 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-purple-200 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                :disabled="!course.clips.length"
                @click="openCourse(course)"
              >
                <LearnIcon name="play" class="h-4 w-4" />
                ดูคลิปทดลอง
              </button>
              <NuxtLink
                :to="`/courses/${course.slug}`"
                class="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50"
              >
                ดูรายละเอียด
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="selected" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 md:p-6" @click.self="closeCourse">
        <div role="dialog" aria-modal="true" aria-labelledby="demo-player-title" class="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row">
          <div class="flex min-w-0 flex-1 items-center bg-black">
            <video
              v-if="activeVideo"
              :key="activeVideo.id"
              ref="playerEl"
              :src="activeVideo.video_url ?? undefined"
              controls
              autoplay
              controlslist="nodownload noremoteplayback"
              disablepictureinpicture
              disableremoteplayback
              playsinline
              preload="metadata"
              class="aspect-video w-full bg-black"
              @contextmenu.prevent
              @loadedmetadata="resume"
              @timeupdate="onTimeUpdate"
              @pause="flushProgress(false)"
              @ended="flushProgress(true)"
            />
          </div>
          <aside class="flex w-full shrink-0 flex-col md:w-80">
            <div class="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
              <div class="min-w-0">
                <p class="text-xs font-bold text-purple-600">คลิปทดลองเรียน</p>
                <h2 id="demo-player-title" class="mt-0.5 font-extrabold leading-snug text-slate-900">{{ selected.name }}</h2>
              </div>
              <button type="button" class="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="ปิด" @click="closeCourse">✕</button>
            </div>
            <ul class="max-h-48 flex-1 overflow-y-auto p-2 md:max-h-none">
              <li v-for="(clip, index) in selected.clips" :key="clip.id">
                <button
                  type="button"
                  class="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition"
                  :class="clip.id === activeVideo?.id ? 'bg-purple-50 font-bold text-purple-700' : 'text-slate-700 hover:bg-slate-50'"
                  @click="play(clip)"
                >
                  <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" :class="clip.id === activeVideo?.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'">{{ index + 1 }}</span>
                  <span class="min-w-0 flex-1">
                    <span class="block">{{ clip.title }}</span>
                    <span v-if="clip.duration_seconds" class="block text-xs font-normal text-slate-400">{{ lessonClock(clip.duration_seconds) }}</span>
                  </span>
                </button>
              </li>
            </ul>
            <div class="border-t border-slate-100 p-4">
              <p class="text-sm text-slate-500">ชอบแบบนี้ไหม เรียนต่อได้ทุกบทเมื่อสมัครคอร์ส</p>
              <NuxtLink
                :to="`/courses/${selected.slug}#plans`"
                class="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-orange-600"
                @click="closeCourse"
              >
                <LearnIcon name="cart" class="h-4 w-4" />
                สมัครเรียนคอร์สนี้
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { hasPlanChoice, type CatalogItem, type CourseVideo } from '@/composables/useCart'
import { lessonClock } from '@/composables/useLessonPlayer'

definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'ทดลองเรียนฟรี | ClickClass Tutor',
  description: 'รวมคอร์สที่เปิดให้ดูคลิปทดลองเรียนฟรี ลองเรียนก่อนเลือกคอร์สที่ใช่',
})

interface DemoCourse extends CatalogItem {
  clips: CourseVideo[]
  trialSeconds: number
}

const { api } = useApi()
const { fetchAll } = useStorefront()

const { data, pending, error } = useLazyAsyncData('demo-courses', async () => {
  const catalog = await fetchAll<CatalogItem>('/catalog', { type: 'course' })
  const trialCourses = catalog.data.filter(course => course.is_trial_available)

  return Promise.all(trialCourses.map(async (course): Promise<DemoCourse> => {
    try {
      const detail = (await api<{ data: CatalogItem }>(`/courses/${course.slug}`)).data
      const clips = (detail.chapters ?? []).flatMap(chapter => chapter.videos.filter(video => video.is_trial && video.video_url))
      return { ...course, ...detail, clips, trialSeconds: clips.reduce((sum, clip) => sum + (clip.duration_seconds ?? 0), 0) }
    }
    catch {
      return { ...course, clips: [], trialSeconds: 0 }
    }
  }))
})

const failed = computed(() => Boolean(error.value))
const courses = computed(() => [...(data.value ?? [])].sort((a, b) => b.clips.length - a.clips.length))
const totalClips = computed(() => courses.value.reduce((sum, course) => sum + course.clips.length, 0))

const subject = ref('all')
const subjects = computed(() => {
  const seen = new Map<string, string>()
  for (const course of courses.value) {
    if (course.subject) seen.set(course.subject.slug, course.subject.name)
  }
  return [{ value: 'all', label: 'ทั้งหมด' }, ...[...seen].map(([value, label]) => ({ value, label }))]
})
const visibleCourses = computed(() => (subject.value === 'all'
  ? courses.value
  : courses.value.filter(course => course.subject?.slug === subject.value)))

const selected = ref<DemoCourse | null>(null)
const { activeVideo, playerEl, resume, onTimeUpdate, flushProgress, play } = useLessonPlayer(() => selected.value?.slug ?? '')

function openCourse(course: DemoCourse) {
  if (!course.clips.length) return
  selected.value = course
  play(course.clips[0])
}

function closeCourse() {
  flushProgress(false)
  activeVideo.value = null
  selected.value = null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && selected.value) closeCourse()
}

watch(selected, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>
