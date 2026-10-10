<template>
  <CatalogDetail :item="item" :pending="pending" :failed="failed" back-to="/exams" back-label="กลับไปหน้าข้อสอบ" />
</template>

<script setup lang="ts">
import type { CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `exam-${slug.value}`,
  () => api<{ data: CatalogItem }>(`/exams/${slug.value}`),
  { watch: [slug] },
)

const item = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

useHead({ title: () => item.value ? `${item.value.name} | ClickClass Tutor` : 'ข้อสอบ | ClickClass Tutor' })
</script>
