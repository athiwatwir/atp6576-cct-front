<template>
  <div>
    <p v-if="pending" class="p-6 text-sm text-slate-500">กำลังโหลดบทเรียน...</p>
    <p v-else-if="failed || !course" class="m-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
      ไม่พบคอร์สนี้</p>

    <section v-else-if="!course.purchased" class="mx-auto max-w-xl p-6">
      <div class="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
        <p class="font-extrabold text-slate-900">{{ course.name }}</p>
        <p class="mt-2 text-sm text-slate-500">ยังไม่มีสิทธิ์เรียนคอร์สนี้ หรือสิทธิ์หมดอายุแล้ว</p>
        <NuxtLink :to="`/courses/${course.slug}`"
          class="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
          ดูแพ็กเกจและซื้อคอร์ส
        </NuxtLink>
      </div>
    </section>

    <div v-else class="md:grid md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]">
      <button type="button"
        class="flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 md:hidden"
        :aria-expanded="outlineOpen" aria-controls="lesson-outline" @click="outlineOpen = !outlineOpen">
        <span>บทเรียนทั้งหมด · ผ่านแล้ว {{ completedCount }}/{{ lessons.length }}</span>
        <span aria-hidden="true">{{ outlineOpen ? '▲' : '▼' }}</span>
      </button>

      <aside id="lesson-outline"
        class="border-e border-slate-200 bg-white md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] md:overflow-y-auto"
        :class="outlineOpen ? 'block' : 'hidden'">
        <div class="border-b border-slate-100 p-4">
          <p class="text-xs font-bold text-blue-600">คอร์สเรียน</p>
          <h1 class="mt-1 font-extrabold leading-snug text-slate-900">{{ course.name }}</h1>
          <p v-if="course.access_expires_at" class="mt-1 text-xs text-slate-400">ใช้ได้ถึง {{
            formatThaiDate(course.access_expires_at) }}</p>
          <div class="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ผ่านแล้ว {{ completedCount }}/{{ lessons.length }} บทเรียน</span>
            <span>{{ overallPercent }}%</span>
          </div>
          <span class="mt-1.5 block h-2 overflow-hidden rounded-full bg-slate-100">
            <span class="block h-full rounded-full bg-emerald-500" :style="{ width: `${overallPercent}%` }" />
          </span>
        </div>

        <nav aria-label="บทเรียน" class="p-2">
          <ul class="space-y-0.5">
            <li v-for="(chapter, chapterIndex) in chapters" :key="chapter.id">
              <button type="button" class="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-start transition"
                :class="chapter.id === activeChapter?.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'"
                :aria-current="chapter.id === activeChapter?.id ? 'true' : undefined" @click="selectChapter(chapter)">
                <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  :class="chapterDotClass(chapter)" aria-hidden="true">
                  {{ chapterStatus(chapter) === 'completed' ? '✓' : chapterIndex + 1 }}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold">{{ chapter.title }}</span>
                  <span class="block text-xs font-normal text-slate-400">{{ chapterMeta(chapter) }}</span>
                </span>
              </button>
            </li>
          </ul>

          <section v-if="course.exams?.length" class="mt-2 border-t border-slate-100 px-2 pt-3">
            <p class="text-xs font-bold text-slate-400">ข้อสอบของคอร์ส</p>
            <ul class="mt-1 space-y-0.5">
              <li v-for="exam in course.exams" :key="exam.id">
                <NuxtLink :to="`/exams/${exam.slug}`"
                  class="flex items-start gap-2 rounded-xl px-2 py-2 text-sm text-slate-600 hover:bg-amber-50">
                  <span class="mt-0.5 shrink-0 text-xs" aria-hidden="true">📝</span>
                  <span>{{ exam.name }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <p v-if="!chapters.length" class="px-2 py-4 text-sm text-slate-400">ยังไม่มีบทเรียนในคอร์สนี้</p>
        </nav>
      </aside>

      <main class="min-w-0 p-4 md:p-6">
        <div class="mx-auto w-full max-w-4xl">
        <template v-if="activeChapter">
          <div
            v-if="activeVideo"
            ref="stageEl"
            class="relative select-none overflow-hidden bg-black shadow-sm"
            :class="isFullscreen ? 'flex h-full w-full items-center justify-center' : 'rounded-3xl'"
            @contextmenu.prevent
          >
            <video
              :key="activeVideo.id"
              ref="playerEl"
              :src="activeVideo.video_url ?? undefined"
              controls
              controlslist="nodownload nofullscreen noremoteplayback"
              disablepictureinpicture
              disableremoteplayback
              playsinline
              preload="metadata"
              draggable="false"
              :autoplay="autoplay"
              class="w-full object-contain"
              :class="isFullscreen ? 'h-full' : 'aspect-video max-h-[70vh]'"
              @contextmenu.prevent
              @loadedmetadata="onLoaded"
              @timeupdate="onTimeUpdate"
              @pause="flushProgress(false)"
              @ended="onEnded"
              @error="onVideoError"
            />
            <span
              v-if="watermark"
              class="pointer-events-none absolute z-10 rounded bg-black/20 px-2 py-1 text-xs font-semibold text-white/40 transition-all duration-1000 sm:text-sm"
              :style="{ top: `${watermarkSpot.top}%`, left: `${watermarkSpot.left}%` }"
              aria-hidden="true"
            >{{ watermark }}</span>
            <button
              type="button"
              class="absolute end-3 top-3 z-20 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/70"
              :aria-label="isFullscreen ? 'ออกจากเต็มจอ' : 'ดูเต็มจอ'"
              @click="toggleFullscreen"
            >
              {{ isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ' }}
            </button>
          </div>
          <div v-else
            class="flex aspect-video items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
            บทนี้ไม่มีวิดีโอ ดูเอกสารและข้อสอบด้านล่าง
          </div>

          <div class="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-blue-600">บทที่ {{ activeChapterIndex + 1 }}</p>
              <h2 class="mt-1 text-2xl font-extrabold text-slate-900">{{ activeChapter.title }}</h2>
              <p v-if="activeVideo" class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span v-if="activeChapter.videos.length > 1" class="font-semibold text-slate-600">{{ activeVideo.title
                  }}</span>
                <span class="rounded-full px-2 py-0.5 font-bold"
                  :class="watchStatusClass(watchOf(activeVideo).status)">{{
                    watchStatusLabel(watchOf(activeVideo).status) }}</span>
                <span v-if="resumedLabel" class="text-slate-500">{{ resumedLabel }}</span>
              </p>
            </div>
            <div class="flex gap-2">
              <button type="button"
                class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                :disabled="!previousStep" @click="goTo(previousStep)">
                ก่อนหน้า
              </button>
              <button type="button"
                class="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
                :disabled="!nextStep" @click="goTo(nextStep)">
                ถัดไป
              </button>
            </div>
          </div>

          <div v-if="activeChapter.videos.length > 1" class="mt-4 flex flex-wrap gap-2" aria-label="วิดีโอในบทนี้">
            <button v-for="(video, videoIndex) in activeChapter.videos" :key="video.id" type="button"
              class="rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-40"
              :class="video.id === activeVideo?.id ? 'bg-blue-600 text-white' : watchOf(video).status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
              :disabled="!video.video_url" @click="select(video, true)">
              {{ watchOf(video).status === 'completed' ? '✓ ' : '' }}ตอนที่ {{ videoIndex + 1 }}
            </button>
          </div>

          <p v-if="justFinished && nextStep" class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ดูจบแล้ว ถัดไปคือ «{{ nextStep.chapter.id === activeChapter.id ? nextStep.video?.title :
              nextStep.chapter.title }}»
          </p>
          <p v-if="activeVideo?.description" class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{{
            activeVideo.description }}</p>
          <p v-else-if="activeChapter.description" class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{{
            activeChapter.description }}</p>

          <section v-if="activeChapter.exams?.length"
            class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 class="font-bold text-slate-800">ข้อสอบท้ายบท</h3>
            <ul class="mt-3 space-y-2">
              <li v-for="exam in activeChapter.exams" :key="exam.id">
                <NuxtLink :to="`/exams/${exam.slug}`"
                  class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                  <span>
                    <span class="block text-sm font-semibold text-slate-700">{{ exam.name }}</span>
                    <span class="block text-xs text-slate-400">
                      <template v-if="exam.question_count">{{ exam.question_count }} ข้อ</template>
                      <template v-if="exam.duration_minutes"> · {{ exam.duration_minutes }} นาที</template>
                    </span>
                  </span>
                  <span class="text-xs font-bold text-amber-700">เข้าสอบ</span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <section v-if="activeChapter.documents?.length"
            class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 class="font-bold text-slate-800">เอกสารประกอบบทนี้</h3>
            <ul class="mt-3 space-y-2">
              <li v-for="document in activeChapter.documents" :key="document.id"
                class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 px-3 py-2">
                <span>
                  <span class="block text-sm font-semibold text-slate-700">{{ document.title }}</span>
                  <span class="block text-xs text-slate-400">
                    {{ document.file_name }}<template v-if="document.file_size"> · {{ fileSizeLabel(document.file_size)
                      }}</template>
                  </span>
                </span>
                <a v-if="document.file_url" :href="document.file_url" target="_blank" rel="noopener"
                  class="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600">เปิดเอกสาร</a>
              </li>
            </ul>
          </section>
        </template>

        <div v-else class="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
          {{ chapters.length ? 'เลือกบทเรียนจากรายการด้านซ้าย' : 'คอร์สนี้ยังไม่มีบทเรียน' }}
        </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogItem, CourseChapter, CourseVideo } from '@/composables/useCart'
import { fileSizeLabel, lessonClock, watchStatusClass, watchStatusLabel } from '@/composables/useLessonPlayer'

definePageMeta({ layout: 'learn' })

const route = useRoute()
const router = useRouter()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { user } = useAuth()

const { data, pending, error, refresh } = useLazyAsyncData(
  () => `learn-${slug.value}`,
  () => api<{ data: CatalogItem }>(`/courses/${slug.value}`),
  { watch: [slug] },
)

const course = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))
const chapters = computed<CourseChapter[]>(() => course.value?.chapters ?? [])
const lessons = computed(() => chapters.value.flatMap(chapter => chapter.videos.filter(video => video.video_url)))

