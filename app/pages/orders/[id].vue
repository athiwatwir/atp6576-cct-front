<template>
  <section class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <PageLoading v-if="pending" message="กำลังโหลดคำสั่งซื้อ..." />
    <p v-else-if="errorMessage" class="rounded-3xl bg-white p-6 text-sm text-rose-600 ring-1 ring-slate-100">{{ errorMessage }}</p>

    <template v-else-if="order">
      <NuxtLink v-if="!guestMode" to="/orders" class="text-sm font-bold text-blue-700">ประวัติการสั่งซื้อ</NuxtLink>
      <h1 class="mt-2 text-3xl font-extrabold text-slate-900">คำสั่งซื้อ {{ order.order_no }}</h1>
      <p class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold" :class="statusClass">{{ order.payment_status_label }}</p>

      <CheckoutSteps
        v-if="order.payment_status !== 'refunded'"
        class="mt-6"
        :current="3"
        :complete="order.payment_status === 'paid'"
        :pay-detail="order.payment_status === 'awaiting_verification' ? 'ส่งสลิปแล้ว รอตรวจสอบ' : ''"
      />

      <div v-if="notice && order.payment_status !== 'paid'" class="mt-6 rounded-3xl bg-blue-50 p-5 text-sm text-slate-700">
        <p class="font-bold text-slate-900">{{ notice.accountCreated ? 'สร้างบัญชีให้แล้ว' : 'เพิ่มคำสั่งซื้อในบัญชีเดิมแล้ว' }}</p>
        <p v-if="notice.accountCreated" class="mt-1">
          หลังชำระเงินสำเร็จ ระบบจะส่งรหัสผ่านสำหรับเข้าสู่ระบบพร้อมใบเสร็จไปที่ <span class="font-semibold">{{ notice.email }}</span>
        </p>
        <p v-else class="mt-1">
          อีเมล <span class="font-semibold">{{ notice.email }}</span> มีบัญชีอยู่แล้ว หลังชำระเงินเข้าสู่ระบบด้วยรหัสผ่านเดิมเพื่อเข้าห้องเรียน ถ้าจำรหัสผ่านไม่ได้ กรุณาติดต่อแอดมิน
        </p>
      </div>

      <div class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <ul class="space-y-3 text-sm">
          <li v-for="item in order.items" :key="`${item.type}-${item.id}`" class="flex items-center gap-3">
            <component
              :is="itemLink(item) ? NuxtLink : 'span'"
              :to="itemLink(item) ?? undefined"
              class="block aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-2xl bg-sky-50 ring-1 ring-slate-100 sm:w-24"
            >
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="h-full w-full object-cover" loading="lazy">
              <span v-else class="flex h-full w-full items-center justify-center text-2xl" aria-hidden="true">{{ itemEmoji(item.type) }}</span>
            </component>
            <span class="min-w-0 flex-1">
              <component :is="itemLink(item) ? NuxtLink : 'span'" :to="itemLink(item) ?? undefined" class="block font-semibold text-slate-800" :class="{ 'hover:text-blue-700': itemLink(item) }">
                {{ item.name }}
              </component>
              <span class="block text-xs text-slate-400">
                {{ itemTypeLabel(item.type) }} · จำนวน {{ item.quantity }}<template v-if="item.plan"> · {{ planDurationLabel(item.plan) }}</template>
              </span>
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

      <div v-if="order.payment_status === 'paid'" class="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100 md:p-7">
        <div class="flex items-start gap-4">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-100">
            <LearnIcon name="check" class="h-8 w-8" />
          </span>
          <div class="min-w-0">
            <p class="text-2xl font-extrabold text-emerald-700">ชำระเงินเรียบร้อย</p>
            <p class="mt-1 text-sm text-slate-500">
              ยอด {{ formatBaht(order.payment?.amount ?? order.total) }}
              <template v-if="order.payment?.method_label"> · {{ order.payment.method_label }}</template>
              <template v-if="order.paid_at"> · {{ formatThaiDate(order.paid_at) }}</template>
            </p>
          </div>
        </div>

        <div class="mt-5 rounded-2xl bg-white/80 p-4 text-base text-slate-700 ring-1 ring-emerald-100">
          <template v-if="order.kind === 'enrollment'">
            <p class="flex items-start gap-2.5">
              <LearnIcon name="classroom" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                <span class="font-bold text-slate-900">เปิดสิทธิ์เรียนให้แล้ว</span>
                <span class="block text-sm text-slate-500">{{ loggedIn ? 'เข้าเรียนได้ทันทีจากห้องเรียนของฉัน' : autoLogin ? 'กดปุ่มด้านล่างเพื่อเข้าสู่ระบบและเริ่มเรียนได้ทันที ครั้งต่อไปใช้อีเมลที่สั่งซื้อกับรหัสผ่านที่ส่งไปทางอีเมล' : 'เข้าสู่ระบบด้วยอีเมลที่ใช้สั่งซื้อ และรหัสผ่านที่ส่งไปทางอีเมล เพื่อเข้าเรียน' }}</span>
              </span>
            </p>
          </template>
          <template v-else>
            <p class="flex items-start gap-2.5">
              <LearnIcon name="truck" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                <span class="font-bold text-slate-900">{{ order.shipping?.status_label || 'เตรียมจัดส่งหนังสือ' }}</span>
                <span v-if="order.shipping?.tracking_number" class="block text-sm text-slate-500">เลขพัสดุ <span class="font-mono font-bold text-slate-800">{{ order.shipping.tracking_number }}</span></span>
                <span v-else class="block text-sm text-slate-500">เราจะแจ้งเลขพัสดุในหน้านี้เมื่อจัดส่งแล้ว</span>
              </span>
            </p>
          </template>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <template v-if="order.kind === 'enrollment'">
            <NuxtLink v-if="loggedIn" to="/home" class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700">
              <LearnIcon name="classroom" class="h-5 w-5" />
              เข้าห้องเรียน
            </NuxtLink>
            <button v-else-if="autoLogin" type="button" class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none" :disabled="loggingIn" @click="enterClassroom">
              <LearnIcon name="login" class="h-5 w-5" />
              {{ loggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบและเข้าเรียนเลย' }}
            </button>
            <NuxtLink v-else :to="{ path: '/signin', query: { redirect: '/home' } }" class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700">
              <LearnIcon name="login" class="h-5 w-5" />
              เข้าสู่ระบบเพื่อเข้าเรียน
            </NuxtLink>
          </template>
          <a v-if="order.receipt?.download_url" :href="order.receipt.download_url" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-bold text-emerald-700 ring-1 ring-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-50">
            <LearnIcon name="receipt" class="h-5 w-5" />
            ดาวน์โหลดใบเสร็จ
            <span v-if="order.receipt.receipt_no" class="text-sm font-semibold text-emerald-600/70">{{ order.receipt.receipt_no }}</span>
          </a>
        </div>
        <p v-if="loginError" class="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ loginError }}</p>
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

          <OnlinePaymentPanel
            v-if="selectedOption && selectedType && selectedType !== 'transfer'"
            :key="selectedOption.method"
            :method="selectedOption.method"
            :type="selectedType"
            :label="selectedOption.label"
            :base-path="paymentBasePath"
            :total="selectedOption.total"
            @paid="onPaid"
          />
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
import { NuxtLink } from '#components'
import { planDurationLabel } from '@/composables/useCart'

definePageMeta({ layout: 'landing' })

type PaymentMethod = string
type PaymentType = 'qr' | 'card' | 'wallet' | 'transfer'

const LEGACY_TYPES: Record<string, PaymentType> = { thai_qr: 'qr', credit_card: 'card', bank_transfer: 'transfer' }

interface OrderItem {
  type: string
  id: number
  name: string
  slug?: string | null
  thumbnail_url?: string | null
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
  paid_at?: string | null
  receipt?: { receipt_no: string, download_url: string } | null
  shipping: {
    name: string
    address_line1: string
    province: string
    postal_code: string
    status_label?: string | null
    tracking_number?: string | null
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
  type?: PaymentType
  label: string
  fee_label: string | null
  order_amount: number
  fee_amount: number
  total: number
}

interface GuestOrderView {
  order: StoreOrder
  payment_options: PaymentOption[]
  auto_login?: boolean
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { api } = useApi()
const { loggedIn, fetchUser, loginWithGuestOrder } = useAuth()
const { tokenFor, remember, takeNotice } = useGuestOrders()

const orderId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? raw[0] : raw
})

const queryToken = typeof route.query.guest_token === 'string' ? route.query.guest_token : ''
const returnedFromGateway = typeof route.query.payment_return === 'string'
if (queryToken) remember(orderId.value!, queryToken)
if (queryToken || returnedFromGateway) await router.replace({ query: {} })
const guestToken = queryToken || tokenFor(orderId.value!)
const guestMode = ref(false)
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
const autoLogin = ref(false)
const loggingIn = ref(false)
const loginError = ref('')
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
const selectedType = computed<PaymentType | null>(() => {
  const option = selectedOption.value
  return option ? option.type ?? LEGACY_TYPES[option.method] ?? null : null
})

const paymentBasePath = computed(() => (guestMode.value
  ? `/guest/orders/${guestToken}/payment`
  : `/orders/${orderId.value}/payment`))

const statusClass = computed(() => {
  const status = order.value?.payment_status
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (status === 'awaiting_verification') return 'bg-amber-100 text-amber-700'
  if (status === 'failed' || status === 'refunded') return 'bg-rose-100 text-rose-700'
  return 'bg-blue-100 text-blue-700'
})

const ITEM_PATHS: Record<string, string> = { course: '/courses', curriculum: '/curriculums', exam: '/exams', book: '/books' }
const ITEM_LABELS: Record<string, string> = { course: 'คอร์สเรียน', curriculum: 'หลักสูตร', exam: 'ข้อสอบ', book: 'หนังสือ' }

function itemLink(item: OrderItem) {
  const base = ITEM_PATHS[item.type]
  return base && item.slug ? `${base}/${item.slug}` : null
}

function itemTypeLabel(type: string) {
  return ITEM_LABELS[type] ?? 'สินค้า'
}

function itemEmoji(type: string) {
  if (type === 'book') return '📚'
  if (type === 'exam') return '📝'
  return '📘'
}

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
  autoLogin.value = Boolean(response.data.auto_login)
  options.value = response.data.payment_options ?? []
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

async function onPaid() {
  try {
    if (guestMode.value) await loadGuestOrder()
    else await loadMemberOrder()
    if (loggedIn.value) fetchUser()
  }
  catch {
    // The panel already shows the payment as successful.
  }
}

async function enterClassroom() {
  if (!guestToken || loggingIn.value) return
  loggingIn.value = true
  loginError.value = ''
  try {
    await loginWithGuestOrder(guestToken)
    await navigateTo('/home')
  }
  catch (error: unknown) {
    autoLogin.value = false
    loginError.value = apiErrorMessage(error, 'เข้าสู่ระบบอัตโนมัติไม่สำเร็จ กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน')
  }
  finally {
    loggingIn.value = false
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
