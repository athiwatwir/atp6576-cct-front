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
          <span v-if="item.purchased" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            {{ item.access_expires_at ? `มีสิทธิ์ถึง ${formatThaiDate(item.access_expires_at)}` : 'มีสิทธิ์แบบไม่จำกัดเวลา' }}
          </span>
        </div>
        <ul class="mt-4 space-y-1 text-sm text-slate-500">
          <li v-if="item.chapter_count">{{ item.chapter_count }} บท</li>
          <li v-if="item.course_count">{{ item.course_count }} คอร์สในหลักสูตร</li>
          <li v-if="item.duration_minutes">เวลาทำ {{ item.duration_minutes }} นาที</li>
          <li v-if="item.question_count">{{ item.question_count }} ข้อ</li>
        </ul>
        <NuxtLink
          v-if="item.purchased && item.item_type !== 'exam'"
          :to="item.item_type === 'curriculum' ? `/learn/curriculums/${item.slug}` : `/learn/${item.slug}`"
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <LearnIcon name="classroom" class="h-4 w-4" />
          เข้าเรียน
        </NuxtLink>
        <template v-if="sellable">
          <fieldset v-if="plans.length > 1" id="plans" class="mt-5 scroll-mt-32">
            <legend class="text-sm font-bold text-slate-700">{{ item.purchased ? 'เลือกแพ็กเกจต่ออายุ' : 'เลือกแพ็กเกจ' }}</legend>
            <div class="mt-2 grid gap-2">
              <label
                v-for="plan in plans"
                :key="plan.id"
                class="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition"
                :class="plan.id === chosenPlanId ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-200'"
              >
                <input v-model="chosenPlanId" type="radio" :value="plan.id" name="price-plan" class="h-4 w-4 accent-blue-600">
                <span class="min-w-0 flex-1">
                  <span class="block font-bold text-slate-800">{{ plan.name }}</span>
                  <span class="block text-xs text-slate-500">{{ planDurationLabel(plan) }}</span>
                </span>
                <span class="text-end">
                  <span v-if="plan.sale_price && plan.sale_price < plan.price" class="block text-xs text-slate-400 line-through">{{ formatBaht(plan.price) }}</span>
                  <span class="block font-extrabold text-blue-700">{{ formatBaht(plan.effective_price) }}</span>
                </span>
              </label>
            </div>
          </fieldset>

          <div class="mt-4">
            <p v-if="displayPrice.sale_price && displayPrice.sale_price < displayPrice.price" class="text-sm text-slate-400 line-through">ราคาเต็ม {{ formatBaht(displayPrice.price) }}</p>
            <p class="text-2xl font-extrabold text-blue-700">{{ formatBaht(displayPrice.effective_price) }}</p>
            <p v-if="chosenPlan" class="mt-1 text-sm text-slate-500">{{ chosenPlan.name }} · {{ planDurationLabel(chosenPlan) }}</p>
            <p v-if="item.purchased && item.access_expires_at" class="mt-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              ซื้อเพิ่มตอนนี้ สิทธิ์จะต่อจากวันหมดอายุเดิม ({{ formatThaiDate(item.access_expires_at) }})
            </p>
          </div>
          <button
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            @click="addCatalog(item, chosenPlanId)"
          >
            <LearnIcon name="cart" class="h-4 w-4" />
            {{ cartLabel }}
          </button>
        </template>
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
        <div v-if="activeVideo?.video_url" class="select-none overflow-hidden rounded-3xl bg-slate-900" @contextmenu.prevent>
          <video
            :key="activeVideo.id"
            ref="playerEl"
            :src="activeVideo.video_url"
            controls
            controlslist="nodownload noremoteplayback"
            disablepictureinpicture
            disableremoteplayback
            playsinline
            draggable="false"
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
import { canRenew, planDurationLabel, type CatalogItem, type CourseVideo } from '@/composables/useCart'
import { fileSizeLabel, lessonClock, watchStatusClass, watchStatusLabel } from '@/composables/useLessonPlayer'

const props = defineProps<{
  item: CatalogItem | null
  pending?: boolean
  failed?: boolean
  backTo: string
  backLabel: string
}>()

const { addCatalog, quantityOf, planOf } = useCart()
const {
  activeVideo,
  playerEl,
  resumedLabel,
  watchOf,
  chapterStatus,
  barPercent,
  play,
  resume,
  onTimeUpdate,
  flushProgress,
} = useLessonPlayer(() => (props.item?.item_type === 'course' ? props.item.slug : ''))
const statusLabel = watchStatusLabel
const statusClass = watchStatusClass
const clock = lessonClock

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

function playLabel(video: CourseVideo) {
  const status = watchOf(video).status
  if (status === 'completed') return 'ดูอีกครั้ง'
  if (status === 'in_progress') return 'ดูต่อ'
  return video.is_trial ? 'ดูคลิปทดลอง' : 'ดูวิดีโอ'
}

const durationLabel = lessonClock

watch(trialVideos, (videos) => {
  if (window.location.hash === '#trial' && videos[0]) play(videos[0])
}, { immediate: true })

const inCart = computed(() => {
  const item = props.item
  if (!item) return 0
  return quantityOf(item.item_type, item.id)
})

const plans = computed(() => props.item?.price_plans ?? [])
const chosenPlanId = ref<number | null>(null)
const chosenPlan = computed(() => plans.value.find(plan => plan.id === chosenPlanId.value) ?? null)
const displayPrice = computed(() => chosenPlan.value ?? props.item ?? { price: 0, sale_price: null, effective_price: 0 })
const sellable = computed(() => Boolean(props.item && (!props.item.purchased || canRenew(props.item))))

const cartLabel = computed(() => {
  const item = props.item
  if (!item) return ''
  const cartPlanId = planOf(item.item_type, item.id)
  if (inCart.value) return cartPlanId === chosenPlanId.value ? 'อยู่ในตะกร้า' : 'เปลี่ยนเป็นแพ็กเกจนี้'
  return item.purchased ? 'ต่ออายุ ใส่ตะกร้า' : 'ใส่ตะกร้า'
})

watch(() => props.item, (item) => {
  if (!item) return
  const list = item.price_plans ?? []
  const cartPlanId = planOf(item.item_type, item.id)
  chosenPlanId.value = list.find(plan => plan.id === cartPlanId)?.id ?? list[0]?.id ?? null
  if (window.location.hash === '#plans') nextTick(() => document.getElementById('plans')?.scrollIntoView({ block: 'center' }))
}, { immediate: true })

const metaLine = computed(() => {
  const item = props.item
  if (!item) return ''
  const type = item.item_type === 'curriculum' ? 'หลักสูตร' : item.item_type === 'exam' ? 'ข้อสอบ' : 'คอร์สเรียน'
  return [type, item.category?.name, item.subject?.name].filter(Boolean).join(' · ')
})
</script>
