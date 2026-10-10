<template>
  <div>
    <HomeBannerSlider :banners="banners" :pending="bannersPending" label="แบนเนอร์หนังสือ" />
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <HomeBookGrid :books="books" :pending="pending" :failed="failed" :total="total" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomeBanner } from '@/components/landing/HomeBannerSlider.vue'
import type { StoreBook } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })
useHead({ title: 'หนังสือ | ClickClass Tutor' })

const { api } = useApi()
const { fetchAll } = useStorefront()

const { data: bannerResponse, pending: bannersPending } = useLazyAsyncData('book-banners', () =>
  api<{ data: HomeBanner[] }>('/banners', { query: { placement: 'books' } }),
)

const { data, pending, error } = useLazyAsyncData('shop-books', () =>
  fetchAll<StoreBook>('/books'),
)

const banners = computed(() => bannerResponse.value?.data ?? [])
const books = computed(() => data.value?.data ?? [])
const failed = computed(() => Boolean(error.value))
const total = computed(() => data.value?.meta?.total ?? books.value.length)
</script>
