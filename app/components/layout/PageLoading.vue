<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div class="flex flex-col items-center gap-4 rounded-3xl bg-white px-10 py-8 text-center shadow-xl ring-1 ring-slate-100">
          <img src="/images/logo/logo.webp" alt="ClickClass Tutor" width="1099" height="404" class="h-10 w-auto">
          <span class="relative block h-12 w-12" aria-hidden="true">
            <span class="absolute inset-0 rounded-full border-4 border-blue-100" />
            <span class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-orange-400 border-t-blue-600" />
          </span>
          <p class="text-sm font-bold text-slate-700">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  message?: string
  /** รอสักครู่ก่อนแสดง กันจอกระพริบเมื่อโหลดเสร็จเร็ว */
  delay?: number
}>(), { message: 'กำลังโหลด...', delay: 150 })

const visible = ref(props.delay <= 0)
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (!visible.value) timer = setTimeout(() => { visible.value = true }, props.delay)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>
