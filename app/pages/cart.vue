<template>
  <section class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <CheckoutSteps :current="1" class="mb-6" />
    <h1 class="text-3xl font-extrabold text-slate-900">รายการที่เลือก</h1>

    <p v-if="items.length === 0" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
      ยังไม่มีรายการที่เลือก
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
        <CouponField
          v-if="!missingPlan"
          class="mt-4"
          :code="couponCode"
          :applied="quote?.coupon ?? null"
          :discount="quote?.discount"
          :error="couponError"
          :pending="quoting"
          :hint="loggedIn ? '' : 'ระบบตรวจโค้ดอีกครั้งตามบัญชีของอีเมลที่กรอกในขั้นตอนถัดไป'"
          @apply="applyCoupon"
          @remove="removeCoupon"
        />
        <dl v-if="quote" class="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
          <div v-if="quote.discount" class="flex justify-between text-emerald-700">
            <dt>ส่วนลด<template v-if="quote.coupon"> ({{ quote.coupon.code }})</template></dt>
            <dd class="font-bold">-{{ formatBaht(quote.discount) }}</dd>
          </div>
          <div class="flex justify-between font-extrabold text-slate-900">
            <dt>ยอดสุทธิ</dt>
            <dd>{{ formatBaht(quote.total) }}</dd>
          </div>
          <p v-if="quote.requires_shipping" class="text-xs text-slate-400">ยังไม่รวมค่าจัดส่ง (ถ้ามี)</p>
        </dl>
        <p v-else-if="quoteError" class="mt-3 text-sm text-rose-600">{{ quoteError }}</p>
        <p v-if="!loggedIn" class="mt-2 text-xs text-slate-400">สั่งซื้อได้โดยไม่ต้องสมัครสมาชิก กรอกอีเมลในขั้นตอนถัดไป</p>
        <p v-if="missingPlan" class="mt-3 text-sm text-rose-600">เลือกแพ็กเกจของทุกรายการก่อนสั่งซื้อ</p>
        <span
          v-if="missingPlan"
          class="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-slate-300 px-5 py-3 text-sm font-bold text-white"
          aria-disabled="true"
        >
          <LearnIcon name="cart" class="h-4 w-4" />
          สั่งซื้อ
        </span>
        <span
          v-else-if="loggedIn && quoting && !quote"
          class="mt-4 inline-flex w-full cursor-wait items-center justify-center gap-2 rounded-full bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
          aria-busy="true"
        >
          กำลังตรวจสอบยอดและข้อมูล...
        </span>
        <template v-else-if="readyProfile && quote">
          <div class="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
            <p class="flex items-center gap-2 font-bold">
              <LearnIcon name="check" class="h-4 w-4 shrink-0" />
              ข้อมูลครบแล้ว ไปชำระเงินได้เลย
            </p>
            <p class="mt-1 text-xs text-emerald-800">
              ผู้เรียน {{ readyProfile.name }} · {{ readyProfile.school }} · เรียนที่ จ.{{ readyProfile.province }}
            </p>
            <p v-if="readyProfile.shipping" class="mt-1 text-xs text-emerald-800">
              ส่งถึง {{ readyProfile.shipping.name }} {{ readyProfile.shipping.phone }} · {{ shippingAddress(readyProfile.shipping) }}
            </p>
            <NuxtLink to="/checkout" class="mt-2 inline-flex text-xs font-bold text-blue-700 hover:underline">
              แก้ไขข้อมูลหรือเพิ่มหมายเหตุก่อนสั่งซื้อ
            </NuxtLink>
          </div>
          <p v-if="orderError" class="mt-3 text-sm text-rose-600">{{ orderError }}</p>
          <button
            type="button"
            class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            :disabled="ordering"
            @click="placeOrder"
          >
            <LearnIcon name="receipt" class="h-4 w-4" />
            {{ ordering ? 'กำลังสร้างคำสั่งซื้อ...' : `ไปชำระเงิน ${formatBaht(quote.total)}` }}
          </button>
          <p class="mt-2 text-center text-xs text-slate-500">
            การกดไปชำระเงินถือว่ายอมรับ
            <NuxtLink to="/terms" target="_blank" class="font-bold text-blue-700 hover:underline">ข้อกำหนดและเงื่อนไข</NuxtLink>
          </p>
        </template>
        <NuxtLink v-else to="/checkout" class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
          <LearnIcon name="cart" class="h-4 w-4" />
          สั่งซื้อ
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { planDurationLabel, selectedPlan, type AppliedCoupon } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

useHead({ title: 'รายการที่เลือก | ClickClass Tutor' })

const { loggedIn, user, fetchUser } = useAuth()
const { api } = useApi()
const { items, subtotal, couponCode, autoCouponOff, setQuantity, setPlan, remove, clear, checkoutItems, syncCatalogLines } = useCart()

const missingPlan = computed(() => items.value.some(item => item.type !== 'book' && (item.plans?.length ?? 0) > 1 && !item.plan_id))

interface Quote {
  discount: number
  total: number
  requires_shipping: boolean
  coupon: AppliedCoupon | null
}

