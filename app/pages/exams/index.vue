<template>
  <div class="mx-auto max-w-6xl px-4 py-8 md:px-6">
    <CatalogGrid
      title="ข้อสอบ"
      description="ข้อสอบที่เปิดขายแยกจากคอร์สทั้งหมด"
      :items="items"
      :pending="pending"
      :failed="failed"
      purchasable
      icon="exam"
      chip="bg-amber-100 text-amber-600"
    />
  </div>
</template>

<script setup lang="ts">
import type { CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })
useHead({ title: 'ข้อสอบ | ClickClass Tutor' })

const { fetchAll } = useStorefront()
const { data, pending, error } = useLazyAsyncData('catalog-exams', () =>
  fetchAll<CatalogItem>('/catalog', { type: 'exam' }),
)

const items = computed(() => data.value?.data ?? [])
const failed = computed(() => Boolean(error.value))
</script>
