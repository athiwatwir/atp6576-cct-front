<template>
  <NuxtLink :to="to" class="inline-flex shrink-0 items-center" :class="linkClass">
    <img v-if="variant !== 'dark'" :class="['max-w-none object-contain', imageClass, variant === 'auto' ? 'dark:hidden' : '']"
      src="/images/logo/logo.webp" alt="ClickClass Tutor" width="1099" height="404">
    <img v-if="variant !== 'light'" :class="['max-w-none object-contain', imageClass, variant === 'auto' ? 'hidden dark:block' : '']"
      src="/images/logo/logo-dark.webp" alt="ClickClass Tutor" width="1099" height="404">
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  to?: string
  linkClass?: string
  imageClass?: string
  variant?: 'auto' | 'light' | 'dark'
}>(), {
  to: '/',
  linkClass: '',
  imageClass: 'h-10 w-auto',
  variant: 'auto',
})
</script>
