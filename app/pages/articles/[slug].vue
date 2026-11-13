<template>
  <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
    <NuxtLink to="/#articles" class="text-sm font-bold text-blue-700">กลับหน้าแรก</NuxtLink>
    <PageLoading v-if="pending" message="กำลังโหลดบทความ..." />
    <p v-else-if="failed || !article" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ไม่พบบทความนี้</p>

    <div v-else class="mt-4 grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article class="min-w-0">
        <p v-if="article.published_at" class="text-sm text-slate-400">{{ publishedLabel(article.published_at) }}</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">{{ article.title }}</h1>
        <p v-if="article.excerpt" class="mt-3 text-slate-600">{{ article.excerpt }}</p>
        <img v-if="article.image_url" :src="article.image_url" :alt="article.title" class="mt-5 w-full rounded-3xl object-cover">
        <div v-if="article.content" class="article-content mt-6 space-y-3 text-sm leading-7 text-slate-700" v-html="article.content" />

        <section v-if="related.length" class="mt-10" aria-labelledby="related-title" aria-roledescription="carousel"
          @mouseenter="hovering = true" @mouseleave="hovering = false" @focusin="hovering = true" @focusout="hovering = false">
          <div class="flex items-end justify-between gap-3">
            <div>
              <h2 id="related-title" class="text-2xl font-extrabold text-slate-900">คอร์สเรียนที่เกี่ยวข้อง</h2>
              <p class="mt-1 text-sm text-slate-500">คอร์ส หลักสูตร และข้อสอบที่เกี่ยวกับบทความนี้</p>
            </div>
            <div v-if="canSlide" class="flex shrink-0 gap-2">
              <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700"
                aria-label="ก่อนหน้า" @click="step(-1)">
                <LearnIcon name="arrow" class="h-4 w-4 rotate-180" />
              </button>
              <button type="button" class="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700"
                aria-label="ถัดไป" @click="step(1)">
                <LearnIcon name="arrow" class="h-4 w-4" />
              </button>
            </div>
          </div>
          <div ref="trackEl"
            class="related-track -mx-1 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
            @scroll.passive="onTrackScroll" @touchstart.passive="touching = true" @touchend.passive="touching = false">
            <NuxtLink
              v-for="(item, index) in related"
              :key="`${item.kind}-${item.id}`"
              :to="item.to"
              :aria-label="`${index + 1} จาก ${related.length}: ${item.name}`"
              class="group w-[85%] shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md sm:w-[calc(50%-0.5rem)] md:w-[85%] lg:w-[calc(50%-0.5rem)]"
            >
              <div class="relative aspect-video bg-gradient-to-br from-sky-100 to-blue-50">
                <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="h-full w-full object-cover">
                <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'" class="absolute inset-0 m-auto h-10 w-10 text-blue-300" />
                <span class="absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold" :class="item.chip">{{ item.kindLabel }}</span>
              </div>
              <div class="p-4">
                <h3 class="font-bold text-slate-800 group-hover:text-blue-700">{{ item.name }}</h3>
                <span class="mt-2 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  ดูรายละเอียด
                  <LearnIcon name="arrow" class="h-3.5 w-3.5" />
                </span>
              </div>
            </NuxtLink>
          </div>
          <div v-if="canSlide" class="mt-3 flex justify-center gap-1.5">
            <button v-for="(item, index) in related" :key="`dot-${item.kind}-${item.id}`" type="button"
              class="h-2 rounded-full transition-all"
              :class="index === activeIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'"
              :aria-label="`ไปที่รายการที่ ${index + 1}`" :aria-current="index === activeIndex" @click="goTo(index)" />
          </div>
        </section>
      </article>

      <aside v-if="suggestionsPending || suggestions.length" class="md:sticky md:top-32 md:self-start" aria-labelledby="suggested-title">
        <h2 id="suggested-title" class="flex items-center gap-2 text-xl font-extrabold text-slate-900">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <LearnIcon name="course" class="h-4 w-4" />
          </span>
          คอร์สเรียนแนะนำ
        </h2>
        <div v-if="suggestionsPending && !suggestions.length" class="mt-4 space-y-3">
          <div v-for="index in 3" :key="index" class="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
        </div>
        <ul v-else class="mt-4 space-y-3">
          <li v-for="course in suggestions" :key="`${course.item_type}-${course.id}`">
            <NuxtLink
              :to="`/${course.item_type === 'curriculum' ? 'curriculums' : 'courses'}/${course.slug}`"
              class="group flex gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-blue-200"
            >
              <span class="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-sky-100">
                <img v-if="course.thumbnail_url" :src="course.thumbnail_url" :alt="course.name" class="h-full w-full object-cover" loading="lazy">
                <LearnIcon v-else name="course" class="absolute inset-0 m-auto h-7 w-7 text-blue-300" />
                <span v-if="course.is_featured" class="absolute start-1 top-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-amber-950">แนะนำ</span>
              </span>
              <span class="min-w-0 py-0.5">
                <span class="line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-blue-700">{{ course.name }}</span>
                <span class="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-xs">
                  <span v-if="course.sale_price && course.sale_price < course.price" class="text-slate-400 line-through">{{ formatBaht(course.price) }}</span>
                  <span class="font-extrabold text-orange-600">{{ hasPlanChoice(course) ? `เริ่มต้น ${formatBaht(course.effective_price)}` : formatBaht(course.effective_price) }}</span>
                </span>
              </span>
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/courses" class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline">
          ดูคอร์สทั้งหมด
          <LearnIcon name="arrow" class="h-3.5 w-3.5" />
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hasPlanChoice, type CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

interface ArticleSummary {
  id: number
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  published_at?: string | null
  seo?: {
    title: string
    description: string | null
    keywords: string | null
    image_url: string | null
  }
}

