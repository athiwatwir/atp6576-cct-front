<template>
  <section class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <p v-if="pending" class="text-sm text-slate-500">กำลังโหลดคำสั่งซื้อ...</p>
    <p v-else-if="errorMessage" class="rounded-3xl bg-white p-6 text-sm text-rose-600 ring-1 ring-slate-100">{{ errorMessage }}</p>

    <template v-else-if="order">
      <NuxtLink v-if="!guestMode" to="/orders" class="text-sm font-bold text-blue-700">ประวัติการสั่งซื้อ</NuxtLink>
      <h1 class="mt-2 text-3xl font-extrabold text-slate-900">คำสั่งซื้อ {{ order.order_no }}</h1>
      <p class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold" :class="statusClass">{{ order.payment_status_label }}</p>

      <div v-if="notice" class="mt-6 rounded-3xl bg-blue-50 p-5 text-sm text-slate-700">
        <p class="font-bold text-slate-900">{{ notice.accountCreated ? 'สร้างบัญชีให้แล้ว' : 'เพิ่มคำสั่งซื้อในบัญชีเดิมแล้ว' }}</p>
        <p v-if="notice.accountCreated && notice.emailSent" class="mt-1">ส่งรหัสผ่านและเลขคำสั่งซื้อไปที่ {{ notice.email }} แล้ว ใช้อีเมลนี้กับรหัสผ่านจากอีเมลเข้าสู่ระบบเพื่อเข้าห้องเรียนหลังชำระเงิน</p>
        <p v-else-if="notice.emailSent" class="mt-1">อีเมล {{ notice.email }} มีบัญชีอยู่แล้ว เข้าสู่ระบบด้วยรหัสผ่านเดิมเพื่อเข้าห้องเรียนหลังชำระเงิน</p>
        <p v-else class="mt-1">ส่งอีเมลไปที่ {{ notice.email }} ไม่สำเร็จ คำสั่งซื้อยังถูกสร้างแล้ว ถ้าไม่มีรหัสผ่านเข้าสู่ระบบ กรุณาติดต่อแอดมิน</p>
      </div>

      <div class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <ul class="space-y-3 text-sm">
          <li v-for="item in order.items" :key="`${item.type}-${item.id}`" class="flex justify-between gap-3">
            <span>
              {{ item.name }} × {{ item.quantity }}
              <span v-if="item.plan" class="block text-xs text-slate-400">{{ planDurationLabel(item.plan) }}</span>
            </span>
            <span class="shrink-0 font-semibold">{{ formatBaht(item.total_price) }}</span>
          </li>
        </ul>
        <dl class="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div v-if="order.discount" class="flex justify-between">
            <dt class="text-slate-500">ส่วนลด</dt>
            <dd>-{{ formatBaht(order.discount) }}</dd>
          </div>
          <div v-if="order.shipping_amount" class="flex justify-between">
            <dt class="text-slate-500">ค่าจัดส่ง</dt>
            <dd>{{ formatBaht(order.shipping_amount) }}</dd>
          </div>
          <div class="flex justify-between text-base font-extrabold text-slate-900">
            <dt>ยอดสุทธิ</dt>
            <dd>{{ formatBaht(order.total) }}</dd>
          </div>
          <template v-if="order.payment?.fee_amount">
            <div class="flex justify-between">
              <dt class="text-slate-500">ค่าธรรมเนียม{{ order.payment.method_label ? ` (${order.payment.method_label})` : '' }}</dt>
              <dd>{{ formatBaht(order.payment.fee_amount) }}</dd>
            </div>
            <div class="flex justify-between font-bold text-slate-900">
              <dt>ยอดที่ชำระ</dt>
              <dd>{{ formatBaht(order.payment.amount) }}</dd>
            </div>
          </template>
        </dl>
        <p v-if="order.shipping" class="mt-3 text-sm text-slate-500">
          จัดส่งถึง {{ order.shipping.name }} {{ order.shipping.address_line1 }} {{ order.shipping.province }} {{ order.shipping.postal_code }}
        </p>
      </div>

      <div v-if="order.payment_status === 'paid'" class="mt-6 rounded-3xl bg-emerald-50 p-5 text-sm text-emerald-700">
        <p class="font-bold">ชำระเงินแล้ว</p>
        <template v-if="order.kind === 'enrollment'">
          <template v-if="loggedIn">
            <p class="mt-1">เปิดสิทธิ์เรียนให้แล้ว เข้าเรียนได้จากเมนูเข้าห้องเรียน</p>
            <NuxtLink to="/home" class="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">เข้าห้องเรียน</NuxtLink>
          </template>
          <template v-else>
            <p class="mt-1">เปิดสิทธิ์เรียนให้แล้ว เข้าสู่ระบบด้วยอีเมลที่ใช้สั่งซื้อและรหัสผ่านจากอีเมลเพื่อเข้าเรียน</p>
            <NuxtLink :to="{ path: '/signin', query: { redirect: '/home' } }" class="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">เข้าสู่ระบบเพื่อเข้าเรียน</NuxtLink>
          </template>
        </template>
      </div>

      <template v-else-if="payable">
        <p v-if="order.payment_status === 'awaiting_verification'" class="mt-6 rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
          ส่งสลิปแล้ว รอแอดมินตรวจสอบ ถ้าต้องการชำระออนไลน์แทนก็เลือกวิธีด้านล่างได้
        </p>
        <p v-if="order.payment?.status === 'failed' && order.payment.failure_message" class="mt-6 rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">
          การชำระครั้งล่าสุดไม่สำเร็จ: {{ order.payment.failure_message }}
        </p>

        <div class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 class="font-extrabold text-slate-900">เลือกวิธีชำระเงิน</h2>
          <p v-if="optionsPending" class="mt-3 text-sm text-slate-500">กำลังโหลดวิธีชำระ...</p>
          <p v-else-if="optionsError" class="mt-3 text-sm text-rose-600">{{ optionsError }}</p>
          <div v-else class="mt-3 grid gap-2">
            <label
              v-for="option in options"
              :key="option.method"
              class="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition"
              :class="option.method === method ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'"
            >
              <input v-model="method" type="radio" name="payment-method" :value="option.method" class="h-4 w-4 accent-blue-600">
              <span class="min-w-0 flex-1">
                <span class="block font-bold text-slate-800">{{ option.label }}</span>
                <span class="block text-xs text-slate-500">{{ option.fee_label || 'ไม่มีค่าธรรมเนียม' }}</span>
              </span>
              <span class="text-end">
                <span class="block font-extrabold text-blue-700">{{ formatBaht(option.total) }}</span>
                <span v-if="option.fee_amount" class="block text-xs text-slate-400">รวมค่าธรรมเนียม {{ formatBaht(option.fee_amount) }}</span>
              </span>
            </label>
          </div>

          <div v-if="selectedOption && selectedOption.method !== 'bank_transfer'" class="mt-4">
            <p class="text-sm text-slate-500">
              {{ selectedOption.method === 'thai_qr' ? 'ระบบจะพาไปหน้าชำระเงินเพื่อสแกน QR พร้อมเพย์' : 'ระบบจะพาไปหน้าชำระเงินเพื่อกรอกบัตรอย่างปลอดภัย' }}
              ยอดชำระ {{ formatBaht(selectedOption.total) }}
            </p>
            <p v-if="linkError" class="mt-2 text-sm text-rose-600">{{ linkError }}</p>
            <button
              type="button"
              class="mt-3 w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300"
              :disabled="opening"
              @click="openPaymentPage"
            >
              {{ opening ? 'กำลังเปิดหน้าชำระเงิน...' : `ชำระด้วย ${selectedOption.label}` }}
            </button>
          </div>
        </div>

        <div v-if="selectedOption?.method === 'bank_transfer'" class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 class="font-extrabold text-slate-900">โอนเงินแล้วอัปโหลดสลิป</h2>
          <div v-if="bankAccountNumber" class="mt-3 rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
            <p>{{ bankName }}</p>
            <p>{{ bankAccountName }}</p>
            <p class="text-lg font-extrabold text-slate-900">{{ bankAccountNumber }}</p>
            <p class="mt-1">ยอดโอน {{ formatBaht(selectedOption.total) }}</p>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500">
            โอนเงินยอด {{ formatBaht(selectedOption.total) }} ตามบัญชีที่แจ้ง แล้วแนบสลิปด้านล่าง
          </p>

          <form class="mt-4 space-y-3" @submit.prevent="submitSlip">
            <label class="block text-sm font-semibold text-slate-700">
              สลิป
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required class="mt-1 block w-full text-sm font-normal" @change="onFile">
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              ข้อความถึงแอดมิน
              <input v-model="note" maxlength="500" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
            </label>
            <p v-if="slipError" class="text-sm text-rose-600">{{ slipError }}</p>
            <p v-if="slipSuccess" class="text-sm text-emerald-600">{{ slipSuccess }}</p>
            <a v-if="order.payment?.slip_url" :href="order.payment.slip_url" target="_blank" rel="noopener" class="block text-sm font-bold text-blue-700">ดูสลิปที่ส่งแล้ว</a>
            <button
              type="submit"
              class="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300"
              :disabled="uploading"
            >
              {{ uploading ? 'กำลังส่งสลิป...' : 'ส่งสลิป' }}
            </button>
          </form>
        </div>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { planDurationLabel } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

