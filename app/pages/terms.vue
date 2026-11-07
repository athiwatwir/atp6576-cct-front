<template>
  <div class="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
    <PageLoading v-if="pending && !page" message="กำลังโหลดข้อกำหนดและเงื่อนไข..." />

    <section class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 ring-1 ring-blue-100 md:p-8">
      <span class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" aria-hidden="true" />
      <div class="relative flex items-start gap-4">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
          <LearnIcon name="receipt" class="h-6 w-6" />
        </span>
        <div class="min-w-0">
          <p class="text-sm font-bold text-blue-600">ClickClass Tutor</p>
          <h1 class="mt-1 text-3xl font-extrabold text-slate-900">{{ page?.title || 'ข้อกำหนดและเงื่อนไข' }}</h1>
          <p v-if="page?.updated_at" class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
            <LearnIcon name="clock" class="h-3.5 w-3.5" />
            ปรับปรุงล่าสุด {{ formatThaiDate(page.updated_at) }}
          </p>
        </div>
      </div>
    </section>

    <div v-if="failed || (!pending && !page?.content)" class="mt-6 flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
      <span class="text-4xl" aria-hidden="true">📄</span>
      <p class="font-extrabold text-slate-800">ยังไม่มีเนื้อหาในหน้านี้</p>
      <p class="text-sm text-slate-500">หากมีข้อสงสัยเกี่ยวกับการใช้งานหรือการสั่งซื้อ ติดต่อทีมงานได้เลย</p>
      <NuxtLink to="/contact" class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
        <LearnIcon name="contact" class="h-4 w-4" />
        ติดต่อเรา
      </NuxtLink>
    </div>

    <div v-else-if="page" class="mt-6 grid gap-6" :class="{ 'md:grid-cols-[15rem_minmax(0,1fr)]': toc.length > 1 }">
      <nav v-if="toc.length > 1" aria-label="สารบัญ" class="h-fit rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:sticky md:top-24">
        <p class="px-2 text-xs font-extrabold text-slate-400">สารบัญ</p>
        <ol class="mt-2 space-y-0.5 text-sm">
          <li v-for="item in toc" :key="item.id">
            <a :href="`#${item.id}`" class="block rounded-xl px-2 py-1.5 font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700" :class="{ 'ps-5 text-xs font-medium': item.level === 3 }" @click.prevent="scrollToHeading(item.id)">
              {{ item.text }}
            </a>
          </li>
        </ol>
      </nav>

      <article class="min-w-0 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-8">
        <!-- เนื้อหาผ่าน ArticleHtml::clean ฝั่ง backend แล้ว -->
        <div class="terms-content space-y-3 text-sm leading-7 text-slate-700 md:text-base" v-html="contentHtml" />
        <p class="mt-8 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          มีคำถามเกี่ยวกับข้อกำหนดนี้?
          <NuxtLink to="/contact" class="font-bold text-blue-700 hover:underline">ติดต่อเรา</NuxtLink>
        </p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

interface SitePage {
  key: string
  title: string
  content: string | null
  updated_at: string | null
}

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

const { api } = useApi()

const { data, pending, error } = useLazyAsyncData('site-page-terms', () =>
  api<{ data: SitePage }>('/pages/terms'),
)

const page = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

const parsed = computed(() => {
  const html = page.value?.content ?? ''
  if (!html || !import.meta.client) return { html, toc: [] as TocItem[] }
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const toc: TocItem[] = []
  doc.querySelectorAll('h2, h3').forEach((heading, index) => {
    const id = `terms-${index + 1}`
    heading.id = id
    toc.push({ id, text: heading.textContent?.trim() || `หัวข้อ ${index + 1}`, level: heading.tagName === 'H3' ? 3 : 2 })
  })
  return { html: doc.body.firstElementChild?.innerHTML ?? html, toc }
})

const contentHtml = computed(() => parsed.value.html)
const toc = computed(() => parsed.value.toc)

function scrollToHeading(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
}

useSeoMeta({
  title: () => `${page.value?.title || 'ข้อกำหนดและเงื่อนไข'} | ClickClass Tutor`,
  description: 'ข้อกำหนดและเงื่อนไขการใช้งานและการสั่งซื้อคอร์สเรียนของ ClickClass Tutor',
})
</script>

<style scoped>
.terms-content :deep(h2) {
  margin-top: 1.75rem;
  scroll-margin-top: 6rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.terms-content :deep(h3) {
  margin-top: 1.25rem;
  scroll-margin-top: 6rem;
  font-weight: 800;
  color: #1e293b;
}

.terms-content :deep(h2:first-child),
.terms-content :deep(h3:first-child) {
  margin-top: 0;
}

.terms-content :deep(a) {
  font-weight: 700;
  color: #1d4ed8;
}

.terms-content :deep(ul),
.terms-content :deep(ol) {
  padding-inline-start: 1.25rem;
}

.terms-content :deep(ul) {
  list-style: disc;
}

.terms-content :deep(ol) {
  list-style: decimal;
}

.terms-content :deep(blockquote) {
  border-inline-start: 4px solid #bfdbfe;
  background: #eff6ff;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #1e3a8a;
}
</style>
