<template>
  <section class="mx-auto max-w-3xl px-4 py-10 md:px-6">
    <p v-if="pending" class="text-sm text-slate-500">กำลังโหลดคำสั่งซื้อ...</p>
    <p v-else-if="errorMessage" class="rounded-3xl bg-white p-6 text-sm text-rose-600 ring-1 ring-slate-100">{{ errorMessage }}</p>

    <template v-else-if="order">
      <h1 class="text-3xl font-extrabold text-slate-900">คำสั่งซื้อ {{ order.order_no }}</h1>
      <p class="mt-2 text-sm text-slate-500">{{ order.payment_status_label }}</p>

      <div class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <ul class="space-y-2 text-sm">
          <li v-for="item in order.items" :key="`${item.type}-${item.id}`" class="flex justify-between gap-3">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span class="font-semibold">{{ formatBaht(item.total_price) }}</span>
          </li>
        </ul>
        <p class="mt-4 text-lg font-extrabold text-slate-900">ยอดสุทธิ {{ formatBaht(order.total) }}</p>
        <p v-if="order.shipping" class="mt-2 text-sm text-slate-500">
          จัดส่งถึง {{ order.shipping.name }} {{ order.shipping.address_line1 }} {{ order.shipping.province }} {{ order.shipping.postal_code }}
        </p>
      </div>

      <div v-if="canUpload" class="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">โอนเงินแล้วอัปโหลดสลิป</h2>
        <div v-if="bankAccountNumber" class="mt-3 rounded-2xl bg-blue-50 p-4 text-sm text-slate-700">
          <p>{{ bankName }}</p>
          <p>{{ bankAccountName }}</p>
          <p class="text-lg font-extrabold text-slate-900">{{ bankAccountNumber }}</p>
          <p class="mt-1">ยอดโอน {{ formatBaht(order.total) }}</p>
        </div>
        <p v-else class="mt-3 text-sm text-slate-500">
          โอนเงินยอด {{ formatBaht(order.total) }} ตามบัญชีที่แจ้ง แล้วแนบสลิปด้านล่าง
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

      <p v-else-if="order.payment_status === 'paid'" class="mt-6 rounded-3xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
        ชำระเงินแล้ว
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

interface OrderItem {
  type: string
  id: number
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface StoreOrder {
  id: number
  order_no: string
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
    slip_url: string | null
    status: string
  } | null
  items: OrderItem[]
}

const route = useRoute()
const config = useRuntimeConfig()
const { api } = useApi()
const { loggedIn } = useAuth()

const orderId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? raw[0] : raw
})

const bankName = config.public.bankName
const bankAccountName = config.public.bankAccountName
const bankAccountNumber = config.public.bankAccountNumber

const order = ref<StoreOrder | null>(null)
const pending = ref(true)
const errorMessage = ref('')
const slipError = ref('')
const slipSuccess = ref('')
const uploading = ref(false)
const note = ref('')
const file = ref<File | null>(null)

const canUpload = computed(() => {
  const status = order.value?.payment_status
  return status !== 'paid' && status !== 'refunded'
})

if (!loggedIn.value) {
  await navigateTo({ path: '/signin', query: { redirect: `/orders/${orderId.value}` } })
}
else {
  try {
    const response = await api<{ data: StoreOrder }>(`/orders/${orderId.value}`)
    order.value = response.data
    useHead({ title: `คำสั่งซื้อ ${response.data.order_no} | ClickClass Tutor` })
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'ไม่พบคำสั่งซื้อ')
  }
  finally {
    pending.value = false
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
    const response = await api<{ data: StoreOrder }>(`/orders/${order.value.id}/payment`, {
      method: 'POST',
      body,
    })
    order.value = response.data
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
