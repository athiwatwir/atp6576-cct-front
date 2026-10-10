<template>
  <NuxtLink :to="to" class="inline-flex items-center" :class="linkClass">
    <img
      v-if="variant !== 'dark'"
      :class="[imageClass, variant === 'auto' ? 'dark:hidden' : '']"
      src="/images/logo/logo.webp"
      alt="ClickClass Tutor"
      width="180"
      height="66"
    >
    <img
      v-if="variant !== 'light'"
      :class="[imageClass, variant === 'auto' ? 'hidden dark:block' : '']"
      src="/images/logo/logo-dark.webp"
      alt="ClickClass Tutor"
      width="180"
      height="66"
    >
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
