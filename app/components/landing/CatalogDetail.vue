<template>
  <article class="mx-auto max-w-4xl px-4 py-8 md:px-6">
    <NuxtLink :to="backTo" class="text-sm font-bold text-blue-700">{{ backLabel }}</NuxtLink>
    <p v-if="pending" class="mt-6 text-sm text-slate-500">กำลังโหลด...</p>
    <p v-else-if="failed || !item" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ไม่พบรายการนี้</p>
    <div v-else class="mt-4 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
      <div class="overflow-hidden rounded-3xl bg-sky-50">
        <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="aspect-[4/3] w-full object-cover">
        <div v-else class="flex aspect-[4/3] items-center justify-center text-6xl" aria-hidden="true">{{ item.item_type === 'exam' ? '📝' : '📘' }}</div>
      </div>
      <div>
        <p class="text-sm text-slate-400">{{ metaLine }}</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">{{ item.name }}</h1>
        <p v-if="item.code" class="mt-2 text-sm text-slate-400">รหัส {{ item.code }}</p>
        <p v-if="item.instructor" class="mt-1 text-sm text-slate-600">ผู้สอน {{ item.instructor.name }}</p>
        <p v-if="item.short_description" class="mt-3 text-slate-600">{{ item.short_description }}</p>
        <div v-if="item.is_featured || item.is_trial_available || item.purchased" class="mt-3 flex flex-wrap gap-2">
          <span v-if="item.is_featured" class="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">แนะนำ</span>
          <span v-if="item.is_trial_available" class="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">ทดลองเรียนได้</span>
          <span v-if="item.purchased" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">มีสิทธิ์แล้ว</span>
        </div>
        <ul class="mt-4 space-y-1 text-sm text-slate-500">
          <li v-if="item.chapter_count">{{ item.chapter_count }} บท</li>
          <li v-if="item.course_count">{{ item.course_count }} คอร์สในหลักสูตร</li>
          <li v-if="item.duration_minutes">เวลาทำ {{ item.duration_minutes }} นาที</li>
          <li v-if="item.question_count">{{ item.question_count }} ข้อ</li>
        </ul>
        <div class="mt-4">
          <p v-if="item.sale_price && item.sale_price < item.price" class="text-sm text-slate-400 line-through">ราคาเต็ม {{ formatBaht(item.price) }}</p>
          <p v-if="item.sale_price && item.sale_price < item.price" class="text-sm text-slate-500">ราคาขาย {{ formatBaht(item.sale_price) }}</p>
          <p class="text-2xl font-extrabold text-blue-700">{{ formatBaht(item.effective_price) }}</p>
        </div>
        <button
          v-if="item.item_type !== 'exam' && !item.purchased"
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
          @click="addCatalog(item)"
        >
          <LearnIcon name="cart" class="h-4 w-4" />
          {{ inCart ? 'อยู่ในตะกร้า' : 'ใส่ตะกร้า' }}
        </button>
        <p v-else-if="item.item_type === 'exam'" class="mt-5 text-sm font-semibold text-slate-400">ยังไม่เปิดให้สั่งซื้อ</p>
      </div>
      <div v-if="item.description" class="md:col-span-2 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">รายละเอียด</h2>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{{ item.description }}</p>
      </div>
      <section v-if="item.item_type === 'course'" id="trial" class="md:col-span-2 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-extrabold text-slate-900">เนื้อหาทั้งหมด</h2>
          <button
            v-if="trialVideos.length"
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-sky-200 hover:bg-sky-600"
            @click="play(trialVideos[0])"
          >
            <LearnIcon name="play" class="h-4 w-4" />
            ดูวิดีโอทดลองเรียน
          </button>
        </div>
        <div v-if="resumeTarget && resumeTarget.video.id !== activeVideo?.id" class="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-900 px-4 py-3 text-white">
          <p class="text-sm">
            <span class="font-bold">ดูต่อ</span>
            {{ resumeTarget.video.title }}
            <span class="text-slate-300">ค้างที่ {{ clock(resumeTarget.progress.position_seconds) }}</span>
          </p>
          <button type="button" class="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600" @click="play(resumeTarget.video)">
            <LearnIcon name="play" class="h-3.5 w-3.5" />
            เล่นต่อ
          </button>
        </div>
        <div v-if="activeVideo?.video_url" class="overflow-hidden rounded-3xl bg-slate-900">
          <video
            :key="activeVideo.id"
            ref="playerEl"
            :src="activeVideo.video_url"
            controls
            autoplay
            class="aspect-video w-full"
            @loadedmetadata="resume"
            @timeupdate="onTimeUpdate"
            @pause="flushProgress(false)"
            @ended="flushProgress(true)"
          />
          <p class="px-4 py-3 text-sm font-semibold text-white">
            {{ activeVideo.title }}
            <span v-if="resumedLabel" class="ms-2 text-xs font-medium text-slate-300">{{ resumedLabel }}</span>
          </p>
        </div>
        <p v-else-if="item.is_trial_available && trialVideos.length === 0" class="rounded-3xl bg-white p-5 text-sm text-slate-500 ring-1 ring-slate-100">
          คอร์สนี้เปิดทดลองเรียน แต่ยังไม่มีคลิปทดลอง
        </p>
        <div v-if="item.chapters?.length" class="space-y-3">
          <article v-for="chapter in item.chapters" :key="chapter.id" class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-bold text-slate-800">{{ chapter.title }}</h3>
              <span v-if="chapter.videos.length" class="rounded-full px-2 py-0.5 text-xs font-bold" :class="statusClass(chapterStatus(chapter))">{{ statusLabel(chapterStatus(chapter)) }}</span>
            </div>
            <p v-if="chapter.description" class="mt-1 whitespace-pre-line text-sm text-slate-500">{{ chapter.description }}</p>
            <ul v-if="chapter.videos.length" class="mt-3 space-y-2">
              <li v-for="video in chapter.videos" :key="video.id" class="rounded-2xl bg-slate-50 px-3 py-2">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    <span class="block text-sm font-semibold text-slate-700">{{ video.title }}</span>
                    <span v-if="video.description" class="block text-xs text-slate-500">{{ video.description }}</span>
                    <span class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span v-if="video.duration_seconds">{{ durationLabel(video.duration_seconds) }}</span>
                      <span class="rounded-full px-2 py-0.5 font-bold" :class="statusClass(watchOf(video).status)">{{ statusLabel(watchOf(video).status) }}</span>
                      <span v-if="watchOf(video).status === 'in_progress'">ค้างที่ {{ clock(watchOf(video).position_seconds) }}</span>
                    </span>
                  </span>
                  <button
                    v-if="video.video_url"
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
                    @click="play(video)"
                  >
                    <LearnIcon name="play" class="h-3.5 w-3.5" />
                    {{ playLabel(video) }}
                  </button>
                  <span v-else class="text-xs font-semibold text-slate-400">ดูได้หลังซื้อคอร์ส</span>
                </div>
                <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <span class="block h-full rounded-full" :class="watchOf(video).status === 'completed' ? 'bg-emerald-500' : 'bg-sky-500'" :style="{ width: `${barPercent(video)}%` }" />
                </span>
              </li>
            </ul>
            <div v-if="chapter.documents?.length" class="mt-4">
              <h4 class="text-sm font-bold text-slate-500">เอกสาร</h4>
              <ul class="mt-2 space-y-2">
                <li v-for="document in chapter.documents" :key="document.id" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 px-3 py-2">
                  <span>
                    <span class="block text-sm font-semibold text-slate-700">{{ document.title }}</span>
                    <span v-if="document.description" class="block text-xs text-slate-500">{{ document.description }}</span>
                    <span class="mt-1 block text-xs text-slate-400">
                      <span v-if="document.file_name">{{ document.file_name }}</span>
                      <span v-if="document.file_size"> · {{ fileSizeLabel(document.file_size) }}</span>
                    </span>
                  </span>
                  <a
                    v-if="document.file_url"
                    :href="document.file_url"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
                  >
                    เปิดเอกสาร
                  </a>
                  <span v-else class="text-xs font-semibold text-slate-400">เปิดได้หลังซื้อคอร์ส</span>
                </li>
              </ul>
            </div>
            <div v-if="chapter.exams?.length" class="mt-4">
              <h4 class="text-sm font-bold text-slate-500">ข้อสอบ</h4>
              <ul class="mt-2 space-y-2">
                <li v-for="exam in chapter.exams" :key="exam.id">
                  <NuxtLink v-if="item.purchased" :to="`/exams/${exam.slug}`" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                    <span>
                      <span class="block text-sm font-semibold text-slate-700">{{ exam.name }}</span>
                      <span v-if="exam.description" class="block text-xs text-slate-500">{{ exam.description }}</span>
                      <span class="mt-1 block text-xs text-slate-400">
                        <span v-if="exam.question_count">{{ exam.question_count }} ข้อ</span>
                        <span v-if="exam.duration_minutes"> · {{ exam.duration_minutes }} นาที</span>
                      </span>
                    </span>
                    <span class="text-xs font-bold text-amber-700">เข้าสอบ</span>
                  </NuxtLink>
                  <div v-else class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                    <span>
                      <span class="block text-sm font-semibold text-slate-700">{{ exam.name }}</span>
                      <span v-if="exam.description" class="block text-xs text-slate-500">{{ exam.description }}</span>
                      <span class="mt-1 block text-xs text-slate-400">
                        <span v-if="exam.question_count">{{ exam.question_count }} ข้อ</span>
                        <span v-if="exam.duration_minutes"> · {{ exam.duration_minutes }} นาที</span>
                      </span>
                    </span>
                    <span class="text-xs font-semibold text-slate-400">ทำได้หลังซื้อคอร์ส</span>
                  </div>
                </li>
              </ul>
            </div>
          </article>
        </div>
        <p v-else class="rounded-3xl bg-white p-5 text-sm text-slate-500 ring-1 ring-slate-100">ยังไม่มีบทเรียนในคอร์สนี้</p>
        <section v-if="item.exams?.length" class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 class="font-bold text-slate-800">ข้อสอบของคอร์ส</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="exam in item.exams" :key="exam.id">
              <NuxtLink v-if="item.purchased" :to="`/exams/${exam.slug}`" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                <span>
                  <span class="block text-sm font-semibold text-slate-700">{{ exam.name }}</span>
                  <span v-if="exam.description" class="block text-xs text-slate-500">{{ exam.description }}</span>
                  <span class="mt-1 block text-xs text-slate-400">
                    <span v-if="exam.question_count">{{ exam.question_count }} ข้อ</span>
                    <span v-if="exam.duration_minutes"> · {{ exam.duration_minutes }} นาที</span>
                  </span>
                </span>
                <span class="text-xs font-bold text-amber-700">เข้าสอบ</span>
              </NuxtLink>
              <div v-else class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                <span>
                  <span class="block text-sm font-semibold text-slate-700">{{ exam.name }}</span>
                  <span v-if="exam.description" class="block text-xs text-slate-500">{{ exam.description }}</span>
                  <span class="mt-1 block text-xs text-slate-400">
                    <span v-if="exam.question_count">{{ exam.question_count }} ข้อ</span>
                    <span v-if="exam.duration_minutes"> · {{ exam.duration_minutes }} นาที</span>
                  </span>
                </span>
                <span class="text-xs font-semibold text-slate-400">ทำได้หลังซื้อคอร์ส</span>
              </div>
            </li>
          </ul>
        </section>
      </section>
      <div v-if="item.courses?.length" class="md:col-span-2">
        <h2 class="font-extrabold text-slate-900">คอร์สในหลักสูตร</h2>
        <ul class="mt-3 grid gap-3 sm:grid-cols-2">
          <li v-for="course in item.courses" :key="course.id">
            <NuxtLink :to="`/courses/${course.slug}`" class="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <img v-if="course.thumbnail_url" :src="course.thumbnail_url" :alt="course.name" class="h-16 w-16 rounded-2xl object-cover">
              <span v-else class="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-2xl" aria-hidden="true">📘</span>
              <span class="font-bold text-slate-800">{{ course.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CatalogItem, CourseChapter, CourseVideo, VideoWatchProgress } from '@/composables/useCart'

const props = defineProps<{
  item: CatalogItem | null
  pending?: boolean
  failed?: boolean
  backTo: string
  backLabel: string
}>()

const { addCatalog, quantityOf } = useCart()
const { api } = useApi()
const { loggedIn } = useAuth()
const activeVideo = ref<CourseVideo | null>(null)
const playerEl = ref<HTMLVideoElement | null>(null)
const resumedLabel = ref('')
const savedProgress = reactive<Record<number, VideoWatchProgress>>({})
const emptyProgress: VideoWatchProgress = { status: 'unwatched', position_seconds: 0, progress_percent: 0, last_watched_at: null }
let lastSentAt = 0
let saveChain: Promise<void> = Promise.resolve()

const trialVideos = computed(() => (props.item?.chapters ?? []).flatMap(chapter =>
  chapter.videos.filter(video => video.is_trial && video.video_url),
))

const resumeTarget = computed(() => {
  const rows = (props.item?.chapters ?? []).flatMap(chapter => chapter.videos).flatMap((video) => {
    const progress = watchOf(video)
    if (progress.status !== 'in_progress' || !video.video_url) return []
    return [{ video, progress }]
  })
  return rows.sort((a, b) => (b.progress.last_watched_at ?? '').localeCompare(a.progress.last_watched_at ?? ''))[0] ?? null
})

function watchOf(video: CourseVideo): VideoWatchProgress {
  return savedProgress[video.id] ?? video.progress ?? emptyProgress
}

function play(video: CourseVideo | undefined) {
  if (!video?.video_url) return
  flushProgress(false)
  resumedLabel.value = ''
  lastSentAt = 0
  activeVideo.value = video
}

function resume(event: Event) {
  const player = event.target as HTMLVideoElement
  const video = activeVideo.value
  if (!video) return
  const progress = watchOf(video)
  if (progress.status !== 'in_progress' || progress.position_seconds < 5) return
  const max = Number.isFinite(player.duration) ? Math.max(0, player.duration - 1) : progress.position_seconds
  player.currentTime = Math.min(progress.position_seconds, max)
  resumedLabel.value = `เล่นต่อจาก ${clock(player.currentTime)}`
}

function onTimeUpdate(event: Event) {
  const player = event.target as HTMLVideoElement
  if (!player.duration) return
  const ratio = player.currentTime / player.duration
  const now = Date.now()
  if (ratio >= 0.9) {
    if (now - lastSentAt < 3000) return
    lastSentAt = now
    void persist(player.currentTime, player.duration, true)
    return
  }
  if (now - lastSentAt < 10000) return
  lastSentAt = now
  void persist(player.currentTime, player.duration, false)
}

function flushProgress(completed: boolean) {
  const player = playerEl.value
  if (!player || !activeVideo.value?.video_url) return
  void persist(player.currentTime, player.duration || 0, completed)
}

function persist(position: number, duration: number, completed: boolean) {
  const video = activeVideo.value
  const slug = props.item?.item_type === 'course' ? props.item.slug : ''
  if (!loggedIn.value || !video || !slug) return Promise.resolve()
  if (!completed && position < 3) return Promise.resolve()

  const body = {
    position_seconds: Math.max(0, Math.floor(position)),
    duration_seconds: Math.max(0, Math.floor(duration)),
    completed,
  }

  saveChain = saveChain.then(async () => {
    try {
      const response = await api<{ data: VideoWatchProgress }>(`/courses/${slug}/videos/${video.id}/progress`, {
        method: 'PUT',
        body,
      })
      savedProgress[video.id] = response.data
    }
    catch {
      // Keep playback going when a progress save fails.
    }
  })

  return saveChain
}

function statusLabel(status: VideoWatchProgress['status']) {
  if (status === 'completed') return 'ผ่านแล้ว'
  if (status === 'in_progress') return 'ดูแล้ว'
  return 'ยังไม่ได้ดู'
}

function statusClass(status: VideoWatchProgress['status']) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in_progress') return 'bg-sky-100 text-sky-700'
  return 'bg-slate-200 text-slate-500'
}

