<template>
  <div>
    <HomeBannerSlider :banners="banners" :pending="pending" />

    <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-12">
      <div class="relative">
        <span v-for="deco in HERO_DECOS" :key="deco.icon"
          class="hx-deco pointer-events-none absolute hidden text-2xl md:block" :style="deco.style"
          aria-hidden="true">{{ deco.icon }}</span>


        <h1 class="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          <span class="hx-rise me-3 inline-block" style="--d: 0.15s">เรียนสนุก</span>
          <span class="hx-rise inline-block" style="--d: 0.3s">เข้าใจง่าย</span><br>
          <span
            class="hx-pop inline-block bg-gradient-to-r from-blue-600 via-sky-400 to-orange-500 bg-clip-text text-transparent"
            style="--d: 0.5s">เก่งขึ้นได้ทุกวัน!</span>
        </h1>
        <p class="hx-rise mt-4 max-w-md text-base text-slate-600" style="--d: 0.65s">
          คอร์สเรียนออนไลน์ เข้าใจง่าย เรียนได้ทุกที่ ทุกเวลา
        </p>
        <div class="hx-rise mt-6 flex flex-wrap gap-3" style="--d: 0.8s">
          <NuxtLink to="/signup"
            class="hx-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]">
            <span class="hx-cta-shine pointer-events-none absolute inset-y-0 -start-1/3 w-1/3" aria-hidden="true" />
            <span class="hx-play flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
              <LearnIcon name="play" class="h-3.5 w-3.5" />
            </span>
            เริ่มเรียนกันเลย!
          </NuxtLink>
          <NuxtLink to="/signin"
            class="group inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50">
            <LearnIcon name="login" class="h-4 w-4 transition group-hover:translate-x-0.5" />
            เข้าสู่ระบบ
          </NuxtLink>
        </div>
      </div>
      <NuxtLink :to="loggedIn ? '/home' : { path: '/signin', query: { redirect: '/home' } }"
        class="group flex flex-col items-center gap-4 rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6 text-center shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-1 hover:shadow-lg hover:ring-blue-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 sm:flex-row sm:gap-5 sm:text-start lg:gap-6 lg:p-8">
        <img src="/images/icon/clickclass-icon-01.webp" alt="" width="480" height="480" loading="lazy" decoding="async"
          class="h-40 w-40 shrink-0 object-contain drop-shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:h-36 sm:w-36 lg:h-44 lg:w-44">
        <div class="min-w-0 flex-1">
          <p class="text-lg font-bold text-blue-800">เข้าห้องเรียน</p>
          <p class="mt-1 text-sm text-slate-500">{{ loggedIn ? 'เรียนต่อจากที่ค้างไว้ได้เลย' :
            'เข้าห้องเรียนได้หลังเข้าสู่ระบบ' }}</p>
          <span
            class="mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition group-hover:bg-blue-700 lg:gap-2 lg:px-5">
            <LearnIcon :name="loggedIn ? 'classroom' : 'login'" class="h-4 w-4" />
            {{ loggedIn ? 'ไปที่ห้องเรียน' : 'เข้าสู่ระบบเพื่อเข้าเรียน' }}
            <LearnIcon name="arrow" class="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </NuxtLink>
    </section>

    <section id="courses" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <CatalogGrid title="คอร์สเรียน" description="คอร์สและหลักสูตรที่เปิดขายทั้งหมด" :items="catalog"
        :pending="catalogPending" :failed="catalogFailed" purchasable heading="h2" icon="course"
        chip="bg-blue-100 text-blue-600" :columns="3" />
    </section>

    <section id="exams" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <CatalogGrid title="ข้อสอบ" description="ข้อสอบที่เปิดขายแยกจากคอร์ส" :items="exams" :pending="examsPending"
        :failed="examsFailed" purchasable heading="h2" icon="exam" chip="bg-amber-100 text-amber-600" />
    </section>

    <section id="books" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <HomeBookGrid :books="books" :pending="booksPending" :failed="booksFailed" :total="bookTotal" />
    </section>

    <HomeReviewSlider id="reviews" :reviews="reviews" :pending="reviewsPending" />

    <section id="articles" v-if="articlesPending || articles.length || articlesFailed"
      class="mx-auto max-w-6xl px-4 pb-12 md:px-6">
      <h2 class="text-3xl font-extrabold text-slate-900">บทความ</h2>
      <p class="mt-1 text-sm text-slate-500">เรื่องที่เผยแพร่ล่าสุด</p>
      <p v-if="articlesFailed" class="mt-4 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
        โหลดบทความไม่สำเร็จ</p>
      <div v-else-if="articlesPending" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="index in 3" :key="index" class="h-40 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
      </div>
      <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="article in articles" :key="article.id" :to="`/articles/${article.slug}`"
          class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <img v-if="article.image_url" :src="article.image_url" :alt="article.title"
            class="aspect-[16/9] w-full object-cover">
          <div class="p-4">
            <p v-if="article.published_at" class="text-xs text-slate-400">{{ publishedLabel(article.published_at) }}</p>
            <h3 class="mt-1 font-bold text-slate-800">{{ article.title }}</h3>
            <p v-if="article.excerpt" class="mt-1 text-sm text-slate-500">{{ article.excerpt }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>


  </div>
</template>

<script setup lang="ts">
import type { HomeBanner } from '@/components/landing/HomeBannerSlider.vue'
import type { HomeReview } from '@/components/landing/HomeReviewSlider.vue'
import type { CatalogItem, StoreBook } from '@/composables/useCart'

const { loggedIn } = useAuth()

interface ArticleSummary {
  id: number
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  published_at: string | null
}

definePageMeta({ layout: 'landing' })

const { api } = useApi()
const { fetchAll } = useStorefront()

const { data: bannerResponse, pending } = useLazyAsyncData('home-banners', () =>
  api<{ data: HomeBanner[] }>('/banners', { query: { placement: 'home' } }),
)

const { data: bookResponse, pending: booksPending, error: booksError } = useLazyAsyncData('home-books', () =>
  fetchAll<StoreBook>('/books'),
)

const { data: catalogResponse, pending: catalogPending, error: catalogError } = useLazyAsyncData('home-catalog', () =>
  fetchAll<CatalogItem>('/catalog', { type: 'course,curriculum' }),
)

const { data: examResponse, pending: examsPending, error: examsError } = useLazyAsyncData('home-exams', () =>
  fetchAll<CatalogItem>('/catalog', { type: 'exam' }),
)

const { data: articleResponse, pending: articlesPending, error: articlesError } = useLazyAsyncData('home-articles', () =>
  fetchAll<ArticleSummary>('/articles'),
)

const { data: reviewResponse, pending: reviewsPending } = useLazyAsyncData('home-reviews', () =>
  api<{ data: HomeReview[] }>('/reviews'),
)

const banners = computed(() => bannerResponse.value?.data ?? [])
const reviews = computed(() => reviewResponse.value?.data ?? [])
const books = computed(() => bookResponse.value?.data ?? [])
const catalog = computed(() => catalogResponse.value?.data ?? [])
const exams = computed(() => examResponse.value?.data ?? [])
const articles = computed(() => articleResponse.value?.data ?? [])
const articlesFailed = computed(() => Boolean(articlesError.value))
const catalogFailed = computed(() => Boolean(catalogError.value))
const examsFailed = computed(() => Boolean(examsError.value))
const booksFailed = computed(() => Boolean(booksError.value))
const bookTotal = computed(() => bookResponse.value?.meta?.total ?? books.value.length)

function publishedLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date)
}