const {
  activeVideo,
  playerEl,
  resumedLabel,
  watchOf,
  chapterStatus,
  play,
  resume,
  onTimeUpdate,
  flushProgress,
} = useLessonPlayer(() => slug.value)

interface LessonStep {
  chapter: CourseChapter
  video: CourseVideo | null
}

const stageEl = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const watermarkSpot = reactive({ top: 8, left: 6 })
const watermark = computed(() => (user.value ? `${user.value.email} · #${user.value.id}` : ''))
let watermarkTimer: ReturnType<typeof setInterval> | undefined
let pendingSeek: number | null = null
let retriedVideoId: number | null = null

function moveWatermark() {
  watermarkSpot.top = 6 + Math.random() * 78
  watermarkSpot.left = 4 + Math.random() * 60
}

function syncFullscreen() {
  isFullscreen.value = Boolean(stageEl.value && document.fullscreenElement === stageEl.value)
}

async function toggleFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen()
  else await stageEl.value?.requestFullscreen?.()
}

function onLoaded(event: Event) {
  retriedVideoId = null
  resume(event)
  if (pendingSeek !== null) {
    (event.target as HTMLVideoElement).currentTime = pendingSeek
    pendingSeek = null
  }
}

async function onVideoError() {
  const current = activeVideo.value
  if (!current || retriedVideoId === current.id) return
  retriedVideoId = current.id
  pendingSeek = playerEl.value?.currentTime || null
  await refresh()
  const fresh = lessons.value.find(video => video.id === current.id)
  if (fresh?.video_url) {
    autoplay.value = true
    play(fresh)
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
  watermarkTimer = setInterval(moveWatermark, 15000)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  if (watermarkTimer) clearInterval(watermarkTimer)
})

