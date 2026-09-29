<template>
  <div>
    <ThemeProvider>
    <div
      class="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6"
    >
      <CommonGridShape />
      <div class="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 class="mb-8 font-bold text-gray-800 text-title-md xl:text-title-2xl dark:text-white/90">
          ERROR
        </h1>
        <img src="/images/error/404.svg" alt="404" class="dark:hidden">
        <img src="/images/error/404-dark.svg" alt="404" class="hidden dark:block">
        <p class="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          We can't seem to find the page you are looking for!
        </p>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          @click="clearError({ redirect: '/' })"
        >
          Back to Home Page
        </button>
      </div>
      <p class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ currentYear }} - TailAdmin
      </p>
    </div>
    </ThemeProvider>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import CommonGridShape from '@/components/common/CommonGridShape.vue'
import ThemeProvider from '@/components/layout/ThemeProvider.vue'

defineProps<{
  error: NuxtError
}>()

const currentYear = new Date().getFullYear()

useHead({ title: '404 Error | TailAdmin' })
</script>
