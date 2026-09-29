<template>
  <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'home'">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </template>
    <template v-else-if="name === 'course'">
      <path d="M4 6.5 12 4l8 2.5V18l-8 2.5L4 18z" />
      <path d="M12 6.5V20.5" />
    </template>
    <template v-else-if="name === 'subject'">
      <path d="M12 4 4 8l8 4 8-4-8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16l8 4 8-4" />
    </template>
    <template v-else-if="name === 'exam'">
      <path d="M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2z" />
      <path d="M9 9h6M9 13h4" />
    </template>
    <template v-else-if="name === 'book'">
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H19" />
    </template>
    <template v-else-if="name === 'activity'">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    </template>
    <template v-else-if="name === 'reward'">
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" />
    </template>
    <template v-else>
      <path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7" />
      <path d="M3 8h18v4H3z" />
      <path d="M12 8v12" />
      <path d="M12 8c-1.5-2.5-4.5-3-6-1s.5 4 6 1z" />
      <path d="M12 8c1.5-2.5 4.5-3 6-1s-.5 4-6 1z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: 'home' | 'course' | 'subject' | 'exam' | 'book' | 'activity' | 'reward' | 'promo'
}>()
</script>