const outlineOpen = ref(false)
const autoplay = ref(false)
const justFinished = ref(false)
const selectedChapterId = ref<number | null>(null)

const activeChapter = computed(() => chapters.value.find(chapter => chapter.id === selectedChapterId.value) ?? null)
const activeChapterIndex = computed(() => chapters.value.findIndex(chapter => chapter.id === selectedChapterId.value))
const completedCount = computed(() => lessons.value.filter(video => watchOf(video).status === 'completed').length)
const overallPercent = computed(() => (lessons.value.length ? Math.round(completedCount.value / lessons.value.length * 100) : 0))

const steps = computed<LessonStep[]>(() => chapters.value.flatMap((chapter) => {
  const playable = chapter.videos.filter(video => video.video_url)
  return playable.length ? playable.map(video => ({ chapter, video })) : [{ chapter, video: null }]
}))

const stepIndex = computed(() => steps.value.findIndex(step => (activeVideo.value
  ? step.video?.id === activeVideo.value.id
  : step.video === null && step.chapter.id === selectedChapterId.value)))
const previousStep = computed(() => (stepIndex.value > 0 ? steps.value[stepIndex.value - 1] ?? null : null))
const nextStep = computed(() => (stepIndex.value >= 0 ? steps.value[stepIndex.value + 1] ?? null : null))

