<template>
  <aside
    class="fixed inset-y-0 start-0 z-40 flex w-[248px] flex-col border-e border-blue-100 bg-white transition-transform duration-200 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center gap-2 px-5 pt-6 pb-4">
      <NuxtLink to="/home" class="flex items-center gap-2" @click="emit('close')">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M3 17.5 12 4l9 13.5h-4.2L12 10.2 7.2 17.5z" />
          </svg>
        </span>
        <span class="leading-tight">
          <span class="block text-base font-bold text-blue-700">ClickClass</span>
          <span class="block text-xs font-semibold text-sky-500">Tutor</span>
        </span>
      </NuxtLink>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
      <NuxtLink
        v-for="item in studentNav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition"
        :class="isActive(item.to)
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
          : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'"
        @click="emit('close')"
      >
        <StudentNavIcon :name="item.icon" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { studentNav } from '@/utils/student-nav'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>