type PaymentMethod = 'thai_qr' | 'credit_card' | 'bank_transfer'

interface OrderItem {
  type: string
  id: number
  name: string
  quantity: number
  unit_price: number
  total_price: number
  plan?: { id: number | null, name: string, duration_days: number | null } | null
}

interface StoreOrder {
  id: number
  order_no: string
  kind: 'book' | 'enrollment'
  discount: number
  shipping_amount: number
  total: number
  payment_status: string
  payment_status_label: string
  shipping: {
    name: string
    address_line1: string
    province: string
    postal_code: string
  } | null
  payment: {
    method: PaymentMethod | null
    method_label: string | null
    status: string
    amount: number
    fee_amount: number
    slip_url: string | null
    provider: string | null
    failure_message: string | null
  } | null
  items: OrderItem[]
}

interface PaymentOption {
  method: PaymentMethod
  label: string
  fee_label: string | null
  order_amount: number
  fee_amount: number
  total: number
}

interface GuestOrderView {
  order: StoreOrder
  payment_options: PaymentOption[]
  payment_url: string | null
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { api } = useApi()
const { loggedIn, fetchUser } = useAuth()
const { tokenFor, remember, takeNotice } = useGuestOrders()

const orderId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? raw[0] : raw
})

const queryToken = typeof route.query.guest_token === 'string' ? route.query.guest_token : ''
if (queryToken) {
  remember(orderId.value!, queryToken)
  await router.replace({ query: {} })
}
const guestToken = queryToken || tokenFor(orderId.value!)
const guestMode = ref(false)
const guestPaymentUrl = ref<string | null>(null)
const notice = ref(takeNotice(orderId.value!))

