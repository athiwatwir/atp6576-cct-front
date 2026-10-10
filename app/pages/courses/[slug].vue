<template>
  <CatalogDetail :item="item" :pending="pending" :failed="failed" back-to="/courses" back-label="กลับไปหน้าคอร์สเรียน" />
</template>

<script setup lang="ts">
import type { CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `course-${slug.value}`,
  () => api<{ data: CatalogItem }>(`/courses/${slug.value}`),
  { watch: [slug] },
)

const item = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

useHead({ title: () => item.value ? `${item.value.name} | ClickClass Tutor` : 'คอร์สเรียน | ClickClass Tutor' })
</script>
