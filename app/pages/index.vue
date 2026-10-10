<template>
  <div>
    <HomeBannerSlider :banners="banners" :pending="pending" />

    <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
      <div>
        <p class="mb-3 text-sm font-bold text-blue-600">คอร์สเรียนออนไลน์สำหรับเด็ก</p>
        <h1 class="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          เรียนสนุก เข้าใจง่าย<br>
          <span class="text-blue-600">เก่งขึ้นได้ทุกวัน!</span>
        </h1>
        <p class="mt-4 max-w-md text-base text-slate-600">
          คอร์สเรียนออนไลน์สำหรับเด็กประถม เข้าใจง่าย เรียนได้ทุกที่ ทุกเวลา
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink to="/signup"
            class="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
            <LearnIcon name="play" class="h-4 w-4" />
            เริ่มเรียนกันเลย!
          </NuxtLink>
          <NuxtLink to="/signin"
            class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
            <LearnIcon name="login" class="h-4 w-4" />
            เข้าสู่ระบบ
          </NuxtLink>
        </div>
      </div>
      <div class="rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-blue-100 p-8 text-center shadow-sm">
        <p class="text-6xl" aria-hidden="true">📚</p>
        <p class="mt-3 text-lg font-bold text-blue-800">ห้องเรียนที่เข้าได้หลังสมัครสมาชิก</p>
        <p class="mt-1 text-sm text-slate-500">เข้าห้องเรียนได้หลังเข้าสู่ระบบ</p>
      </div>
    </section>

    <section id="subjects" class="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 md:px-6">
      <NuxtLink v-for="item in highlights" :key="item.label" :to="item.to"
        class="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-blue-50 transition hover:-translate-y-0.5 hover:shadow-md">
        <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" :class="item.chip">
          <LearnIcon :name="item.icon" class="h-6 w-6" />
        </span>
        <span class="mt-2 block text-sm font-bold text-slate-700">{{ item.label }}</span>
        <span class="block text-xs text-slate-400">{{ item.caption }}</span>
      </NuxtLink>
    </section>

    <section id="courses" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <CatalogGrid title="คอร์สเรียน" description="คอร์สและหลักสูตรที่เปิดขายทั้งหมด" :items="catalog"
        :pending="catalogPending" :failed="catalogFailed" purchasable heading="h2" icon="course"
        chip="bg-blue-100 text-blue-600" />
    </section>

    <section id="exams" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <CatalogGrid title="ข้อสอบ" description="ข้อสอบที่เปิดขายแยกจากคอร์ส" :items="exams" :pending="examsPending"
        :failed="examsFailed" purchasable heading="h2" icon="exam" chip="bg-amber-100 text-amber-600" />
    </section>

    <section id="books" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <HomeBookGrid :books="books" :pending="booksPending" :failed="booksFailed" :total="bookTotal" />
    </section>

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
import type { CatalogItem, StoreBook } from '@/composables/useCart'

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

useHead({ title: 'ClickClass Tutor' })

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

const banners = computed(() => bannerResponse.value?.data ?? [])
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

const highlights = [
  { label: 'คอร์สเรียน', caption: 'คอร์สและหลักสูตร', icon: 'course' as const, chip: 'bg-blue-100 text-blue-600', to: '/courses' },
  { label: 'ข้อสอบ', caption: 'ข้อสอบแยกชุด', icon: 'exam' as const, chip: 'bg-amber-100 text-amber-600', to: '/exams' },
  { label: 'หนังสือ', caption: 'อ่านเสริมเพิ่ม', icon: 'book' as const, chip: 'bg-orange-100 text-orange-600', to: '/books' },
  { label: 'ติดต่อเรา', caption: 'สอบถามการสั่งซื้อ', icon: 'contact' as const, chip: 'bg-emerald-100 text-emerald-600', to: '/contact' },
]

</script>
