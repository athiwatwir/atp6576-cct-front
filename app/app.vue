<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ProfileReminder />
  <PageLoading v-if="navigating" :delay="250" />
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp()
const navigating = ref(false)

nuxtApp.hook('page:start', () => {
  navigating.value = true
})
nuxtApp.hook('page:finish', () => {
  navigating.value = false
})
nuxtApp.hook('vue:error', () => {
  navigating.value = false
})
</script>