function chapterMeta(chapter: CourseChapter) {
  const videos = chapter.videos.filter(video => video.video_url)
  if (!videos.length) {
    const extras = [
      chapter.documents?.length ? `เอกสาร ${chapter.documents.length}` : '',
      chapter.exams?.length ? `ข้อสอบ ${chapter.exams.length}` : '',
    ].filter(Boolean)
    return extras.length ? extras.join(' · ') : 'ยังไม่มีเนื้อหา'
  }
  const status = chapterStatus(chapter)
  if (status === 'completed') return 'ผ่านแล้ว'
  const seconds = videos.reduce((sum, video) => sum + (video.duration_seconds ?? 0), 0)
  const parts = [videos.length > 1 ? `${videos.length} วิดีโอ` : 'วิดีโอ', seconds ? lessonClock(seconds) : '']
  if (status === 'in_progress') parts.push('เรียนค้างอยู่')
  return parts.filter(Boolean).join(' · ')
}

function chapterDotClass(chapter: CourseChapter) {
  const status = chapterStatus(chapter)
  if (status === 'completed') return 'bg-emerald-500 text-white'
  if (status === 'in_progress') return 'bg-sky-100 text-sky-700 ring-2 ring-sky-400'
  return 'bg-slate-100 text-slate-500'
}

function chapterOf(video: CourseVideo) {
  return chapters.value.find(chapter => chapter.videos.some(item => item.id === video.id)) ?? null
}

function setQuery(video: CourseVideo | null, chapter: CourseChapter) {
  const query = video ? { video: String(video.id) } : { chapter: String(chapter.id) }
  if (route.query.video !== query.video || route.query.chapter !== query.chapter) router.replace({ query })
}

function select(video: CourseVideo | null | undefined, userAction: boolean) {
  if (!video?.video_url) return
  const chapter = chapterOf(video)
  autoplay.value = userAction
  justFinished.value = false
  selectedChapterId.value = chapter?.id ?? null
  play(video)
  if (userAction) outlineOpen.value = false
  if (chapter) setQuery(video, chapter)
}

function chapterStartVideo(chapter: CourseChapter) {
  const playable = chapter.videos.filter(video => video.video_url)
  return playable.find(video => watchOf(video).status === 'in_progress')
    ?? playable.find(video => watchOf(video).status !== 'completed')
    ?? playable[0]
    ?? null
}

function openChapterOnly(chapter: CourseChapter, userAction: boolean) {
  flushProgress(false)
  activeVideo.value = null
  justFinished.value = false
  selectedChapterId.value = chapter.id
  if (userAction) outlineOpen.value = false
  setQuery(null, chapter)
}

function selectChapter(chapter: CourseChapter, userAction = true) {
  const video = chapterStartVideo(chapter)
  if (video) select(video, userAction)
  else openChapterOnly(chapter, userAction)
}

function goTo(step: LessonStep | null) {
  if (!step) return
  if (step.video) select(step.video, true)
  else openChapterOnly(step.chapter, true)
}

function onEnded() {
  flushProgress(true)
  justFinished.value = true
}

function openInitial() {
  const fromVideo = lessons.value.find(video => String(video.id) === route.query.video)
  if (fromVideo) return select(fromVideo, false)
  const fromChapter = chapters.value.find(chapter => String(chapter.id) === route.query.chapter)
  if (fromChapter) return selectChapter(fromChapter, false)
  const resumable = lessons.value
    .filter(video => watchOf(video).status === 'in_progress')
    .sort((a, b) => (watchOf(b).last_watched_at ?? '').localeCompare(watchOf(a).last_watched_at ?? ''))[0]
  const video = resumable ?? lessons.value.find(entry => watchOf(entry).status !== 'completed') ?? lessons.value[0]
  if (video) return select(video, false)
  if (chapters.value[0]) selectChapter(chapters.value[0], false)
}

watch(course, (value) => {
  if (!value?.purchased) return
  if (!chapters.value.some(chapter => chapter.id === selectedChapterId.value)) openInitial()
}, { immediate: true })

useHead({ title: () => course.value ? `${course.value.name} | ห้องเรียน ClickClass Tutor` : 'ห้องเรียน | ClickClass Tutor' })
</script>
