<template>
  <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <h1 class="text-2xl font-extrabold text-slate-900">{{ title }}</h1>
    <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
