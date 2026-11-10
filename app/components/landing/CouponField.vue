<template>
  <div>
    <p class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      <LearnIcon name="receipt" class="h-4 w-4 text-orange-500" />
      โค้ดส่วนลด
    </p>

    <div v-if="applied" class="mt-2 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
      <div class="flex items-start gap-2">
        <LearnIcon name="check" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-emerald-800">
            <span class="font-mono">{{ applied.code }}</span>
            <span v-if="discount" class="ms-1">ลด {{ formatBaht(discount) }}</span>
          </p>
          <p v-if="applied.description" class="mt-0.5 text-xs text-emerald-700">{{ applied.description }}</p>
          <p v-if="applied.auto" class="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <LearnIcon name="clock" class="h-3 w-3" />
            ส่วนลดต่ออายุ ใช้ให้อัตโนมัติ
          </p>
        </div>
        <button type="button" class="shrink-0 text-xs font-bold text-rose-600 hover:underline disabled:opacity-50" :disabled="pending" @click="emit('remove')">
          {{ applied.auto ? 'ไม่ใช้โค้ดนี้' : 'ยกเลิกโค้ด' }}
        </button>
      </div>
      <div v-if="applied.gifts.length" class="mt-2.5 rounded-xl bg-white p-3 ring-1 ring-emerald-100">
        <p class="text-xs font-extrabold text-slate-800">🎁 ของแถมที่ได้หลังชำระเงิน</p>
        <ul class="mt-1.5 space-y-1">
          <li v-for="gift in applied.gifts" :key="`${gift.type}-${gift.id}`" class="flex items-start gap-1.5 text-xs text-slate-600">
            <LearnIcon :name="gift.type === 'exam' ? 'exam' : 'book'" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span><span class="font-semibold text-slate-500">{{ gift.type === 'exam' ? 'ข้อสอบ' : 'หนังสือ' }}</span> {{ gift.name }}</span>
          </li>
        </ul>
        <p v-if="applied.gifts.some(gift => gift.type === 'book')" class="mt-1.5 text-[11px] text-slate-400">
          หนังสือแถมจัดส่งตามที่อยู่ในคำสั่งซื้อหนังสือ หรือที่อยู่ในโปรไฟล์
        </p>
      </div>
    </div>

    <div v-else class="mt-2 flex gap-2">
      <input
        v-model="draft"
        type="text"
        maxlength="50"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        placeholder="กรอกโค้ด เช่น NEW250"
        aria-label="โค้ดส่วนลด"
        class="min-w-0 flex-1 rounded-2xl border px-3 py-2 font-mono text-sm uppercase outline-none transition placeholder:font-sans placeholder:normal-case focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        :class="error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'"
        @keydown.enter.prevent="apply"
      >
      <button
        type="button"
        class="shrink-0 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        :disabled="pending || !draft.trim()"
        @click="apply"
      >
        {{ pending && draft.trim() ? 'กำลังตรวจ...' : 'ใช้โค้ด' }}
      </button>
    </div>

    <p v-if="error" class="mt-1.5 flex items-start gap-1 text-xs font-semibold text-rose-600" role="alert">{{ error }}</p>
    <p v-else-if="hint && !applied" class="mt-1.5 text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import type { AppliedCoupon } from '@/composables/useCart'

const props = defineProps<{
  /** รหัสที่กำลังใช้ (ค่าว่างเมื่อยังไม่ใช้) */
  code: string
  applied: AppliedCoupon | null
  discount?: number
  error?: string
  pending?: boolean
  hint?: string
}>()

const emit = defineEmits<{ apply: [code: string], remove: [] }>()

const draft = ref(props.code)

watch(() => props.code, (value) => {
  if (value) draft.value = value
})

function apply() {
  const code = draft.value.trim().toUpperCase()
  if (!code || props.pending) return
  draft.value = code
  emit('apply', code)
}
</script>
