<template>
  <div v-if="visible" class="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
      <p>{{ message }}</p>
      <NuxtLink to="/verify-email" class="font-bold text-amber-800 underline">ยืนยันอีเมล</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { loggedIn, user, verifyNotice } = useAuth()

const needsVerification = computed(() => loggedIn.value && user.value?.email_verified === false)

const visible = computed(() => route.path !== '/verify-email' && (needsVerification.value || Boolean(verifyNotice.value)))

const message = computed(() => {
  if (needsVerification.value && user.value?.email) {
    return `กรุณายืนยันอีเมลจากลิงก์ที่ส่งไปที่ ${user.value.email}`
  }
  return verifyNotice.value || 'กรุณายืนยันอีเมลจากลิงก์ที่เราส่งให้'
})

watch(() => user.value?.email_verified, (verified) => {
  if (verified) verifyNotice.value = null
})
</script>
