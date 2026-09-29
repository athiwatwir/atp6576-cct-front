<template>
  <div class="min-h-screen bg-[#f4f8ff] text-slate-800">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
      @click="mobileOpen = false"
    />
    <StudentSidebar :open="mobileOpen" @close="mobileOpen = false" />
    <div class="min-w-0 lg:ps-[248px]">
      <StudentHeader @toggle="mobileOpen = !mobileOpen" />
      <main class="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>
