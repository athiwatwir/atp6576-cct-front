<template>
  <aside
    class="fixed inset-y-0 start-0 z-40 flex w-[248px] flex-col border-e border-blue-100 bg-white transition-transform duration-200 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center gap-2 px-5 pt-6 pb-4">
      <HeaderLogo to="/home" image-class="h-12 w-auto max-w-[180px]" @click="emit('close')" />
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
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

    <NuxtLink
      to="/profile"
      class="mx-3 mb-4 flex items-center gap-3 rounded-2xl px-3 py-3 ring-1 hover:bg-blue-50"
      :class="route.path === '/profile' ? 'bg-blue-50 ring-blue-200' : 'ring-blue-50'"
      @click="emit('close')"
    >
      <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        <img v-if="user?.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
        <span v-else>{{ initial }}</span>
      </span>
      <span class="min-w-0">
        <span class="block truncate text-sm font-bold text-slate-800">{{ user?.name || 'นักเรียน' }}</span>
        <span class="block truncate text-xs text-slate-400">{{ user?.school_name || user?.email || 'แก้ไขโปรไฟล์' }}</span>
      </span>
    </NuxtLink>
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
const { user } = useAuth()
const initial = computed(() => (user.value?.name || 'น').trim().charAt(0))

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>
