<template>
  <div class="flex min-h-screen flex-col bg-[#f7fbff] text-slate-800">
    <LandingHeader v-if="showChrome" />
    <EmailVerifyBanner v-if="showChrome" />
    <div class="flex-1">
      <slot />
    </div>
    <LandingFooter v-if="showChrome" />
    <CartNotice />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const showChrome = computed(() => route.meta.landingChrome !== false)
</script>
