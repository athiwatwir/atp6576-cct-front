<template>
  <div class="min-h-screen bg-[#f7fbff] text-slate-800">
    <LandingHeader v-if="showChrome" />
    <slot />
    <LandingFooter v-if="showChrome" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const showChrome = computed(() => route.meta.landingChrome !== false)
</script>