const bankName = config.public.bankName
const bankAccountName = config.public.bankAccountName
const bankAccountNumber = config.public.bankAccountNumber

const order = ref<StoreOrder | null>(null)
const pending = ref(true)
const errorMessage = ref('')
const options = ref<PaymentOption[]>([])
const optionsPending = ref(false)
const optionsError = ref('')
const method = ref<PaymentMethod | null>(null)
const opening = ref(false)
const linkError = ref('')
const slipError = ref('')
const slipSuccess = ref('')
const uploading = ref(false)
const note = ref('')
const file = ref<File | null>(null)

const payable = computed(() => {
  const current = order.value
  if (!current || current.total <= 0) return false
  return current.payment_status !== 'paid' && current.payment_status !== 'refunded'
})

const selectedOption = computed(() => options.value.find(option => option.method === method.value) ?? null)

const statusClass = computed(() => {
  const status = order.value?.payment_status
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (status === 'awaiting_verification') return 'bg-amber-100 text-amber-700'
  if (status === 'failed' || status === 'refunded') return 'bg-rose-100 text-rose-700'
  return 'bg-blue-100 text-blue-700'
})

function setOrder(value: StoreOrder) {
  order.value = value
  useHead({ title: `คำสั่งซื้อ ${value.order_no} | ClickClass Tutor` })
}

