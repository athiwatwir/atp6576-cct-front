<template>
  <ThemeProvider>
    <SidebarProvider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import SidebarProvider from '@/components/layout/SidebarProvider.vue'
import ThemeProvider from '@/components/layout/ThemeProvider.vue'
</script>
