<template>
  <div>
    <HomeBannerSlider :banners="banners" :pending="bannersPending" label="แบนเนอร์คอร์สเรียน" />
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <CatalogGrid
        title="คอร์สเรียน"
        description="คอร์สและหลักสูตรที่เปิดขายทั้งหมด ใส่ตะกร้าได้โดยยังไม่ต้องเข้าสู่ระบบ"
        :items="items"
        :pending="pending"
        :failed="failed"
        purchasable
        icon="course"
        chip="bg-blue-100 text-blue-600"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomeBanner } from '@/components/landing/HomeBannerSlider.vue'
import type { CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })
useHead({ title: 'คอร์สเรียน | ClickClass Tutor' })

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
</script>
