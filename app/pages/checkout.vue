<template>
  <section class="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
    <NuxtLink :to="buyNowMode ? '/home' : '/cart'"
      class="group inline-flex items-center gap-2 justify-self-start rounded-full bg-white py-2 pe-4 ps-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md lg:col-span-2">
      <span
        class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition group-hover:-translate-x-0.5">
        <LearnIcon name="arrow" class="h-4 w-4 rotate-180" />
      </span>
      {{ buyNowMode ? 'กลับห้องเรียนของฉัน' : 'กลับไปแก้รายการที่เลือก' }}
    </NuxtLink>
    <CheckoutSteps :current="2" class="lg:col-span-2" />
    <div>
      <h1 class="text-3xl font-extrabold text-slate-900">ยืนยันคำสั่งซื้อ</h1>
      <p class="mt-2 text-sm text-slate-500">{{ quote?.requires_shipping ? 'รายการนี้ต้องระบุที่อยู่จัดส่ง' :
        'ตรวจยอดก่อนยืนยันคำสั่งซื้อ' }}</p>
      <p v-if="buyNowMode && buyNow"
        class="mt-3 flex items-start gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-800 ring-1 ring-orange-100">
        <LearnIcon name="clock" class="mt-0.5 h-4 w-4 shrink-0" />
        <span>ต่ออายุ <span class="font-bold">{{ buyNow.name }}</span> สั่งซื้อรายการนี้รายการเดียว
          รายการที่เลือกไว้ในตะกร้ายังอยู่ครบ</span>
      </p>

      <form class="mt-6 space-y-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100" @submit.prevent="submit">
        <p class="text-xs text-slate-500">ช่องที่มีเครื่องหมาย
          <RequiredMark /> ต้องกรอก
        </p>

        <fieldset v-if="!loggedIn" class="space-y-4">
          <legend class="text-sm font-extrabold text-slate-900">ข้อมูลผู้ซื้อ</legend>
          <div class="rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
            <p class="font-bold text-slate-900">สั่งซื้อได้เลยโดยไม่ต้องสมัครสมาชิก</p>
            <p class="mt-1">กรอกอีเมลเพื่อรับคำสั่งซื้อ ถ้ายังไม่มีบัญชี ระบบจะสร้างบัญชีให้
              และส่งรหัสผ่านสำหรับเข้าห้องเรียนไปที่อีเมลนี้หลังชำระเงินสำเร็จ</p>
            <NuxtLink :to="{ path: '/signin', query: { redirect: '/checkout' } }"
              class="mt-2 inline-flex font-bold text-blue-700">มีบัญชีอยู่แล้ว เข้าสู่ระบบ</NuxtLink>
          </div>
          <label class="block text-sm font-semibold text-slate-700">
            อีเมล (สำหรับเข้าสู่ระบบ)
            <RequiredMark />
            <input v-model="form.email" type="email" required autocomplete="email"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal" @change="refreshQuote">
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold text-slate-700">
              ชื่อ-นามสกุล
              <RequiredMark v-if="quote?.requires_shipping" />
              <input v-model="form.name" :required="Boolean(quote?.requires_shipping)" maxlength="150"
                autocomplete="name" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              เบอร์โทร
              <RequiredMark v-if="quote?.requires_shipping" />
              <input v-model="form.phone" type="tel" :required="Boolean(quote?.requires_shipping)" maxlength="30"
                autocomplete="tel" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
          </div>
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="text-sm font-extrabold text-slate-900">ข้อมูลผู้เรียน</legend>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold text-slate-700">
              โรงเรียน
              <RequiredMark />
              <input v-model="form.school_name" required maxlength="255" placeholder="เช่น โรงเรียนบ้านหนองจ็อม"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              จังหวัดที่เรียน
              <RequiredMark />
              <input v-model="form.school_province" required maxlength="100" list="checkout-provinces"
                autocomplete="off" placeholder="พิมพ์หรือเลือกจังหวัด"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
          </div>
          <p class="text-xs text-slate-400">ใช้บันทึกในโปรไฟล์ผู้เรียน แก้ไขภายหลังได้ที่หน้าโปรไฟล์</p>
        </fieldset>

        <fieldset v-if="quote?.requires_shipping" class="space-y-4">
          <legend class="text-sm font-extrabold text-slate-900">ที่อยู่จัดส่ง</legend>
          <template v-if="loggedIn">
            <label class="block text-sm font-semibold text-slate-700">
              ชื่อผู้รับ
              <RequiredMark />
              <input v-model="form.name" required maxlength="150"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              เบอร์โทร
              <RequiredMark />
              <input v-model="form.phone" required maxlength="30"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
          </template>
          <label class="block text-sm font-semibold text-slate-700">
            ที่อยู่
            <RequiredMark />
            <input v-model="form.address_line1" required
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ที่อยู่เพิ่มเติม
            <input v-model="form.address_line2"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold text-slate-700">
              ตำบล/แขวง
              <input v-model="form.subdistrict"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              อำเภอ/เขต
              <RequiredMark />
              <input v-model="form.district" required
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              จังหวัด
              <RequiredMark />
              <input v-model="form.province" required list="checkout-provinces"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              รหัสไปรษณีย์
              <RequiredMark />
              <input v-model="form.postal_code" required inputmode="numeric" maxlength="5" pattern="[0-9]{5}"
                class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
          </div>
        </fieldset>

        <datalist id="checkout-provinces">
          <option v-for="province in thaiProvinces" :key="province" :value="province" />
        </datalist>

        <label class="block text-sm font-semibold text-slate-700">
          หมายเหตุ
          <textarea v-model="form.notes" rows="2"
            class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal" />
        </label>
        <p v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</p>
        <button type="submit"
          class="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="submitting || quoting || !quote">
          {{ submitting ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันสั่งซื้อ' }}
        </button>
        <p class="text-center text-xs text-slate-500">
          การกดยืนยันสั่งซื้อถือว่ายอมรับ
          <NuxtLink to="/terms" target="_blank" class="font-bold text-blue-700 hover:underline">ข้อกำหนดและเงื่อนไข
          </NuxtLink>
        </p>
      </form>
    </div>

    <aside class="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 class="font-extrabold text-slate-900">สรุปยอด</h2>
      <p v-if="quoting" class="mt-4 text-sm text-slate-500">กำลังคำนวณยอด...</p>
      <template v-else-if="quote">
        <ul class="mt-4 space-y-3">
          <li v-for="item in quote.items" :key="`${item.type}-${item.id}`" class="flex justify-between gap-3 text-sm">
            <span>
              {{ item.name }} × {{ item.quantity }}
              <span v-if="item.plan" class="block text-xs text-slate-400">{{ planDurationLabel(item.plan) }}</span>
            </span>
            <span class="shrink-0 font-semibold">{{ formatBaht(item.total_price) }}</span>
          </li>
        </ul>
        <dl class="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">ราคาสินค้า</dt>
            <dd>{{ formatBaht(quote.subtotal) }}</dd>
          </div>
          <div v-if="quote.discount" class="flex justify-between text-emerald-700">
            <dt>ส่วนลด<template v-if="quote.coupon"> ({{ quote.coupon.code }})</template></dt>
            <dd class="font-bold">-{{ formatBaht(quote.discount) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">ค่าจัดส่ง</dt>
            <dd>{{ formatBaht(quote.shipping) }}</dd>
          </div>
          <div class="flex justify-between text-base font-extrabold text-slate-900">
            <dt>ยอดสุทธิ</dt>
            <dd>{{ formatBaht(quote.total) }}</dd>
          </div>
        </dl>
      </template>
      <p v-else class="mt-4 text-sm text-slate-500">ยังคำนวณยอดไม่ได้</p>
      <CouponField class="mt-5 border-t border-slate-100 pt-4" :code="couponInput" :applied="quote?.coupon ?? null"
        :discount="quote?.discount" :error="couponError" :pending="quoting"
        :hint="loggedIn ? '' : 'คูปองที่จำกัดสิทธิ์ต่อคนหรือกลุ่มนักเรียน ตรวจตามบัญชีของอีเมลที่กรอก'"
        @apply="applyCoupon" @remove="removeCoupon" />
    </aside>
  </section>
</template>

<script setup lang="ts">
import { planDurationLabel, type AppliedCoupon } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

useHead({ title: 'ยืนยันคำสั่งซื้อ | ClickClass Tutor' })

interface QuoteItem {
  type: string
  id: number
  name: string
  quantity: number
  unit_price: number
  total_price: number
  plan?: { id: number | null, name: string, duration_days: number | null } | null
}

interface Quote {
  items: QuoteItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  requires_shipping: boolean
  coupon: AppliedCoupon | null
}

interface CreatedOrder {
  id: number
}

interface GuestOrderResponse {
  order: CreatedOrder
  guest_token: string
  account_created: boolean
}

const { api } = useApi()
const { loggedIn, user, fetchUser } = useAuth()
const { items, couponCode, autoCouponOff, clear, checkoutItems, buyNow, buyNowItems, clearBuyNow } = useCart()
const { remember, setNotice } = useGuestOrders()
const route = useRoute()

const buyNowRequested = route.query.mode === 'buy-now'
const buyNowMode = computed(() => buyNowRequested && Boolean(buyNow.value))
const orderItems = () => (buyNowMode.value ? buyNowItems() : checkoutItems())
const buyNowCoupon = ref('')
const couponInput = computed({
  get: () => (buyNowMode.value ? buyNowCoupon.value : couponCode.value),
  set: (value: string) => {
    if (buyNowMode.value) buyNowCoupon.value = value
    else couponCode.value = value
  },
})
const buyNowAutoOff = ref(false)
const autoOff = computed({
  get: () => (buyNowMode.value ? buyNowAutoOff.value : autoCouponOff.value),
  set: (value: boolean) => {
    if (buyNowMode.value) buyNowAutoOff.value = value
    else autoCouponOff.value = value
  },
})
const couponError = ref('')
/** โค้ดที่กรอก หรือคูปองต่ออายุที่ระบบใส่ให้จากผลคิดยอดล่าสุด */
const orderCoupon = () => couponInput.value.trim() || (quote.value?.coupon?.auto ? quote.value.coupon.code : undefined)
const hasOrderItems = computed(() => (buyNowMode.value ? Boolean(buyNow.value) : items.value.length > 0))

function finishOrder() {
  if (buyNowMode.value) clearBuyNow()
  else clear()
}

const form = reactive({
  email: '',
  name: '',
  phone: '',
  school_name: '',
  school_province: '',
  address_line1: '',
  address_line2: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
  notes: '',
})

const quote = ref<Quote | null>(null)
const quoting = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))

const missingPlan = items.value.some(item => item.type !== 'book' && (item.plans?.length ?? 0) > 1 && !item.plan_id)

if (buyNowRequested && !buyNowMode.value) {
  await navigateTo('/home')
}
else if (!buyNowMode.value && (items.value.length === 0 || missingPlan)) {
  await navigateTo('/cart')
}

watch(user, (value) => {
  if (!value) return
  if (!form.name) form.name = value.name
  if (!form.phone && value.phone) form.phone = value.phone
  if (!form.school_name && value.school_name) form.school_name = value.school_name
  if (!form.school_province && value.school_province) form.school_province = value.school_province
}, { immediate: true })

let quoteRequest = 0

async function refreshQuote(): Promise<void> {
  if (!hasOrderItems.value) return
  const request = ++quoteRequest
  errorMessage.value = ''
  quoting.value = true
  try {
    const response = await api<{ data: Quote }>(loggedIn.value ? '/checkout/quote' : '/guest/checkout/quote', {
      method: 'POST',
      body: {
        ...(!loggedIn.value && validEmail.value ? { email: form.email.trim() } : {}),
        items: orderItems(),
        coupon_code: couponInput.value.trim() || undefined,
        auto_coupon: !couponInput.value.trim() && !autoOff.value,
      },
    })
    if (request === quoteRequest) quote.value = response.data
  }
  catch (error: unknown) {
    if (request !== quoteRequest) return
    if (dropInvalidCoupon(error)) return refreshQuote()
    quote.value = null
    errorMessage.value = apiErrorMessage(error, 'คำนวณยอดไม่สำเร็จ')
  }
  finally {
    if (request === quoteRequest) quoting.value = false
  }
}

/** คูปองไม่ผ่านเงื่อนไข: แจ้งเหตุผลและเอาโค้ดออก จะได้คิดยอดและสั่งซื้อต่อได้ */
function dropInvalidCoupon(error: unknown) {
  const message = orderCoupon() ? apiFieldError(error, 'coupon_code') : ''
  if (!message) return false
  couponError.value = message
  if (!couponInput.value && quote.value?.coupon?.auto) autoOff.value = true
  couponInput.value = ''
  return true
}

function applyCoupon(code: string) {
  couponError.value = ''
  couponInput.value = code
  refreshQuote()
}

function removeCoupon() {
  couponError.value = ''
  if (!couponInput.value && quote.value?.coupon?.auto) autoOff.value = true
  couponInput.value = ''
  refreshQuote()
}

if (hasOrderItems.value) await refreshQuote()

function shippingBody() {
  if (!quote.value?.requires_shipping) return {}
  return {
    shipping: {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() || null,
      subdistrict: form.subdistrict.trim() || null,
      district: form.district.trim(),
      province: form.province.trim(),
      postal_code: form.postal_code.trim(),
    },
  }
}

async function submit() {
  if (!quote.value || submitting.value) return
  if (!form.school_name.trim() || !form.school_province.trim()) {
    errorMessage.value = 'กรุณากรอกโรงเรียนและจังหวัดที่เรียน'
    return
  }
  if (quote.value.requires_shipping && !/^\d{5}$/.test(form.postal_code.trim())) {
    errorMessage.value = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  const body = {
    items: orderItems(),
    notes: form.notes.trim() || null,
    coupon_code: orderCoupon(),
    school_name: form.school_name.trim(),
    province: form.school_province.trim(),
    ...shippingBody(),
  }

  try {
    if (loggedIn.value) {
      const response = await api<{ data: CreatedOrder }>('/orders', { method: 'POST', body })
      finishOrder()
      fetchUser()
      await navigateTo(`/orders/${response.data.id}`)
      return
    }

    const email = form.email.trim().toLowerCase()
    const response = await api<{ data: GuestOrderResponse }>('/guest/orders', {
      method: 'POST',
      body: {
        ...body,
        email,
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
      },
    })
    const result = response.data
    remember(result.order.id, result.guest_token)
    setNotice({
      orderId: result.order.id,
      email,
      accountCreated: result.account_created,
    })
    finishOrder()
    await navigateTo(`/orders/${result.order.id}`)
  }
  catch (error: unknown) {
    if (apiStatus(error) === 401) {
      await navigateTo({ path: '/signin', query: { redirect: route.fullPath } })
      return
    }
    if (dropInvalidCoupon(error)) {
      await refreshQuote()
      errorMessage.value = 'โค้ดส่วนลดใช้ไม่ได้แล้ว ตรวจยอดใหม่แล้วกดยืนยันอีกครั้ง'
      return
    }
    errorMessage.value = apiErrorMessage(error, 'สร้างคำสั่งซื้อไม่สำเร็จ')
  }
  finally {
    submitting.value = false
  }
}
</script>
