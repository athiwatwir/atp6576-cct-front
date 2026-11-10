<template>
  <div class="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/85 p-4 text-center text-white backdrop-blur-sm" role="status">
    <div class="max-w-sm">
      <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-900/40">
        <LearnIcon name="clock" class="h-6 w-6" />
      </span>
      <p class="mt-3 text-lg font-extrabold">ทดลองเรียนครบ {{ lessonClock(limitSeconds) }} แล้ว</p>
      <p class="mt-1 text-sm text-slate-200">เลือกแพ็กเกจเพื่อดูคลิปนี้ต่อจนจบ และเรียนได้ทุกบทในคอร์ส</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <NuxtLink
          :to="buyTo"
          class="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-900/30 transition hover:bg-orange-600"
          @click="emit('buy')"
        >
          <LearnIcon name="cart" class="h-4 w-4" />
          เลือกแพ็กเกจ
        </NuxtLink>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25"
          @click="emit('replay')"
        >
          <LearnIcon name="play" class="h-4 w-4" />
          ดูซ้ำตั้งแต่ต้น
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { lessonClock } from '@/composables/useLessonPlayer'

defineProps<{
  limitSeconds: number
  buyTo: string
}>()

const emit = defineEmits<{ replay: [], buy: [] }>()
</script>
