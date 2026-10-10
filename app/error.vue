<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-[#f7fbff] px-6 text-center text-slate-800">
    <p class="text-sm font-bold text-blue-600">{{ error?.statusCode || 404 }}</p>
    <h1 class="mt-2 text-3xl font-extrabold text-slate-900">ไม่พบหน้านี้</h1>
    <p class="mt-3 max-w-md text-sm text-slate-500">หน้าที่ต้องการไม่มีอยู่ในระบบ หรือถูกย้ายไปแล้ว</p>
    <button
      type="button"
      class="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
      @click="clearError({ redirect: '/' })"
    >
      กลับหน้าแรก
    </button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useHead({ title: 'ไม่พบหน้านี้ | ClickClass Tutor' })
</script>
