<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-800">
    <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
      <HeaderLogo to="/home" image-class="h-8 w-auto" variant="light" />
      <NuxtLink to="/home" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
        <LearnIcon name="classroom" class="h-4 w-4" />
        ห้องเรียนของฉัน
      </NuxtLink>
      <span v-if="user" class="ms-auto truncate text-sm font-semibold text-slate-500">{{ user.name }}</span>
    </header>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
</script>