function chapterStatus(chapter: CourseChapter): VideoWatchProgress['status'] {
  if (!chapter.videos.length) return 'unwatched'
  const statuses = chapter.videos.map(video => watchOf(video).status)
  if (statuses.every(status => status === 'completed')) return 'completed'
  if (statuses.every(status => status === 'unwatched')) return 'unwatched'
  return 'in_progress'
}

function playLabel(video: CourseVideo) {
  const status = watchOf(video).status
  if (status === 'completed') return 'ดูอีกครั้ง'
  if (status === 'in_progress') return 'ดูต่อ'
  return video.is_trial ? 'ดูคลิปทดลอง' : 'ดูวิดีโอ'
}

function barPercent(video: CourseVideo) {
  const progress = watchOf(video)
  if (progress.status === 'completed') return 100
  return Math.min(100, Math.max(0, progress.progress_percent))
}

function clock(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const remain = total % 60
  if (minutes === 0) return `${remain} วินาที`
  if (remain === 0) return `${minutes} นาที`
  return `${minutes} นาที ${remain} วินาที`
}

onUnmounted(() => {
  flushProgress(false)
})

function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function durationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  if (minutes === 0) return `${remain} วินาที`
  if (remain === 0) return `${minutes} นาที`
  return `${minutes} นาที ${remain} วินาที`
}

watch(trialVideos, (videos) => {
  if (window.location.hash === '#trial' && videos[0]) play(videos[0])
}, { immediate: true })

const inCart = computed(() => {
  const item = props.item
  if (!item || item.item_type === 'exam') return 0
  return quantityOf(item.item_type, item.id)
})

const metaLine = computed(() => {
  const item = props.item
  if (!item) return ''
  const type = item.item_type === 'curriculum' ? 'หลักสูตร' : item.item_type === 'exam' ? 'ข้อสอบ' : 'คอร์สเรียน'
  return [type, item.category?.name, item.subject?.name].filter(Boolean).join(' · ')
})
</script>
