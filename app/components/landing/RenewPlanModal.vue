<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" @click.self="emit('close')">
      <div role="dialog" aria-modal="true" aria-labelledby="renew-title" class="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <header class="relative shrink-0 bg-gradient-to-br from-orange-400 to-rose-500 px-5 pb-5 pt-4 text-white">
          <button type="button" class="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30" aria-label="ปิด" @click="emit('close')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <p class="text-xs font-bold text-white/80">ต่ออายุ{{ kindLabel }}</p>
          <h2 id="renew-title" class="mt-1 pe-10 text-lg font-extrabold leading-snug">{{ item.name }}</h2>
          <p v-if="item.expires_at" class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <LearnIcon name="clock" class="h-3.5 w-3.5" />
            สิทธิ์เดิมถึง {{ formatThaiDate(item.expires_at) }}
          </p>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-5">
          <div v-if="pending" class="flex flex-col items-center gap-3 py-10 text-sm font-semibold text-slate-500">
            <span class="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" aria-hidden="true" />
            กำลังโหลดแพ็กเกจ...
          </div>
          <p v-else-if="error" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>
          <p v-else-if="!plans.length" class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">ตอนนี้ยังไม่มีแพ็กเกจให้ต่ออายุ กรุณาติดต่อทีมงาน</p>

          <template v-else>
            <p class="text-sm font-bold text-slate-700">เลือกแพ็กเกจต่ออายุ</p>
            <div class="mt-2 grid gap-2" role="radiogroup" aria-label="แพ็กเกจต่ออายุ">
              <label
                v-for="plan in plans"
                :key="plan.id"
                class="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition"
                :class="plan.id === planId ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100' : 'border-slate-200 hover:border-orange-200'"
              >
                <input v-model="planId" type="radio" :value="plan.id" name="renew-plan" class="h-4 w-4 accent-orange-500">
                <span class="min-w-0 flex-1">
                  <span class="block font-bold text-slate-800">{{ plan.name }}</span>
                  <span class="block text-xs text-slate-500">{{ planDurationLabel(plan) }}</span>
                </span>
                <span class="text-end">
                  <span v-if="plan.sale_price && plan.sale_price < plan.price" class="block text-xs text-slate-400 line-through">{{ formatBaht(plan.price) }}</span>
                  <span class="block font-extrabold text-orange-600">{{ formatBaht(plan.effective_price) }}</span>
                </span>
              </label>
            </div>
            <div v-if="renewalCoupon" class="mt-3 flex items-start gap-2.5 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-800 ring-1 ring-orange-100">
              <span class="text-lg leading-none" aria-hidden="true">🎉</span>
              <p>
                <span class="block font-extrabold">ส่วนลดต่ออายุ ลด {{ formatBaht(renewalCoupon.discount) }}</span>
                <span class="block text-xs text-orange-700">
                  ใช้โค้ด <span class="font-mono font-bold">{{ renewalCoupon.code }}</span> ให้อัตโนมัติ<template v-if="renewalCoupon.description"> · {{ renewalCoupon.description }}</template>
                </span>
              </p>
            </div>
            <p v-if="newExpiry" class="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              ชำระแล้วสิทธิ์จะต่อจากวันหมดอายุเดิม เรียนได้ถึงประมาณ <span class="font-bold">{{ newExpiry }}</span>
            </p>
          </template>
        </div>

        <footer v-if="!pending && plans.length" class="shrink-0 border-t border-slate-100 p-4">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:bg-slate-300 disabled:shadow-none"
            :disabled="!chosen || going"
            @click="goCheckout"
          >
            <span v-if="!going && chosen && renewalCoupon" class="text-white/70 line-through">{{ formatBaht(chosen.effective_price) }}</span>
            {{ going ? 'กำลังไปหน้าชำระเงิน...' : chosen ? `ไปชำระเงิน ${formatBaht(renewalCoupon?.total ?? chosen.effective_price)}` : 'เลือกแพ็กเกจก่อน' }}
            <LearnIcon v-if="!going" name="arrow" class="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ClassroomItem } from '@/composables/useAuth'
import { planDurationLabel, type AppliedCoupon, type CatalogItem } from '@/composables/useCart'

const DETAIL_PATHS: Record<ClassroomItem['kind'], string> = { course: '/courses', curriculum: '/curriculums', exam: '/exams' }
const KIND_LABELS: Record<ClassroomItem['kind'], string> = { course: 'คอร์ส', curriculum: 'หลักสูตร', exam: 'ข้อสอบ' }

const props = defineProps<{ item: ClassroomItem }>()
const emit = defineEmits<{ close: [] }>()

const { api } = useApi()
const { startBuyNow } = useCart()

const detail = ref<CatalogItem | null>(null)
const pending = ref(true)
const error = ref('')
const planId = ref<number | null>(null)
const going = ref(false)

const kindLabel = computed(() => KIND_LABELS[props.item.kind])
const plans = computed(() => detail.value?.price_plans ?? [])
const chosen = computed(() => plans.value.find(plan => plan.id === planId.value) ?? null)

interface RenewalQuote {
  discount: number
  total: number
  coupon: AppliedCoupon | null
}

const ITEM_TYPES: Record<ClassroomItem['kind'], string> = { course: 'course', curriculum: 'curriculum', exam: 'exam' }
const renewalCoupon = ref<{ code: string, description: string | null, discount: number, total: number } | null>(null)
let quoteRequest = 0

/** คิดยอดแพ็กเกจที่เลือกพร้อมคูปองต่ออายุอัตโนมัติ ไม่สำเร็จก็แสดงราคาปกติ */
async function previewDiscount() {
  const request = ++quoteRequest
  renewalCoupon.value = null
  if (!detail.value || !chosen.value) return
  try {
    const response = await api<{ data: RenewalQuote }>('/checkout/quote', {
      method: 'POST',
      body: {
        items: [{ type: ITEM_TYPES[props.item.kind], id: detail.value.id, plan_id: chosen.value.id }],
        auto_coupon: true,
      },
    })
    const { coupon, discount, total } = response.data
    if (request === quoteRequest && coupon && discount > 0) {
      renewalCoupon.value = { code: coupon.code, description: coupon.description, discount, total }
    }
  }
  catch {
    // The checkout page quotes again and shows any error there.
  }
}

watch(planId, previewDiscount)

const newExpiry = computed(() => {
  const days = chosen.value?.duration_days
  if (!days || !props.item.expires_at) return ''
  const base = Math.max(Date.now(), new Date(props.item.expires_at).getTime())
  return formatThaiDate(new Date(base + days * 24 * 60 * 60 * 1000).toISOString())
})

async function load() {
  pending.value = true
  error.value = ''
  try {
    const response = await api<{ data: CatalogItem }>(`${DETAIL_PATHS[props.item.kind]}/${props.item.slug}`)
    detail.value = response.data
    planId.value = response.data.price_plans?.[0]?.id ?? null
  }
  catch (exception: unknown) {
    error.value = apiErrorMessage(exception, 'โหลดแพ็กเกจไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  finally {
    pending.value = false
  }
}

async function goCheckout() {
  if (!detail.value || !chosen.value) return
  going.value = true
  if (!startBuyNow(detail.value, chosen.value.id)) {
    going.value = false
    return
  }
  await navigateTo({ path: '/checkout', query: { mode: 'buy-now' } })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  load()
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
