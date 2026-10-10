<template>
  <div v-if="notice" class="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
    <div class="flex items-center gap-3 rounded-full bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      <span>{{ notice }}</span>
      <NuxtLink to="/cart" class="font-bold text-orange-300">ดูตะกร้า</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { notice } = useCart()
</script>
