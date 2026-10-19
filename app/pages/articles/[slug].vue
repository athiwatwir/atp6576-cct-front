<template>
  <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
    <NuxtLink to="/#articles" class="text-sm font-bold text-blue-700">กลับหน้าแรก</NuxtLink>
    <p v-if="pending" class="mt-6 text-sm text-slate-500">กำลังโหลด...</p>
    <p v-else-if="failed || !article" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ไม่พบบทความนี้</p>

    <div v-else class="mt-4 grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article class="min-w-0">
        <p v-if="article.published_at" class="text-sm text-slate-400">{{ publishedLabel(article.published_at) }}</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">{{ article.title }}</h1>
        <p v-if="article.excerpt" class="mt-3 text-slate-600">{{ article.excerpt }}</p>
        <img v-if="article.image_url" :src="article.image_url" :alt="article.title" class="mt-5 w-full rounded-3xl object-cover">
        <div v-if="article.content" class="article-content mt-6 space-y-3 text-sm leading-7 text-slate-700" v-html="article.content" />

        <section v-if="related.length" class="mt-10" aria-labelledby="related-title">
          <h2 id="related-title" class="text-2xl font-extrabold text-slate-900">คอร์สเรียนที่เกี่ยวข้อง</h2>
          <p class="mt-1 text-sm text-slate-500">คอร์ส หลักสูตร และข้อสอบที่เกี่ยวกับบทความนี้</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <NuxtLink
              v-for="item in related"
              :key="`${item.kind}-${item.id}`"
              :to="item.to"
              class="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
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
        </section>
      </article>

      <aside v-if="othersPending || others.length" class="md:sticky md:top-32 md:self-start" aria-labelledby="others-title">
        <h2 id="others-title" class="text-xl font-extrabold text-slate-900">บทความอื่นๆ</h2>
        <div v-if="othersPending && !others.length" class="mt-4 space-y-3">
          <div v-for="index in 3" :key="index" class="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
        </div>
        <ul v-else class="mt-4 space-y-3">
          <li v-for="other in others" :key="other.id">
            <NuxtLink
              :to="`/articles/${other.slug}`"
              class="group flex gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100 transition hover:ring-blue-200"
            >
              <span class="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-sky-100">
                <img v-if="other.image_url" :src="other.image_url" alt="" class="h-full w-full object-cover">
              </span>
              <span class="min-w-0 py-0.5">
                <span class="line-clamp-2 text-sm font-bold text-slate-800 group-hover:text-blue-700">{{ other.title }}</span>
                <span v-if="other.published_at" class="mt-1 block text-xs text-slate-400">{{ publishedLabel(other.published_at) }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const otherLimit = 5

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `article-${slug.value}`,
  () => api<{ data: ArticleDetail }>(`/articles/${slug.value}`),
  { watch: [slug] },
)

const { data: othersResponse, pending: othersPending } = useLazyAsyncData('article-others', () =>
  api<{ data: ArticleSummary[] }>('/articles', { query: { per_page: otherLimit + 1 } }),
)

const article = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

const others = computed(() =>
  (othersResponse.value?.data ?? []).filter(other => other.slug !== slug.value).slice(0, otherLimit),
)

const related = computed(() => {
  const groups = article.value?.related
  if (!groups) return []
  return [
    ...(groups.courses ?? []).map(item => ({ ...item, kind: 'course' as const, kindLabel: 'คอร์ส', chip: 'bg-blue-100 text-blue-700', to: `/courses/${item.slug}` })),
    ...(groups.curriculums ?? []).map(item => ({ ...item, kind: 'curriculum' as const, kindLabel: 'หลักสูตร', chip: 'bg-sky-100 text-sky-700', to: `/curriculums/${item.slug}` })),
    ...(groups.exams ?? []).map(item => ({ ...item, kind: 'exam' as const, kindLabel: 'ข้อสอบ', chip: 'bg-amber-100 text-amber-700', to: `/exams/${item.slug}` })),
  ]
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
</style>
