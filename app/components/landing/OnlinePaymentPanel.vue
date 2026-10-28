<template>
  <div class="mt-4">
    <div v-if="testMode" class="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-amber-200">
      <p class="font-bold">โหมดทดสอบ ไม่มีการตัดเงินจริง</p>
      <p v-if="method === 'thai_qr'" class="mt-1">QR เป็นภาพจำลอง สแกนจ่ายไม่ได้ ใช้ปุ่มจำลองผลใต้ QR แทน</p>
      <p v-else-if="fakeCard" class="mt-1">เลขบัตรลงท้าย 0002 = ไม่ผ่าน, 3220 = ต้องยืนยัน OTP, เลขอื่น = สำเร็จ</p>
      <p v-else class="mt-1">บัตรทดสอบ Omise: 4242 4242 4242 4242 = สำเร็จ, 4111 1111 1114 0011 = ไม่ผ่าน วันหมดอายุในอนาคตและ CVV ใดก็ได้</p>
    </div>

    <p v-if="error" class="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>

    <template v-if="method === 'thai_qr'">
      <div v-if="qr" class="mx-auto max-w-sm overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="bg-[#00427A] px-4 py-3 text-center text-sm font-extrabold tracking-wide text-white">THAI QR PAYMENT</div>
        <div class="flex flex-col items-center px-5 pb-5 pt-4 text-center">
          <img src="/images/payment/promptpay.png" alt="PromptPay" class="h-8 w-auto">
          <p class="mt-1 text-[11px] text-slate-400">Powered by KGP</p>
          <img :src="qr.qr_image ?? ''" alt="QR พร้อมเพย์สำหรับชำระเงิน" class="mt-3 h-56 w-56 rounded-xl bg-white object-contain ring-1 ring-slate-100" :class="{ 'opacity-30': qrExpired }">
          <p class="mt-3 text-sm font-semibold text-slate-700">{{ qr.merchant_name }}</p>
          <p class="text-2xl font-extrabold text-slate-900">{{ amountText(qr.amount) }}</p>
          <p v-if="qr.fee_amount" class="text-xs text-slate-500">รวม{{ qr.fee_label || 'ค่าธรรมเนียม' }} {{ amountText(qr.fee_amount) }}</p>
          <p v-if="!qrExpired" class="mt-2 text-sm text-slate-600">
            QR หมดอายุใน <span class="font-mono font-bold text-[#00427A]">{{ countdown }}</span>
            <span class="block text-xs text-slate-400">({{ expiresAtText }})</span>
          </p>
          <p v-else class="mt-2 text-sm font-bold text-rose-600">QR หมดอายุแล้ว</p>

          <div class="mt-4 grid w-full gap-2">
            <button v-if="!qrExpired" type="button" class="rounded-full bg-[#00427A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#003360]" @click="saveQr">
              บันทึก QR (Save QR)
            </button>
            <button v-else type="button" class="rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300" :disabled="busy" @click="createQr">
              {{ busy ? 'กำลังสร้าง QR...' : 'สร้าง QR ใหม่' }}
            </button>
            <div v-if="fakeQr && !qrExpired" class="grid grid-cols-2 gap-2">
              <button type="button" class="rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50" :disabled="busy" @click="simulate('paid')">จำลองชำระสำเร็จ</button>
              <button type="button" class="rounded-full bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 disabled:opacity-50" :disabled="busy" @click="simulate('failed')">จำลองไม่สำเร็จ</button>
            </div>
          </div>

          <p class="mt-3 text-xs text-slate-400">หน้านี้จะอัปเดตเองเมื่อชำระสำเร็จ</p>
        </div>
        <div class="border-t border-slate-100 px-5 py-4 text-start text-xs text-slate-600">
          <p class="font-bold text-slate-800">ขั้นตอนการชำระ</p>
          <ol class="mt-1 list-decimal space-y-0.5 ps-4">
            <li>กดบันทึก QR หรือเปิดหน้านี้ค้างไว้</li>
            <li>เปิดแอปธนาคาร เลือกสแกน QR หรือเลือกรูป QR จากคลังภาพ</li>
            <li>ตรวจชื่อร้านค้าและยอดเงินให้ตรง แล้วยืนยันการชำระ</li>
            <li>รอหน้านี้แสดงว่าชำระสำเร็จ</li>
          </ol>
          <p class="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
            โปรดระวังถูกมิจฉาชีพหลอกโอนเงิน! กรุณาตรวจสอบข้อมูลบัญชีผู้รับก่อนชำระเงิน<br>
            Beware of scammer! Please verify the recipient’s account information before paying.
          </p>
        </div>
      </div>

      <div v-else class="text-center">
        <p class="text-sm text-slate-500">ยอดชำระ {{ amountText(total) }}</p>
        <button type="button" class="mt-3 w-full rounded-full bg-[#00427A] px-5 py-3 text-sm font-bold text-white hover:bg-[#003360] disabled:bg-slate-300" :disabled="busy || loadingState" @click="createQr">
          {{ busy ? 'กำลังสร้าง QR...' : loadingState ? 'กำลังโหลด...' : 'สร้าง QR พร้อมเพย์' }}
        </button>
      </div>
    </template>

    <form v-else class="space-y-3" @submit.prevent="payCard">
      <p class="text-xs text-slate-500">ข้อมูลบัตรส่งตรงไปยังผู้ให้บริการชำระเงิน ระบบของเราไม่เก็บเลขบัตร</p>
      <label class="block text-sm font-semibold text-slate-700">
        ชื่อบนบัตร
        <input v-model="card.name" autocomplete="cc-name" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
      </label>
      <label class="block text-sm font-semibold text-slate-700">
        หมายเลขบัตร
        <input v-model="card.number" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono font-normal tracking-wider outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" @input="formatNumber">
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block text-sm font-semibold text-slate-700">
          วันหมดอายุ
          <input v-model="card.expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="ดด/ปป" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" @input="formatExpiry">
        </label>
        <label class="block text-sm font-semibold text-slate-700">
          CVV
          <input v-model="card.cvc" inputmode="numeric" autocomplete="cc-csc" maxlength="4" type="password" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
        </label>
      </div>
      <p class="text-xs text-slate-400">บัตรบางใบจะพาไปหน้ายืนยัน OTP ของธนาคาร (3-D Secure) แล้วกลับมาที่หน้านี้</p>
      <button type="submit" class="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300" :disabled="busy">
        {{ busy ? 'กำลังชำระเงิน...' : `ชำระ ${amountText(total)}` }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
interface PaymentState {
  paid: boolean
  order_no: string
  payment: {
    method: string
    provider: string | null
    status: string
    amount: number
    fee_amount: number
    fee_label: string | null
    expires_at: string | null
    failure_code: string | null
    failure_message: string | null
    qr_image: string | null
    merchant_name: string | null
    authorize_uri: string | null
  } | null
}

interface PaymentMethods {
  methods: string[]
  test_mode: { thai_qr: boolean, credit_card: boolean }
  omise_public_key: string | null
}

interface OmiseApi {
  setPublicKey: (key: string) => void
  createToken: (type: 'card', card: Record<string, unknown>, callback: (status: number, response: { id?: string, message?: string }) => void) => void
}

const FAKE_TOKENS = { success: 'tokn_fake_success', fail: 'tokn_fake_fail', threeDs: 'tokn_fake_3ds' }

const props = defineProps<{
  method: 'thai_qr' | 'credit_card'
  basePath: string
  total: number
}>()

const emit = defineEmits<{ paid: [] }>()

const { api } = useApi()
const methods = ref<PaymentMethods | null>(null)
const state = ref<PaymentState | null>(null)
const busy = ref(false)
const loadingState = ref(true)
const error = ref('')
const remaining = ref(0)
const card = reactive({ name: '', number: '', expiry: '', cvc: '' })
let countdownTimer: ReturnType<typeof setInterval> | undefined
let pollTimer: ReturnType<typeof setInterval> | undefined

const fakeQr = computed(() => Boolean(methods.value?.test_mode.thai_qr))
const fakeCard = computed(() => Boolean(methods.value?.test_mode.credit_card))
const testMode = computed(() => (props.method === 'thai_qr'
  ? fakeQr.value
  : fakeCard.value || Boolean(methods.value?.omise_public_key?.startsWith('pkey_test_'))))

const qr = computed(() => {
  const payment = state.value?.payment
  return payment?.method === 'thai_qr' && payment.status === 'pending' && payment.qr_image ? payment : null
})
const qrExpired = computed(() => qr.value !== null && remaining.value <= 0)
const countdown = computed(() => {
  const hours = Math.floor(remaining.value / 3600)
  const minutes = Math.floor((remaining.value % 3600) / 60)
  const seconds = remaining.value % 60
  return [hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(':')
})
const expiresAtText = computed(() => (qr.value?.expires_at
  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(qr.value.expires_at))
  : ''))

function amountText(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB`
}

function stopTimers() {
  if (countdownTimer) clearInterval(countdownTimer)
  if (pollTimer) clearInterval(pollTimer)
  countdownTimer = undefined
  pollTimer = undefined
}

function tick() {
  const expiresAt = qr.value?.expires_at ? new Date(qr.value.expires_at).getTime() : 0
  remaining.value = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
}

function applyState(next: PaymentState) {
  state.value = next
  if (next.paid) {
    stopTimers()
    emit('paid')
    return true
  }
  const payment = next.payment
  if (payment && payment.status === 'failed' && payment.failure_code !== 'superseded' && payment.failure_message) {
    error.value = payment.failure_message
  }
  return false
}

function watchQr() {
  stopTimers()
  tick()
  countdownTimer = setInterval(tick, 1000)
  pollTimer = setInterval(poll, 4000)
}

async function poll() {
  try {
    const response = await api<{ data: PaymentState }>(`${props.basePath}/status`)
    if (applyState(response.data)) return
    if (response.data.payment?.status !== 'pending') stopTimers()
  }
  catch {
    // Polling retries on the next interval.
  }
}

async function createQr() {
  busy.value = true
  error.value = ''
  try {
    const response = await api<{ data: PaymentState }>(`${props.basePath}/thai-qr`, { method: 'POST' })
    if (!applyState(response.data)) watchQr()
  }
  catch (exception: unknown) {
    error.value = apiErrorMessage(exception, 'สร้าง QR ไม่สำเร็จ กรุณาลองใหม่')
  }
  finally {
    busy.value = false
  }
}

async function simulate(result: 'paid' | 'failed') {
  busy.value = true
  error.value = ''
  try {
    const response = await api<{ data: PaymentState }>(`${props.basePath}/simulate`, { method: 'POST', body: { state: result } })
    stopTimers()
    if (!applyState(response.data) && !error.value) error.value = response.data.payment?.failure_message || 'ชำระเงินไม่สำเร็จ'
  }
  catch (exception: unknown) {
    error.value = apiErrorMessage(exception, 'จำลองผลไม่สำเร็จ')
  }
  finally {
    busy.value = false
  }
}

function saveQr() {
  const image = qr.value?.qr_image
  if (!image) return
  const link = document.createElement('a')
  link.href = image
  link.download = `QR-${state.value?.order_no ?? 'payment'}.${image.startsWith('data:image/svg') ? 'svg' : 'png'}`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function formatNumber() {
  const digits = card.number.replace(/\D/g, '').slice(0, 19)
  card.number = digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const digits = card.expiry.replace(/\D/g, '').slice(0, 4)
  card.expiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function cardProblem() {
  const number = card.number.replace(/\D/g, '')
  const [month, year] = card.expiry.split('/')
  if (!card.name.trim()) return 'กรุณากรอกชื่อบนบัตร'
  if (number.length < 13) return 'หมายเลขบัตรไม่ครบ'
  if (!month || !year || Number(month) < 1 || Number(month) > 12 || year.length !== 2) return 'วันหมดอายุไม่ถูกต้อง (ดด/ปป)'
  if (!/^\d{3,4}$/.test(card.cvc)) return 'CVV ไม่ถูกต้อง'
  return null
}

let omiseLoader: Promise<OmiseApi> | null = null

function loadOmise(): Promise<OmiseApi> {
  const existing = (window as unknown as { Omise?: OmiseApi }).Omise
  if (existing) return Promise.resolve(existing)
  omiseLoader ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.omise.co/omise.js'
    script.async = true
    script.onload = () => {
      const loaded = (window as unknown as { Omise?: OmiseApi }).Omise
      if (loaded) resolve(loaded)
      else reject(new Error('โหลดระบบชำระบัตรไม่สำเร็จ'))
    }
    script.onerror = () => {
      omiseLoader = null
      reject(new Error('โหลดระบบชำระบัตรไม่สำเร็จ กรุณาลองใหม่'))
    }
    document.head.appendChild(script)
  })
  return omiseLoader
}

async function tokenize() {
  const number = card.number.replace(/\D/g, '')
  if (fakeCard.value) {
    if (number.endsWith('0002')) return FAKE_TOKENS.fail
    if (number.endsWith('3220')) return FAKE_TOKENS.threeDs
    return FAKE_TOKENS.success
  }

  const key = methods.value?.omise_public_key
  if (!key) throw new Error('ยังไม่ได้ตั้งค่าการชำระด้วยบัตร')
  const omise = await loadOmise()
  omise.setPublicKey(key)
  const [month, year] = card.expiry.split('/')

  return new Promise<string>((resolve, reject) => {
    omise.createToken('card', {
      name: card.name.trim(),
      number,
      expiration_month: Number(month),
      expiration_year: 2000 + Number(year),
      security_code: card.cvc,
    }, (status, response) => {
      if (status === 200 && response.id) resolve(response.id)
      else reject(new Error(response.message || 'ข้อมูลบัตรไม่ถูกต้อง'))
    })
  })
}

async function payCard() {
  const problem = cardProblem()
  if (problem) {
    error.value = problem
    return
  }
  busy.value = true
  error.value = ''
  try {
    const token = await tokenize()
    const response = await api<{ data: PaymentState }>(`${props.basePath}/card`, { method: 'POST', body: { token } })
    card.cvc = ''
    if (response.data.payment?.authorize_uri) {
      window.location.href = response.data.payment.authorize_uri
      return
    }
    if (!applyState(response.data) && !error.value) {
      error.value = response.data.payment?.failure_message || 'ชำระเงินไม่สำเร็จ กรุณาตรวจสอบบัตรหรือใช้บัตรอื่น'
    }
  }
  catch (exception: unknown) {
    error.value = exception instanceof Error && !(exception as { data?: unknown }).data
      ? exception.message
      : apiErrorMessage(exception, 'ชำระเงินไม่สำเร็จ')
  }
  finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    methods.value = (await api<{ data: PaymentMethods }>('/payment-methods')).data
  }
  catch {
    methods.value = null
  }

  if (props.method === 'thai_qr') {
    try {
      const response = await api<{ data: PaymentState }>(`${props.basePath}/status`)
      if (!applyState(response.data) && qr.value) watchQr()
    }
    catch {
      // Starting fresh is fine when the status cannot be read.
    }
  }
  loadingState.value = false
})

onUnmounted(stopTimers)
</script>
