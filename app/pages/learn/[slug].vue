<template>
  <div>
    <PageLoading v-if="pending && !course" message="กำลังโหลดบทเรียน..." />
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

    <div v-else class="md:grid md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[21rem_minmax(0,1fr)]">
      <button type="button"
        class="sticky top-14 z-20 flex w-full items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 text-start backdrop-blur md:hidden"
        :aria-expanded="outlineOpen" aria-controls="lesson-outline" @click="outlineOpen = !outlineOpen">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LearnIcon name="course" class="h-5 w-5" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-extrabold text-slate-900">{{ activeChapter ? `บทที่ ${activeChapterIndex + 1} · ${activeChapter.title}` : 'บทเรียนทั้งหมด' }}</span>
          <span class="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span class="block h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-emerald-500" :style="{ width: `${overallPercent}%` }" />
            </span>
            เรียนแล้ว {{ overallPercent }}%
          </span>
        </span>
        <LearnIcon name="chevron" class="h-5 w-5 shrink-0 text-slate-400 transition" :class="{ 'rotate-180': outlineOpen }" />
      </button>

      <aside id="lesson-outline"
        class="border-e border-slate-200 bg-white md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] md:overflow-y-auto"
        :class="outlineOpen ? 'block' : 'hidden'">
        <div class="border-b border-slate-100 p-4">
          <div class="flex items-center gap-3">
            <img v-if="course.thumbnail_url" :src="course.thumbnail_url" :alt="course.name" class="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-slate-100">
            <span v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden="true">📘</span>
            <div class="min-w-0">
              <p class="text-xs font-bold text-blue-600">คอร์สเรียน</p>
              <h1 class="font-extrabold leading-snug text-slate-900">{{ course.name }}</h1>
            </div>
          </div>
          <p v-if="course.access_expires_at" class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            <LearnIcon name="clock" class="h-3.5 w-3.5" />
            ใช้ได้ถึง {{ formatThaiDate(course.access_expires_at) }}
          </p>
          <div class="mt-4 rounded-2xl bg-emerald-50/70 p-3">
            <div class="flex items-end justify-between">
              <span class="text-xs font-semibold text-slate-600">เรียนจบ {{ completedCount }} จาก {{ lessons.length }} คลิป</span>
              <span class="text-lg font-extrabold leading-none text-emerald-600">{{ overallPercent }}%</span>
            </div>
            <span class="mt-2 block h-2 overflow-hidden rounded-full bg-white">
              <span class="block h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${overallPercent}%` }" />
            </span>
          </div>
        </div>

        <nav aria-label="บทเรียน" class="p-2">
          <ul class="space-y-1">
            <li v-for="(chapter, chapterIndex) in chapters" :key="chapter.id">
              <button type="button" class="relative flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-start transition"
                :class="chapter.id === activeChapter?.id ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'"
                :aria-current="chapter.id === activeChapter?.id ? 'true' : undefined" @click="selectChapter(chapter)">
                <span v-if="chapter.id === activeChapter?.id" class="absolute inset-y-2 start-0 w-1 rounded-full bg-blue-600" aria-hidden="true" />
                <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  :class="chapterDotClass(chapter)" aria-hidden="true">
                  <LearnIcon v-if="chapterStatus(chapter) === 'completed'" name="check" class="h-4 w-4" />
                  <template v-else>{{ chapterIndex + 1 }}</template>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold leading-snug">{{ chapter.title }}</span>
                  <span class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-normal text-slate-400">
                    <span>{{ chapterMeta(chapter) }}</span>
                    <span v-if="chapter.documents?.length" class="inline-flex items-center gap-0.5 text-orange-500">
                      <LearnIcon name="book" class="h-3 w-3" />{{ chapter.documents.length }}
                    </span>
                    <span v-if="chapter.exams?.length" class="inline-flex items-center gap-0.5 text-amber-600">
                      <LearnIcon name="exam" class="h-3 w-3" />{{ chapter.exams.length }}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          </ul>

          <section v-if="course.exams?.length" class="mx-1 mt-3 rounded-2xl bg-amber-50 p-3">
            <p class="flex items-start gap-1.5 text-xs font-extrabold text-amber-700">
              <LearnIcon name="exam" class="mt-px h-4 w-4 shrink-0" />
              <span class="min-w-0">ข้อสอบของคอร์ส {{ course.name }}</span>
            </p>
            <ul class="mt-2 space-y-1.5">
              <li v-for="exam in course.exams" :key="exam.id">
                <button type="button"
                  class="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-start text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-amber-100 transition hover:ring-amber-300"
                  @click="openExam(exam.slug)">
                  <span class="min-w-0">{{ exam.name }}</span>
                  <span class="shrink-0 text-xs font-bold text-amber-600">เข้าสอบ</span>
                </button>
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
              class="relative select-none overflow-hidden bg-black shadow-lg shadow-slate-300/50"
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
                @timeupdate="onPlayerTime"
                @pause="flushProgress(false)"
                @ended="onEnded"
                @error="onVideoError"
              />
              <span
                v-if="watermark"
                class="pointer-events-none absolute start-3 top-3 z-10 max-w-[calc(100%-8rem)] truncate rounded bg-black/20 px-2 py-1 text-xs font-semibold text-white/40 sm:text-sm"
                aria-hidden="true"
              >{{ watermark }}</span>
              <button
                type="button"
                class="absolute end-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-black/70"
                :aria-label="isFullscreen ? 'ออกจากเต็มจอ' : 'ดูเต็มจอ'"
                @click="toggleFullscreen"
              >
                <LearnIcon :name="isFullscreen ? 'collapse' : 'expand'" class="h-4 w-4" />
                {{ isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ' }}
              </button>
            </div>
            <div v-else
              class="flex aspect-video flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100 text-center">
              <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <LearnIcon name="book" class="h-7 w-7" />
              </span>
              <p class="font-bold text-slate-700">บทนี้ไม่มีวิดีโอ</p>
              <p class="text-sm text-slate-500">ดูเอกสารและทำแบบทดสอบด้านล่างได้เลย</p>
            </div>

            <section class="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:p-5">
              <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">บทที่ {{ activeChapterIndex + 1 }} จาก {{ chapters.length }}</span>
                <span v-if="activeVideo" class="rounded-full px-2.5 py-1" :class="watchStatusClass(watchOf(activeVideo).status)">
                  {{ watchStatusLabel(watchOf(activeVideo).status) }}
                </span>
                <span v-if="activeVideo?.duration_seconds" class="inline-flex items-center gap-1 text-slate-400">
                  <LearnIcon name="clock" class="h-3.5 w-3.5" />
                  {{ lessonClock(activeVideo.duration_seconds) }}
                </span>
                <span v-if="resumedLabel" class="font-semibold text-sky-600">{{ resumedLabel }}</span>
              </div>
              <h2 class="mt-2 text-xl font-extrabold leading-snug text-slate-900 md:text-2xl">{{ activeChapter.title }}</h2>
              <p v-if="activeVideo && activeChapter.videos.length > 1" class="mt-0.5 text-sm font-semibold text-slate-500">{{ activeVideo.title }}</p>

              <div v-if="activeChapter.videos.length > 1" class="mt-3 flex flex-wrap gap-2" aria-label="วิดีโอในบทนี้">
                <button v-for="(video, videoIndex) in activeChapter.videos" :key="video.id" type="button"
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-40"
                  :class="video.id === activeVideo?.id ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : watchOf(video).status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
                  :disabled="!video.video_url" @click="select(video, true)">
                  <LearnIcon v-if="watchOf(video).status === 'completed'" name="check" class="h-3.5 w-3.5" />
                  ตอนที่ {{ videoIndex + 1 }}
                </button>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <button type="button"
                  class="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-start transition hover:bg-slate-50 disabled:opacity-40"
                  :disabled="!previousStep" @click="goTo(previousStep)">
                  <LearnIcon name="arrow" class="h-4 w-4 shrink-0 rotate-180 text-slate-400" />
                  <span class="min-w-0">
                    <span class="block text-xs font-semibold text-slate-400">ก่อนหน้า<template v-if="previousStep"> · {{ stepKicker(previousStep) }}</template></span>
                    <span class="block truncate text-sm font-bold text-slate-700">{{ previousStep ? stepLabel(previousStep) : '-' }}</span>
                  </span>
                </button>
                <button type="button"
                  class="flex min-w-0 items-center justify-end gap-2 rounded-2xl bg-blue-600 px-3 py-2.5 text-end text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  :disabled="!nextStep" @click="goTo(nextStep)">
                  <span class="min-w-0">
                    <span class="block text-xs font-semibold text-blue-100">ถัดไป<template v-if="nextStep"> · {{ stepKicker(nextStep) }}</template></span>
                    <span class="block truncate text-sm font-bold">{{ nextStep ? stepLabel(nextStep) : 'บทสุดท้ายแล้ว' }}</span>
                  </span>
                  <LearnIcon name="arrow" class="h-4 w-4 shrink-0" />
                </button>
              </div>
            </section>

            <div v-if="justFinished" class="mt-4 flex flex-wrap items-center gap-3 rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <LearnIcon name="check" class="h-5 w-5" />
              </span>
              <p class="min-w-0 flex-1 text-sm text-emerald-800">
                <span class="block font-extrabold">{{ courseDone ? 'เรียนครบทุกคลิปแล้ว เก่งมาก!' : 'ดูคลิปนี้จบแล้ว' }}</span>
                <span v-if="nextStep" class="block">ถัดไป {{ stepKicker(nextStep) }}: {{ stepLabel(nextStep) }}</span>
              </p>
              <button v-if="nextStep" type="button" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700" @click="goTo(nextStep)">
                เรียนต่อ
                <LearnIcon name="arrow" class="h-4 w-4" />
              </button>
            </div>

            <VideoRatingCard
              v-if="activeVideo && showRating"
              :key="`rating-${activeVideo.id}`"
              class="mt-4"
              :course-slug="course.slug"
              :video="activeVideo"
              @saved="activeVideo.my_rating = $event"
            />

            <section v-if="lessonDescription" class="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:p-5">
              <h3 class="text-sm font-extrabold text-slate-900">เกี่ยวกับบทเรียนนี้</h3>
              <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600" :class="{ 'line-clamp-3': !descriptionOpen }">{{ lessonDescription }}</p>
              <button v-if="lessonDescription.length > 160" type="button" class="mt-1 text-sm font-bold text-blue-700 hover:underline" @click="descriptionOpen = !descriptionOpen">
                {{ descriptionOpen ? 'ย่อ' : 'อ่านเพิ่ม' }}
              </button>
            </section>

            <div v-if="activeChapter.documents?.length || activeChapter.exams?.length" class="mt-4 grid gap-4" :class="{ 'lg:grid-cols-2': activeChapter.documents?.length && activeChapter.exams?.length }">
              <section v-if="activeChapter.exams?.length" class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:p-5">
                <h3 class="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><LearnIcon name="exam" class="h-4 w-4" /></span>
                  แบบทดสอบท้ายบท
                </h3>
                <ul class="mt-3 space-y-2">
                  <li v-for="exam in activeChapter.exams" :key="exam.id">
                    <button type="button"
                      class="flex w-full items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2.5 text-start transition hover:bg-amber-100"
                      @click="openExam(exam.slug)">
                      <span class="min-w-0">
                        <span class="block text-sm font-bold text-slate-800">{{ exam.name }}</span>
                        <span class="block text-xs text-slate-500">
                          <template v-if="exam.question_count">{{ exam.question_count }} ข้อ</template>
                          <template v-if="exam.duration_minutes"> · {{ exam.duration_minutes }} นาที</template>
                        </span>
                      </span>
                      <span class="shrink-0 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white">เข้าสอบ</span>
                    </button>
                  </li>
                </ul>
              </section>

              <section v-if="activeChapter.documents?.length" class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:p-5">
                <h3 class="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><LearnIcon name="book" class="h-4 w-4" /></span>
                  เอกสารประกอบ
                </h3>
                <ul class="mt-3 space-y-2">
                  <li v-for="document in activeChapter.documents" :key="document.id">
                    <component :is="document.file_url ? 'a' : 'div'" :href="document.file_url ?? undefined" target="_blank" rel="noopener"
                      class="flex items-center justify-between gap-3 rounded-2xl bg-orange-50 px-3 py-2.5 transition" :class="{ 'hover:bg-orange-100': document.file_url }">
                      <span class="min-w-0">
                        <span class="block truncate text-sm font-bold text-slate-800">{{ document.title }}</span>
                        <span class="block truncate text-xs text-slate-500">
                          {{ document.file_name }}<template v-if="document.file_size"> · {{ fileSizeLabel(document.file_size) }}</template>
                        </span>
                      </span>
                      <span v-if="document.file_url" class="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">เปิด</span>
                    </component>
                  </li>
                </ul>
              </section>
            </div>
          </template>

          <div v-else class="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><LearnIcon name="course" class="h-7 w-7" /></span>
            <p class="text-sm text-slate-500">{{ chapters.length ? 'เลือกบทเรียนจากรายการด้านซ้าย' : 'คอร์สนี้ยังไม่มีบทเรียน' }}</p>
          </div>
        </div>
      </main>
    </div>

    <Teleport to="body">
      <div v-if="examSlug" class="fixed inset-0 z-50 flex justify-center bg-slate-900/60 sm:items-center sm:p-4"
        @click.self="requestCloseExam">
        <div role="dialog" aria-modal="true" aria-labelledby="exam-modal-title"
          class="flex h-full w-full flex-col overflow-hidden bg-slate-50 shadow-2xl sm:h-[min(92vh,56rem)] sm:max-w-3xl sm:rounded-3xl">
          <header class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <p id="exam-modal-title" class="flex min-w-0 items-center gap-2 text-sm font-extrabold text-slate-900">
              <LearnIcon name="exam" class="h-4 w-4 shrink-0 text-amber-500" />
              <span class="truncate">{{ examTitle }}</span>
            </p>
            <button type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="ปิดข้อสอบ" @click="requestCloseExam">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>
          <div data-exam-scroll class="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <ExamRunner :slug="examSlug" embedded exit-label="กลับไปเรียนต่อ" @exit="closeExam"
              @taking="examTaking = $event" />
          </div>
        </div>

        <div v-if="leaveConfirm" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
          @click.self="leaveConfirm = false">
          <div role="alertdialog" aria-modal="true" aria-labelledby="exam-leave-title"
            class="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h2 id="exam-leave-title" class="text-lg font-extrabold text-slate-900">ออกจากข้อสอบตอนนี้ไหม</h2>
            <p class="mt-2 text-sm text-slate-600">คำตอบที่เลือกไว้ยังอยู่ กดเข้าสอบอีกครั้งเพื่อทำต่อได้ แต่เวลาสอบยังเดินอยู่</p>
            <div class="mt-5 grid grid-cols-2 gap-2">
              <button type="button"
                class="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                @click="closeExam">ออกก่อน</button>
              <button type="button"
                class="rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600"
                @click="leaveConfirm = false">ทำข้อสอบต่อ</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
const watermark = computed(() => (user.value ? `${user.value.email || user.value.phone || user.value.name} · #${user.value.id}` : ''))
let pendingSeek: number | null = null
let retriedVideoId: number | null = null

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
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
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
const courseDone = computed(() => lessons.value.length > 0 && completedCount.value === lessons.value.length)
const RATING_UNLOCK_RATIO = 0.2
const ratingUnlocked = reactive(new Set<number>())

const showRating = computed(() => {
  const video = activeVideo.value
  if (!video) return false
  const progress = watchOf(video)
  return Boolean(video.my_rating)
    || justFinished.value
    || progress.status === 'completed'
    || progress.progress_percent >= RATING_UNLOCK_RATIO * 100
    || ratingUnlocked.has(video.id)
})

function onPlayerTime(event: Event) {
  onTimeUpdate(event)
  const player = event.target as HTMLVideoElement
  const video = activeVideo.value
  if (video && player.duration && player.currentTime / player.duration >= RATING_UNLOCK_RATIO) ratingUnlocked.add(video.id)
}
const lessonDescription = computed(() => activeVideo.value?.description || activeChapter.value?.description || '')
const descriptionOpen = ref(false)

watch(() => [selectedChapterId.value, activeVideo.value?.id], () => {
  descriptionOpen.value = false
})

function isPartStep(step: LessonStep) {
  return step.chapter.id === activeChapter.value?.id && Boolean(step.video) && step.chapter.videos.length > 1
}

function stepKicker(step: LessonStep) {
  if (isPartStep(step)) return `ตอนที่ ${step.chapter.videos.findIndex(video => video.id === step.video?.id) + 1}`
  return `บทที่ ${chapters.value.findIndex(chapter => chapter.id === step.chapter.id) + 1}`
}

function stepLabel(step: LessonStep) {
  return isPartStep(step) ? step.video!.title : step.chapter.title
}

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
  const query: Record<string, string> = video ? { video: String(video.id) } : { chapter: String(chapter.id) }
  if (examSlug.value) query.exam = examSlug.value
  if (route.query.video !== query.video || route.query.chapter !== query.chapter || route.query.exam !== query.exam) {
    router.replace({ query })
  }
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

const examSlug = ref<string | null>(null)
const examTaking = ref(false)
const leaveConfirm = ref(false)
let initialExam = typeof route.query.exam === 'string' ? route.query.exam : ''

const courseExams = computed(() => [
  ...(course.value?.exams ?? []),
  ...chapters.value.flatMap(chapter => chapter.exams ?? []),
])
const examTitle = computed(() => courseExams.value.find(exam => exam.slug === examSlug.value)?.name ?? 'ข้อสอบ')

function syncExamQuery() {
  if (activeChapter.value) setQuery(activeVideo.value, activeChapter.value)
}

function openExam(slugValue: string) {
  playerEl.value?.pause()
  examTaking.value = false
  leaveConfirm.value = false
  examSlug.value = slugValue
  outlineOpen.value = false
  syncExamQuery()
}

function closeExam() {
  examSlug.value = null
  examTaking.value = false
  leaveConfirm.value = false
  syncExamQuery()
}

function requestCloseExam() {
  if (examTaking.value) leaveConfirm.value = true
  else closeExam()
}

function onExamKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !examSlug.value) return
  if (leaveConfirm.value) leaveConfirm.value = false
  else requestCloseExam()
}

watch(examSlug, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onExamKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onExamKeydown)
  document.body.style.overflow = ''
})

watch(course, (value) => {
  if (!value?.purchased) return
  if (initialExam && courseExams.value.some(exam => exam.slug === initialExam)) openExam(initialExam)
  initialExam = ''
  if (!chapters.value.some(chapter => chapter.id === selectedChapterId.value)) openInitial()
}, { immediate: true })

useHead({ title: () => course.value ? `${course.value.name} | ห้องเรียน ClickClass Tutor` : 'ห้องเรียน | ClickClass Tutor' })
</script>
