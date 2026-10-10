<template>
  <BookDetail :book="book" :pending="pending" :failed="failed" />
</template>

<script setup lang="ts">
import type { StoreBook } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `book-${slug.value}`,
  () => api<{ data: StoreBook }>(`/books/${slug.value}`),
  { watch: [slug] },
)

const book = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

useHead({ title: () => book.value ? `${book.value.name} | ClickClass Tutor` : 'หนังสือ | ClickClass Tutor' })
</script>
