<template>
  <section class="mb-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:p-5" aria-label="ตัวกรองคอร์ส">
    <div class="flex flex-wrap items-center gap-3">
      <label class="relative min-w-[14rem] flex-1">
        <span class="sr-only">ค้นหาคอร์ส</span>
        <svg viewBox="0 0 24 24" class="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          v-model="search"
          type="search"
          placeholder="ค้นหาชื่อคอร์ส เช่น คณิต ภาษาอังกฤษ"
          class="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pe-4 ps-11 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
      </label>
      <p class="text-sm text-slate-500">
        พบ <span class="font-extrabold text-blue-700">{{ resultCount }}</span> รายการ
      </p>
      <button
        v-if="active"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
        @click="clear"
      >
        <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
        ล้างตัวกรอง
      </button>
    </div>

    <div class="mt-4 space-y-3">
      <div v-if="levels.length" class="flex items-start gap-3">
        <p class="flex w-20 shrink-0 items-center gap-1.5 pt-2 text-xs font-extrabold text-slate-500">
          <LearnIcon name="course" class="h-4 w-4 text-blue-500" />
          ระดับชั้น
        </p>
        <div class="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-label="ระดับชั้น">
          <button
            v-for="option in [{ slug: '', name: 'ทั้งหมด', count: levelTotal }, ...levels]"
            :key="option.slug || 'all'"
            type="button"
            role="radio"
            :aria-checked="level === option.slug"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition"
            :class="level === option.slug ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200'"
            @click="level = option.slug"
          >
            {{ option.name }}
            <span class="rounded-full px-1.5 text-xs" :class="level === option.slug ? 'bg-white/25' : 'bg-white text-slate-400'">{{ option.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="subjects.length" class="flex items-start gap-3">
        <p class="flex w-20 shrink-0 items-center gap-1.5 pt-2 text-xs font-extrabold text-slate-500">
          <LearnIcon name="book" class="h-4 w-4 text-orange-500" />
          วิชา
        </p>
        <div class="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-label="วิชา">
          <button
            v-for="option in [{ slug: '', name: 'ทุกวิชา', count: subjectTotal }, ...subjects]"
            :key="option.slug || 'all'"
            type="button"
            role="radio"
            :aria-checked="subject === option.slug"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition"
            :class="subject === option.slug ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-orange-700 hover:ring-orange-200'"
            @click="subject = option.slug"
          >
            {{ option.name }}
            <span class="rounded-full px-1.5 text-xs" :class="subject === option.slug ? 'bg-white/25' : 'bg-white text-slate-400'">{{ option.count }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CatalogItem, NamedRef } from '@/composables/useCart'

interface Facet {
  slug: string
  name: string
  count: number
  order: number
}

const props = defineProps<{
  items: CatalogItem[]
  resultCount: number
}>()

const level = defineModel<string>('level', { default: '' })
const subject = defineModel<string>('subject', { default: '' })
const search = defineModel<string>('search', { default: '' })

const active = computed(() => Boolean(level.value || subject.value || search.value.trim()))

function matchesSearch(item: CatalogItem) {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return true
  return [item.name, item.code, item.short_description, item.category?.name, item.subject?.name]
    .some(value => value?.toLowerCase().includes(keyword))
}

function facets(items: CatalogItem[], pick: (item: CatalogItem) => NamedRef | null | undefined): Facet[] {
  const map = new Map<string, Facet>()
  for (const item of items) {
    const ref = pick(item)
    if (!ref?.slug) continue
    const entry = map.get(ref.slug) ?? { slug: ref.slug, name: ref.name, count: 0, order: ref.sort_order ?? 0 }
    entry.count++
    map.set(ref.slug, entry)
  }
  return [...map.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'th'))
}

const searched = computed(() => props.items.filter(matchesSearch))
const levelPool = computed(() => searched.value.filter(item => !subject.value || item.subject?.slug === subject.value))
const subjectPool = computed(() => searched.value.filter(item => !level.value || item.category?.slug === level.value))

const levels = computed(() => facets(levelPool.value, item => item.category))
const subjects = computed(() => facets(subjectPool.value, item => item.subject))
const levelTotal = computed(() => levelPool.value.length)
const subjectTotal = computed(() => subjectPool.value.length)

watch(level, () => {
  if (subject.value && !subjects.value.some(entry => entry.slug === subject.value)) subject.value = ''
})

function clear() {
  level.value = ''
  subject.value = ''
  search.value = ''
}

defineExpose({ clear })
</script>
