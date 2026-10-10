<template>
  <article class="mx-auto max-w-3xl px-4 py-8 md:px-6">
    <NuxtLink to="/#articles" class="text-sm font-bold text-blue-700">กลับหน้าแรก</NuxtLink>
    <p v-if="pending" class="mt-6 text-sm text-slate-500">กำลังโหลด...</p>
    <p v-else-if="failed || !article" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ไม่พบบทความนี้</p>
    <div v-else class="mt-4">
      <p v-if="article.published_at" class="text-sm text-slate-400">{{ publishedLabel(article.published_at) }}</p>
      <h1 class="mt-1 text-3xl font-extrabold text-slate-900">{{ article.title }}</h1>
      <p v-if="article.excerpt" class="mt-3 text-slate-600">{{ article.excerpt }}</p>
      <img v-if="article.image_url" :src="article.image_url" :alt="article.title" class="mt-5 w-full rounded-3xl object-cover">
      <div v-if="article.content" class="article-content mt-6 space-y-3 text-sm leading-7 text-slate-700" v-html="article.content" />
    </div>
  </article>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

interface ArticleDetail {
  id: number
  slug: string
  title: string
  excerpt: string | null
  image_url: string | null
  published_at: string | null
  content?: string | null
}

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `article-${slug.value}`,
  () => api<{ data: ArticleDetail }>(`/articles/${slug.value}`),
  { watch: [slug] },
)

const article = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

function publishedLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date)
}

useHead({ title: () => article.value ? `${article.value.title} | ClickClass Tutor` : 'บทความ | ClickClass Tutor' })
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
</style>
