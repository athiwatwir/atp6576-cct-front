<template>
  <section class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <h1 class="text-3xl font-extrabold text-slate-900">ตะกร้าสินค้า</h1>

    <p v-if="items.length === 0" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
      ยังไม่มีสินค้าในตะกร้า
      <NuxtLink to="/books" class="ms-1 font-bold text-blue-700">เลือกสินค้า</NuxtLink>
    </p>

    <div v-else class="mt-6 space-y-4">
      <article v-for="item in items" :key="`${item.type}-${item.id}`" class="flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div class="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sky-50">
          <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="h-full w-full object-cover">
          <div v-else class="flex h-full items-center justify-center text-3xl" aria-hidden="true">📚</div>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-bold text-slate-800">{{ item.name }}</h2>
          <label v-if="(item.plans?.length ?? 0) > 1" class="mt-2 block text-xs font-semibold text-slate-500">
            แพ็กเกจ
            <select
              :value="item.plan_id ?? ''"
              class="mt-1 block w-full rounded-xl border px-3 py-2 text-sm font-normal text-slate-800"
              :class="item.plan_id ? 'border-slate-200' : 'border-rose-300 bg-rose-50'"
              @change="setPlan(item.type, item.id, Number(($event.target as HTMLSelectElement).value) || null)"
            >
              <option value="" disabled>เลือกแพ็กเกจ</option>
              <option v-for="plan in item.plans" :key="plan.id" :value="plan.id">
                {{ plan.name }} · {{ formatBaht(plan.effective_price) }}
              </option>
            </select>
          </label>
          <p v-else-if="selectedPlan(item)" class="mt-1 text-xs text-slate-500">{{ selectedPlan(item)!.name }} · {{ planDurationLabel(selectedPlan(item)!) }}</p>
          <p v-if="(item.plans?.length ?? 0) > 1 && selectedPlan(item)" class="mt-1 text-xs text-slate-500">{{ planDurationLabel(selectedPlan(item)!) }}</p>
          <p class="mt-1 text-sm text-blue-700">{{ formatBaht(item.unit_price) }}</p>
          <div class="mt-3 flex items-center gap-2">
            <button type="button" class="h-8 w-8 rounded-full border border-slate-200 font-bold" aria-label="ลดจำนวน" @click="setQuantity(item.type, item.id, item.quantity - 1)">−</button>
            <span class="w-8 text-center text-sm font-bold">{{ item.quantity }}</span>
            <button
              type="button"
              class="h-8 w-8 rounded-full border border-slate-200 font-bold disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
              :disabled="item.type !== 'book' || item.quantity >= lineLimit(item.stock)"
              @click="setQuantity(item.type, item.id, item.quantity + 1)"
            >+</button>
            <button type="button" class="ms-auto text-sm font-semibold text-rose-600" @click="remove(item.type, item.id)">นำออก</button>
          </div>
        </div>
        <p class="text-sm font-bold text-slate-800">{{ formatBaht(item.unit_price * item.quantity) }}</p>
      </article>

      <div class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">รวม</span>
          <span class="text-lg font-extrabold text-slate-900">{{ formatBaht(subtotal) }}</span>
        </div>
        <label class="mt-4 block text-sm font-semibold text-slate-700">
          คูปอง
          <input v-model="couponCode" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal" @change="refreshQuote">
        </label>
        <p v-if="quote" class="mt-3 text-sm text-slate-600">ยอดสุทธิ {{ formatBaht(quote.total) }} <span v-if="quote.requires_shipping">· มีค่าจัดส่ง</span></p>
        <p v-else-if="quoteError" class="mt-3 text-sm text-rose-600">{{ quoteError }}</p>
        <p v-else-if="loggedIn" class="mt-1 text-xs text-slate-400">ยอดสุดท้ายคำนวณอีกครั้งตอนยืนยันคำสั่งซื้อ</p>
        <p v-else class="mt-1 text-xs text-slate-400">สั่งซื้อได้โดยไม่ต้องสมัครสมาชิก ระบบคำนวณยอดสุทธิและคูปองอีกครั้งเมื่อกรอกอีเมลในขั้นตอนถัดไป</p>
        <p v-if="missingPlan" class="mt-3 text-sm text-rose-600">เลือกแพ็กเกจของทุกรายการก่อนสั่งซื้อ</p>
        <span
          v-if="missingPlan"
          class="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-slate-300 px-5 py-3 text-sm font-bold text-white"
          aria-disabled="true"
        >
          <LearnIcon name="cart" class="h-4 w-4" />
          สั่งซื้อ
        </span>
        <NuxtLink v-else to="/checkout" class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
          <LearnIcon name="cart" class="h-4 w-4" />
          สั่งซื้อ
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { planDurationLabel, selectedPlan } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

useHead({ title: 'ตะกร้าสินค้า | ClickClass Tutor' })

const { loggedIn } = useAuth()
const { api } = useApi()
const { items, subtotal, couponCode, setQuantity, setPlan, remove, checkoutItems, syncCatalogLines } = useCart()

const missingPlan = computed(() => items.value.some(item => item.type !== 'book' && (item.plans?.length ?? 0) > 1 && !item.plan_id))

interface Quote {
  total: number
  requires_shipping: boolean
}

const quote = ref<Quote | null>(null)
const quoteError = ref('')

let quoteRequest = 0

async function refreshQuote() {
  const request = ++quoteRequest
  quoteError.value = ''
  if (!loggedIn.value || items.value.length === 0 || missingPlan.value) {
    quote.value = null
    return
  }
  try {
    const response = await api<{ data: Quote }>('/checkout/quote', {
      method: 'POST',
      body: {
        items: checkoutItems(),
        coupon_code: couponCode.value.trim() || undefined,
      },
    })
    if (request === quoteRequest) quote.value = response.data
  }
  catch (error: unknown) {
    if (request !== quoteRequest) return
    quote.value = null
    quoteError.value = apiErrorMessage(error, 'คำนวณยอดไม่สำเร็จ')
  }
}

watch(items, () => { refreshQuote() }, { deep: true })
onMounted(async () => {
  try {
    await syncCatalogLines()
  }
  catch {
    // The quote below still validates prices and plans against the API.
  }
  refreshQuote()
})

function lineLimit(stock: number | null) {
  return Math.min(stock ?? 99, 99)
}
</script>
