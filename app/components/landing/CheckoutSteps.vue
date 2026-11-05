<template>
  <nav aria-label="ขั้นตอนการสั่งซื้อ" class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:p-5">
    <ol class="relative grid grid-cols-4">
      <span class="absolute start-[12.5%] end-[12.5%] top-5 h-1 rounded-full bg-slate-100" aria-hidden="true" />
      <span
        class="absolute start-[12.5%] top-5 h-1 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
        :style="{ width: `${progressWidth}%` }"
        aria-hidden="true"
      />
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="relative flex flex-col items-center text-center"
        :aria-current="index + 1 === current && !complete ? 'step' : undefined"
      >
        <span
          class="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold ring-4 ring-white transition"
          :class="stateOf(index + 1) === 'done'
            ? 'bg-emerald-500 text-white'
            : stateOf(index + 1) === 'current'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-slate-100 text-slate-400'"
        >
          <LearnIcon v-if="stateOf(index + 1) === 'done'" name="check" class="h-5 w-5" />
          <LearnIcon v-else :name="step.icon" class="h-5 w-5" />
          <span v-if="stateOf(index + 1) === 'current'" class="absolute inset-0 animate-ping rounded-full bg-blue-400/30" aria-hidden="true" />
        </span>
        <span
          class="mt-2 text-xs font-extrabold sm:text-sm"
          :class="stateOf(index + 1) === 'upcoming' ? 'text-slate-400' : stateOf(index + 1) === 'done' ? 'text-emerald-700' : 'text-blue-700'"
        >
          {{ step.title }}
        </span>
        <span class="mt-0.5 hidden text-xs text-slate-400 md:block">{{ step.detail }}</span>
      </li>
    </ol>
    <p class="mt-4 rounded-2xl px-4 py-2.5 text-center text-sm font-semibold md:hidden" :class="complete ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'">
      {{ complete ? 'ชำระเงินเสร็จสิ้นแล้ว' : `ขั้นที่ ${current} จาก ${steps.length}: ${steps[current - 1]?.detail}` }}
    </p>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** ขั้นที่กำลังทำ 1-4 */
  current: number
  /** ทำครบทุกขั้นแล้ว (ชำระเงินสำเร็จ) */
  complete?: boolean
  /** ข้อความใต้ขั้นชำระเงิน เช่น รอตรวจสลิป */
  payDetail?: string
}>(), { complete: false, payDetail: '' })

const steps = computed(() => [
  { title: 'เลือกรายการ', detail: 'เลือกคอร์สหรือหนังสือ', icon: 'cart' as const },
  { title: 'กรอกข้อมูล', detail: 'ตรวจยอดและยืนยันคำสั่งซื้อ', icon: 'profile' as const },
  { title: 'ชำระเงิน', detail: props.payDetail || 'QR บัตร e-Wallet หรือโอน', icon: 'receipt' as const },
  { title: 'เสร็จสิ้น', detail: 'เข้าเรียนหรือรอรับหนังสือ', icon: 'check' as const },
])

function stateOf(step: number): 'done' | 'current' | 'upcoming' {
  if (props.complete || step < props.current) return 'done'
  return step === props.current ? 'current' : 'upcoming'
}

const progressWidth = computed(() => {
  const reached = props.complete ? steps.value.length : props.current
  return (Math.max(0, reached - 1) / (steps.value.length - 1)) * 75
})
</script>