const HERO_DECOS = [
  { icon: '✏️', style: 'top: -18px; inset-inline-end: 12%; --fd: 0s' },
  { icon: '⭐', style: 'top: 34%; inset-inline-end: 2%; --fd: 1.2s' },
  { icon: '📚', style: 'bottom: -8px; inset-inline-end: 22%; --fd: 2.1s' },
]
</script>

<style scoped>
.hx-rise {
  animation: hx-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0s) both;
}

.hx-pop {
  animation:
    hx-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) var(--d, 0s) both,
    hx-shimmer 4s linear calc(var(--d, 0s) + 0.8s) infinite;
  background-size: 200% auto;
}

.hx-ping>span:first-child {
  animation: hx-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.hx-deco {
  animation: hx-bob 4s ease-in-out var(--fd, 0s) infinite;
}

.hx-cta {
  animation: hx-glow 2.6s ease-in-out 1.6s infinite;
}

.hx-cta-shine {
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 0.55), transparent);
  transform: skewX(-20deg);
  animation: hx-shine 3.4s ease-in-out 1.8s infinite;
}

.hx-play {
  animation: hx-pulse 1.8s ease-in-out 1.4s infinite;
}

@keyframes hx-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes hx-pop {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.85);
  }

  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes hx-shimmer {
  to {
    background-position: 200% center;
  }
}

@keyframes hx-ping {

  75%,
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}

@keyframes hx-bob {

  0%,
  100% {
    opacity: 0.55;
    transform: translateY(0) rotate(-6deg);
  }

  50% {
    opacity: 1;
    transform: translateY(-10px) rotate(8deg);
  }
}

@keyframes hx-glow {

  0%,
  100% {
    box-shadow: 0 4px 14px rgb(249 115 22 / 0.25);
  }

  50% {
    box-shadow: 0 6px 26px rgb(244 63 94 / 0.45);
  }
}

@keyframes hx-shine {
  0% {
    inset-inline-start: -33%;
  }

  40%,
  100% {
    inset-inline-start: 120%;
  }
}

@keyframes hx-pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.18);
  }
}

@media (prefers-reduced-motion: reduce) {

  .hx-rise,
  .hx-pop,
  .hx-ping>span:first-child,
  .hx-deco,
  .hx-cta,
  .hx-cta-shine,
  .hx-play {
    animation: none;
  }

  .hx-deco,
  .hx-cta-shine {
    display: none;
  }
}
</style>
