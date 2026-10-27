<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'home'">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-5.2a1 1 0 0 0-1-1h-1.6a1 1 0 0 0-1 1V21H5a1 1 0 0 1-1-1v-9.5Z" />
    </template>
    <template v-else-if="name === 'course'">
      <path d="M3 9.2 12 5l9 4.2-9 4.2L3 9.2Z" />
      <path d="M7.2 11.4v4.2c0 1.3 2.1 2.6 4.8 2.6s4.8-1.3 4.8-2.6v-4.2" />
      <path d="M21 9.2v5.2" />
    </template>
    <template v-else-if="name === 'exam'">
      <path d="M8 3.5h8a2 2 0 0 1 2 2V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.5a2 2 0 0 1 2-2Z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
      <path d="M9 3.5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5" />
    </template>
    <template v-else-if="name === 'book'">
      <path d="M5 5.2A2.2 2.2 0 0 1 7.2 3H19v15.5H7.2A2.2 2.2 0 0 0 5 20.7Z" />
      <path d="M5 5.2A2.2 2.2 0 0 1 7.2 7.4H19" />
    </template>
    <template v-else-if="name === 'contact'">
      <path d="M5 6.2A2.2 2.2 0 0 1 7.2 4h9.6A2.2 2.2 0 0 1 19 6.2v6.6a2.2 2.2 0 0 1-2.2 2.2H9.2L5 18.2v-3.1A2.2 2.2 0 0 1 5 12.8V6.2Z" />
    </template>
    <template v-else-if="name === 'cart'">
      <path d="M6.2 8h11.6l-1 11.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8L6.2 8Z" />
      <path d="M9 8V6.8a3 3 0 0 1 6 0V8" />
    </template>
    <template v-else-if="name === 'classroom'">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v8A1.5 1.5 0 0 1 18.5 15h-13A1.5 1.5 0 0 1 4 13.5v-8Z" />
      <path d="M8 20h8M12 15v5M8 8.5h8M8 11.5h5" />
    </template>
    <template v-else-if="name === 'login' || name === 'profile'">
      <circle cx="12" cy="8" r="3" />
      <path d="M6.2 19.2c1.1-2.3 3.1-3.5 5.8-3.5s4.7 1.2 5.8 3.5" />
    </template>
    <template v-else-if="name === 'logout'">
      <path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17" />
      <path d="M13 12H4M7 9 4 12l3 3" />
    </template>
    <template v-else-if="name === 'signup'">
      <circle cx="10" cy="8" r="3" />
      <path d="M4.5 19c1-2.2 2.9-3.4 5.5-3.4 1.2 0 2.3.3 3.2.8" />
      <path d="M17 10v6M14 13h6" />
    </template>
    <template v-else-if="name === 'play'">
      <circle cx="12" cy="12" r="8" />
      <path d="M10.2 9.2v5.6l5-2.8-5-2.8Z" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'arrow'">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </template>
    <template v-else-if="name === 'infinity'">
      <path d="M7.5 9c-1.9 0-3.5 1.3-3.5 3s1.6 3 3.5 3c3.5 0 5.5-6 9-6 1.9 0 3.5 1.3 3.5 3s-1.6 3-3.5 3c-3.5 0-5.5-6-9-6Z" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: 'home' | 'course' | 'exam' | 'book' | 'contact' | 'cart' | 'classroom' | 'login' | 'profile' | 'logout' | 'signup' | 'play' | 'arrow' | 'clock' | 'infinity'
}>()
</script>
