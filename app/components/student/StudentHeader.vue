<template>
  <header class="sticky top-0 z-30 flex items-center gap-3 border-b border-blue-100 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
    <button
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-blue-50 lg:hidden"
      aria-label="เปิดเมนู"
      @click="emit('toggle')"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>

    <label class="relative hidden min-w-0 flex-1 md:block">
      <span class="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        v-model="keyword"
        type="search"
        placeholder="ค้นหาคอร์ส, วิชา, ข้อสอบ..."
        class="h-11 w-full rounded-full border border-slate-200 bg-slate-50 ps-10 pe-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
        @keydown.enter="search"
      >
    </label>

    <button type="button" class="relative ms-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-blue-50" aria-label="การแจ้งเตือน">
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2h-15z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    </button>

    <div class="flex items-center gap-2">
      <span class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        <img v-if="user?.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
        <span v-else>{{ initial }}</span>
      </span>
      <span class="hidden text-sm font-semibold text-slate-700 sm:block">{{ user?.name || 'นักเรียน' }}</span>
      <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100" @click="logout">
        ออกจากระบบ
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  toggle: []
}>()

const { user, logout } = useAuth()
const keyword = ref('')

const initial = computed(() => (user.value?.name || 'น').trim().charAt(0))

function search() {
  const value = keyword.value.trim()
  if (!value) return
  navigateTo({ path: '/courses', query: { search: value } })
}
</script>