const quote = ref<Quote | null>(null)
const quoteError = ref('')
const couponError = ref('')
const quoting = ref(items.value.length > 0)

let quoteRequest = 0

async function refreshQuote(): Promise<void> {
  const request = ++quoteRequest
  quoteError.value = ''
  if (items.value.length === 0 || missingPlan.value) {
    quote.value = null
    quoting.value = false
    return
  }
  quoting.value = true
  try {
    const response = await api<{ data: Quote }>(loggedIn.value ? '/checkout/quote' : '/guest/checkout/quote', {
      method: 'POST',
      body: {
        items: checkoutItems(),
        coupon_code: couponCode.value.trim() || undefined,
        auto_coupon: !couponCode.value.trim() && !autoCouponOff.value,
      },
    })
    if (request === quoteRequest) quote.value = response.data
  }
  catch (error: unknown) {
    if (request !== quoteRequest) return
    const couponMessage = couponCode.value ? apiFieldError(error, 'coupon_code') : ''
    if (couponMessage) {
      couponError.value = couponMessage
      couponCode.value = ''
      return refreshQuote()
    }
    quote.value = null
    quoteError.value = apiErrorMessage(error, 'คำนวณยอดไม่สำเร็จ')
  }
  finally {
    if (request === quoteRequest) quoting.value = false
  }
}

/** โค้ดที่กรอก หรือคูปองต่ออายุที่ระบบใส่ให้จากผลคิดยอดล่าสุด */
function orderCoupon() {
  return couponCode.value.trim() || (quote.value?.coupon?.auto ? quote.value.coupon.code : undefined)
}

function applyCoupon(code: string) {
  couponError.value = ''
  couponCode.value = code
  refreshQuote()
}

function removeCoupon() {
  couponError.value = ''
  if (!couponCode.value && quote.value?.coupon?.auto) autoCouponOff.value = true
  couponCode.value = ''
  refreshQuote()
}

watch(items, () => { refreshQuote() }, { deep: true })
watch(loggedIn, () => { refreshQuote() })
onMounted(() => {
  refreshQuote()
  // A changed line re-runs the quote through the items watcher; the quote validates prices on its own.
  syncCatalogLines().catch(() => {})
})

interface ShippingInput {
  name: string
  phone: string
  address_line1: string
  subdistrict: string | null
  district: string
  province: string
  postal_code: string
}

const filled = (value?: string | null) => value?.trim() ?? ''

const readyProfile = computed(() => {
  const current = user.value
  if (!loggedIn.value || !current || !quote.value) return null
  const school = filled(current.school_name)
  const province = filled(current.school_province)
  if (!school || !province) return null
  if (!quote.value.requires_shipping) return { name: current.name, school, province, shipping: null }

  const address = current.address
  const shipping: ShippingInput = {
    name: filled(current.name),
    phone: filled(current.phone),
    address_line1: filled(address?.address_line1),
    subdistrict: filled(address?.subdistrict) || null,
    district: filled(address?.district),
    province: filled(address?.province),
    postal_code: filled(address?.postal_code),
  }
  const complete = shipping.name && shipping.phone && shipping.address_line1 && shipping.district && shipping.province && /^\d{5}$/.test(shipping.postal_code)
  return complete ? { name: current.name, school, province, shipping } : null
})

function shippingAddress(shipping: ShippingInput) {
  return [shipping.address_line1, shipping.subdistrict, shipping.district, shipping.province, shipping.postal_code].filter(Boolean).join(' ')
}

const ordering = ref(false)
const orderError = ref('')

async function placeOrder() {
  const profile = readyProfile.value
  if (!profile || ordering.value) return
  ordering.value = true
  orderError.value = ''
  try {
    const response = await api<{ data: { id: number } }>('/orders', {
      method: 'POST',
      body: {
        items: checkoutItems(),
        coupon_code: orderCoupon(),
        school_name: profile.school,
        province: profile.province,
        ...(profile.shipping ? { shipping: profile.shipping } : {}),
      },
    })
    clear()
    fetchUser()
    await navigateTo(`/orders/${response.data.id}`)
  }
  catch (error: unknown) {
    if (apiStatus(error) === 401) {
      await navigateTo({ path: '/signin', query: { redirect: '/cart' } })
      return
    }
    const couponMessage = orderCoupon() ? apiFieldError(error, 'coupon_code') : ''
    if (couponMessage) {
      couponError.value = couponMessage
      if (!couponCode.value && quote.value?.coupon?.auto) autoCouponOff.value = true
      couponCode.value = ''
      orderError.value = 'โค้ดส่วนลดใช้ไม่ได้แล้ว ตรวจยอดใหม่แล้วกดไปชำระเงินอีกครั้ง'
      refreshQuote()
      return
    }
    orderError.value = apiErrorMessage(error, 'สร้างคำสั่งซื้อไม่สำเร็จ ลองกรอกข้อมูลในขั้นตอนถัดไปแทน')
  }
  finally {
    ordering.value = false
  }
}

function lineLimit(stock: number | null) {
  return Math.min(stock ?? 99, 99)
}
</script>
