<template>
  <div>
    <HomeBannerSlider :banners="banners" :pending="bannersPending" label="แบนเนอร์คอร์สเรียน" />
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <CatalogGrid
        title="คอร์สเรียน"
        description="คอร์สและหลักสูตรที่เปิดขายทั้งหมด เพิ่มในรายการที่เลือกได้โดยยังไม่ต้องเข้าสู่ระบบ"
        :items="filtered"
        :pending="pending"
        :failed="failed"
        purchasable
        icon="course"
        chip="bg-blue-100 text-blue-600"
      >
        <template #toolbar>
          <CatalogFilters
            v-if="!pending && !failed && items.length"
            v-model:level="level"
            v-model:subject="subject"
            v-model:search="search"
            :items="items"
            :result-count="filtered.length"
          />
        </template>
        <template #empty>
          <div class="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl" aria-hidden="true">🔍</span>
            <p class="font-extrabold text-slate-800">{{ items.length ? 'ไม่พบคอร์สที่ตรงกับตัวกรอง' : 'ยังไม่มีรายการที่เปิดขาย' }}</p>
            <p v-if="items.length" class="text-sm text-slate-500">ลองเลือกระดับชั้นหรือวิชาอื่น หรือล้างตัวกรองเพื่อดูทั้งหมด</p>
            <button
              v-if="items.length"
              type="button"
              class="mt-1 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
              @click="clearFilters"
            >
              ดูคอร์สทั้งหมด
            </button>
          </div>
        </template>
      </CatalogGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomeBanner } from '@/components/landing/HomeBannerSlider.vue'
import type { CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })
useHead({ title: 'คอร์สเรียน | ClickClass Tutor' })

const route = useRoute()
const router = useRouter()
const { api } = useApi()
const { fetchAll } = useStorefront()

const { data: bannerResponse, pending: bannersPending } = useLazyAsyncData('course-banners', () =>
  api<{ data: HomeBanner[] }>('/banners', { query: { placement: 'courses' } }),
)

const { data, pending, error } = useLazyAsyncData('catalog-courses', () =>
  fetchAll<CatalogItem>('/catalog', { type: 'course,curriculum' }),
)

const banners = computed(() => bannerResponse.value?.data ?? [])
const items = computed(() => data.value?.data ?? [])
const failed = computed(() => Boolean(error.value))

const queryText = (key: string) => (typeof route.query[key] === 'string' ? route.query[key] as string : '')
const level = ref(queryText('level'))
const subject = ref(queryText('subject'))
const search = ref(queryText('q'))

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return items.value.filter((item) => {
    if (level.value && item.category?.slug !== level.value) return false
    if (subject.value && item.subject?.slug !== subject.value) return false
    if (!keyword) return true
    return [item.name, item.code, item.short_description, item.category?.name, item.subject?.name]
      .some(value => value?.toLowerCase().includes(keyword))
  })
})

watch([level, subject, search], ([levelValue, subjectValue, searchValue]) => {
  const query: Record<string, string> = {}
  if (levelValue) query.level = levelValue
  if (subjectValue) query.subject = subjectValue
  if (searchValue.trim()) query.q = searchValue.trim()
  router.replace({ query })
})

function clearFilters() {
  level.value = ''
  subject.value = ''
  search.value = ''
}
</script>