interface RelatedEntry {
  id: number
  slug: string
  name: string
  thumbnail_url: string | null
}

interface ArticleDetail extends ArticleSummary {
  content?: string | null
  related?: {
    courses?: RelatedEntry[]
    curriculums?: RelatedEntry[]
    exams?: RelatedEntry[]
  }
}

const SUGGESTION_LIMIT = 5

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `article-${slug.value}`,
  () => api<{ data: ArticleDetail }>(`/articles/${slug.value}`),
  { watch: [slug] },
)

/** คอร์สและหลักสูตรที่ตั้งเป็นแนะนำ ถ้าไม่มีเลยใช้รายการล่าสุดแทน */
const { data: suggestionResponse, pending: suggestionsPending } = useLazyAsyncData('article-suggested-courses', async () => {
  const query = { type: 'course,curriculum', per_page: SUGGESTION_LIMIT + 6 }
  const featured = await api<{ data: CatalogItem[] }>('/catalog', { query: { ...query, featured: 1 } })
  return featured.data.length ? featured : api<{ data: CatalogItem[] }>('/catalog', { query })
})

const article = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

const suggestions = computed(() => {
  const shown = new Set(related.value.map(item => `${item.kind}-${item.id}`))
  return (suggestionResponse.value?.data ?? [])
    .filter(course => !shown.has(`${course.item_type}-${course.id}`))
    .slice(0, SUGGESTION_LIMIT)
})

const related = computed(() => {
  const groups = article.value?.related
  if (!groups) return []
  return [
    ...(groups.courses ?? []).map(item => ({ ...item, kind: 'course' as const, kindLabel: 'คอร์ส', chip: 'bg-blue-100 text-blue-700', to: `/courses/${item.slug}` })),
    ...(groups.curriculums ?? []).map(item => ({ ...item, kind: 'curriculum' as const, kindLabel: 'หลักสูตร', chip: 'bg-sky-100 text-sky-700', to: `/curriculums/${item.slug}` })),
    ...(groups.exams ?? []).map(item => ({ ...item, kind: 'exam' as const, kindLabel: 'ข้อสอบ', chip: 'bg-amber-100 text-amber-700', to: `/exams/${item.slug}` })),
  ]
})

const AUTO_SLIDE_MS = 4000
const trackEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const canSlide = ref(false)
const hovering = ref(false)
const touching = ref(false)
let slideTimer: ReturnType<typeof setInterval> | undefined

/** ระยะเลื่อนต่อการ์ดหนึ่งใบ (ความกว้างการ์ด + ช่องว่าง) */
function cardStep() {
  const track = trackEl.value
  const first = track?.children[0] as HTMLElement | undefined
  if (!track || !first) return 0
  const second = track.children[1] as HTMLElement | undefined
  return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
}

function measure() {
  const track = trackEl.value
  canSlide.value = Boolean(track && track.scrollWidth - track.clientWidth > 4)
}

function goTo(index: number) {
  const track = trackEl.value
  if (!track) return
  const count = related.value.length
  const target = ((index % count) + count) % count
  const maxScroll = track.scrollWidth - track.clientWidth
  track.scrollTo({ left: Math.min(target * cardStep(), maxScroll) })
  activeIndex.value = target
}

function step(direction: 1 | -1) {
  const track = trackEl.value
  if (!track) return
  const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4
  if (direction === 1 && atEnd) return goTo(0)
  if (direction === -1 && track.scrollLeft <= 4) return goTo(related.value.length - 1)
  goTo(activeIndex.value + direction)
}

function onTrackScroll() {
  const track = trackEl.value
  const size = cardStep()
  if (!track || !size) return
  const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4
  activeIndex.value = atEnd ? related.value.length - 1 : Math.round(track.scrollLeft / size)
}

function stopAutoSlide() {
  clearInterval(slideTimer)
  slideTimer = undefined
}

function startAutoSlide() {
  stopAutoSlide()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  slideTimer = setInterval(() => {
    if (!canSlide.value || hovering.value || touching.value || document.hidden) return
    step(1)
  }, AUTO_SLIDE_MS)
}

watch(related, async () => {
  activeIndex.value = 0
  await nextTick()
  trackEl.value?.scrollTo({ left: 0 })
  measure()
})

onMounted(() => {
  window.addEventListener('resize', measure)
  nextTick(measure)
  startAutoSlide()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  stopAutoSlide()
})

function publishedLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date)
}

const pageTitle = computed(() => {
  if (!article.value) return 'บทความ | ClickClass Tutor'
  const seoTitle = article.value.seo?.title
  if (seoTitle && seoTitle !== article.value.title) return seoTitle
  return `${article.value.title} | ClickClass Tutor`
})

useSeoMeta({
  title: () => pageTitle.value,
  description: () => article.value?.seo?.description ?? article.value?.excerpt ?? undefined,
  keywords: () => article.value?.seo?.keywords ?? undefined,
  ogTitle: () => article.value?.seo?.title || article.value?.title,
  ogDescription: () => article.value?.seo?.description ?? article.value?.excerpt ?? undefined,
  ogImage: () => article.value?.seo?.image_url ?? article.value?.image_url ?? undefined,
})
</script>

<style scoped>
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.article-content :deep(a) {
  font-weight: 700;
  color: #1d4ed8;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-inline-start: 1.25rem;
}

.article-content :deep(ul) {
  list-style: disc;
}

.article-content :deep(ol) {
  list-style: decimal;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 1rem;
}

.related-track {
  scrollbar-width: none;
}

.related-track::-webkit-scrollbar {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .related-track {
    scroll-behavior: auto;
  }
}
</style>