function pickMethod() {
  const lastMethod = order.value?.payment?.method
  const preferred = order.value?.payment_status === 'awaiting_verification'
    ? 'bank_transfer'
    : lastMethod !== 'bank_transfer' ? lastMethod : null
  method.value = options.value.find(option => option.method === preferred)?.method ?? options.value[0]?.method ?? null
}

async function loadMemberOrder() {
  const response = await api<{ data: StoreOrder }>(`/orders/${orderId.value}`)
  setOrder(response.data)
}

async function loadGuestOrder() {
  const response = await api<{ data: GuestOrderView }>(`/guest/orders/${guestToken}`)
  guestMode.value = true
  setOrder(response.data.order)
  options.value = response.data.payment_options ?? []
  guestPaymentUrl.value = response.data.payment_url
  pickMethod()
}

async function loadMemberOptions() {
  if (!payable.value) return
  optionsPending.value = true
  optionsError.value = ''
  try {
    const response = await api<{ data: PaymentOption[] }>(`/orders/${orderId.value}/payment/options`)
    options.value = response.data ?? []
    pickMethod()
  }
  catch (error: unknown) {
    optionsError.value = apiErrorMessage(error, 'โหลดวิธีชำระไม่สำเร็จ')
  }
  finally {
    optionsPending.value = false
  }
}

async function refreshMemberPayment() {
  const payment = order.value?.payment
  if (!payment?.provider || payment.status !== 'pending' || order.value?.payment_status === 'paid') return
  try {
    await api(`/orders/${orderId.value}/payment/status`)
    await loadMemberOrder()
    if (order.value?.payment_status === 'paid') fetchUser()
  }
  catch {
    // The order page still shows the last known status.
  }
}

async function loadPage() {
  if (loggedIn.value) {
    try {
      await loadMemberOrder()
      await refreshMemberPayment()
      await loadMemberOptions()
      return
    }
    catch (error: unknown) {
      if (!guestToken || ![403, 404].includes(apiStatus(error) ?? 0)) throw error
    }
  }
  await loadGuestOrder()
}

if (!loggedIn.value && !guestToken) {
  await navigateTo({ path: '/signin', query: { redirect: `/orders/${orderId.value}` } })
}
else {
  try {
    await loadPage()
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'ไม่พบคำสั่งซื้อ')
  }
  finally {
    pending.value = false
  }
}

async function openPaymentPage() {
  if (!order.value || opening.value) return
  opening.value = true
  linkError.value = ''
  try {
    if (guestMode.value) {
      if (!guestPaymentUrl.value) await loadGuestOrder()
      if (!guestPaymentUrl.value) {
        linkError.value = 'ยังเปิดหน้าชำระเงินไม่ได้ ลองรีเฟรชหน้านี้อีกครั้ง'
        opening.value = false
        return
      }
      window.location.href = guestPaymentUrl.value
      return
    }
    const response = await api<{ data: { url: string } }>(`/orders/${order.value.id}/payment-link`, { method: 'POST' })
    window.location.href = response.data.url
  }
  catch (error: unknown) {
    linkError.value = apiErrorMessage(error, 'เปิดหน้าชำระเงินไม่สำเร็จ')
    opening.value = false
  }
}

function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

async function submitSlip() {
  if (!order.value || !file.value) return
  if (file.value.size > 5 * 1024 * 1024) {
    slipError.value = 'ไฟล์ต้องไม่เกิน 5 MB'
    return
  }

  uploading.value = true
  slipError.value = ''
  slipSuccess.value = ''
  try {
    const body = new FormData()
    body.set('slip', file.value)
    if (note.value.trim()) body.set('note', note.value.trim())
    if (guestMode.value) {
      const response = await api<{ data: { order: StoreOrder } }>(`/guest/orders/${guestToken}/payment`, { method: 'POST', body })
      order.value = response.data.order
    }
    else {
      const response = await api<{ data: StoreOrder }>(`/orders/${order.value.id}/payment`, { method: 'POST', body })
      order.value = response.data
    }
    slipSuccess.value = 'ส่งสลิปแล้ว รอการตรวจสอบ'
    file.value = null
  }
  catch (error: unknown) {
    slipError.value = apiErrorMessage(error, 'ส่งสลิปไม่สำเร็จ')
  }
  finally {
    uploading.value = false
  }
}
</script>
