<template>
  <header class="sticky top-0 z-30 border-b border-blue-100 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
      <NuxtLink to="/" class="flex items-center gap-2">
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

      <nav class="ms-4 hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
        <a href="#courses" class="hover:text-blue-700">คอร์สเรียน</a>
        <a href="#subjects" class="hover:text-blue-700">วิชา</a>
        <a href="#books" class="hover:text-blue-700">หนังสือ</a>
      </nav>

      <div class="ms-auto flex items-center gap-2">
        <template v-if="loggedIn">
          <NuxtLink to="/home" class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            เข้าห้องเรียน
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/signin" class="rounded-full px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            เข้าสู่ระบบ
          </NuxtLink>
          <NuxtLink to="/signup" class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            สมัครสมาชิก
          </NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { loggedIn } = useAuth()
</script>
