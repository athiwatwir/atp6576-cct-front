<template>
  <Transition name="fab">
    <div v-if="visible" class="fixed start-4 z-40 transition-[bottom] duration-300 sm:start-6"
      :class="notice ? 'bottom-20' : 'bottom-5 sm:bottom-6'">
      <NuxtLink :to="target" :class="{ 'fab-bump': bump }"
        class="fab-btn group flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 py-2 pe-5 ps-2 text-white shadow-xl shadow-orange-300/50 ring-4 ring-white transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-orange-200"
        :aria-label="`ไปชำระเงิน ${count} รายการ รวม ${formatBaht(subtotal)}`">
        <span class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20">
          <LearnIcon name="cart" class="h-6 w-6" />
          <span
            class="absolute -end-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-extrabold text-rose-600 shadow ring-2 ring-rose-500">
            {{ count > 99 ? '99+' : count }}
          </span>
        </span>
        <span class="text-start leading-tight">
          <span class="block text-sm font-extrabold">{{ missingPlan ? 'เลือกแพ็กเกจ' : 'ไปชำระเงิน' }}</span>
          <span class="block text-xs font-semibold text-white/85">{{ count }} รายการ · {{ formatBaht(subtotal) }}</span>
        </span>
        <LearnIcon name="arrow" class="hidden h-4 w-4 transition group-hover:translate-x-0.5 sm:block" />
      </NuxtLink>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const HIDDEN_PREFIXES = ['/cart', '/checkout', '/orders']

const route = useRoute()
const { items, count, subtotal, notice } = useCart()

/** คอร์สที่มีหลายแพ็กเกจแต่ยังไม่เลือก หน้าชำระเงินจะส่งกลับไปหน้ารายการที่เลือกอยู่ดี จึงพาไปที่นั่นเลย */
const missingPlan = computed(() => items.value.some(item => item.type !== 'book' && (item.plans?.length ?? 0) > 1 && !item.plan_id))
const target = computed(() => (missingPlan.value ? '/cart' : '/checkout'))
const visible = computed(() => count.value > 0 && !HIDDEN_PREFIXES.some(prefix => route.path.startsWith(prefix)))

const bump = ref(false)
let bumpTimer: ReturnType<typeof setTimeout> | undefined

watch(count, (next, previous) => {
  if (next <= previous) return
  bump.value = false
  clearTimeout(bumpTimer)
  requestAnimationFrame(() => {
    bump.value = true
    bumpTimer = setTimeout(() => { bump.value = false }, 700)
  })
})

onBeforeUnmount(() => clearTimeout(bumpTimer))
</script>

<style scoped>
.fab-enter-active {
  transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.85);
}

.fab-btn {
  animation: fab-glow 2.6s ease-in-out infinite;
}

.fab-bump {
  animation: fab-bump 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fab-glow {
  0%, 100% { box-shadow: 0 12px 28px rgb(249 115 22 / 0.35); }
  50% { box-shadow: 0 14px 34px rgb(244 63 94 / 0.5); }
}

@keyframes fab-bump {
  0% { transform: scale(1); }
  30% { transform: scale(1.15) rotate(-4deg); }
  55% { transform: scale(0.95) rotate(3deg); }
  80% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .fab-btn,
  .fab-bump {
    animation: none;
  }
}
</style>
