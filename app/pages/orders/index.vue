<template>
  <section>
    <h1 class="text-3xl font-extrabold text-slate-900">ประวัติการสั่งซื้อ</h1>
    <PageLoading v-if="pending" message="กำลังโหลดประวัติการสั่งซื้อ..." />
    <p v-else-if="errorMessage" class="mt-4 text-sm text-rose-600">{{ errorMessage }}</p>
    <p v-else-if="orders.length === 0" class="mt-4 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ยังไม่มีคำสั่งซื้อ</p>
    <ul v-else class="mt-4 space-y-3">
      <li v-for="order in orders" :key="order.id">
        <NuxtLink :to="`/orders/${order.id}`" class="flex items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
          <span>
            <span class="block font-bold text-slate-800">{{ order.order_no }}</span>
            <span class="text-sm text-slate-500">{{ order.is_gift ? 'ของแถมจากโค้ดส่วนลด' : order.payment_status_label }}</span>
            <span v-if="order.coupon && !order.is_gift" class="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
              {{ order.coupon.code }}<template v-if="order.coupon.gifts.length"> · มีของแถม</template>
            </span>
          </span>
          <span v-if="order.is_gift" class="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">🎁 ฟรี</span>
          <span v-else class="font-bold text-blue-700">{{ formatBaht(order.total) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { AppliedCoupon } from '@/composables/useCart'

useHead({ title: 'ประวัติการสั่งซื้อ | ClickClass Tutor' })

interface OrderSummary {
  id: number
  order_no: string
  total: number
  payment_status_label: string
  is_gift?: boolean
  coupon?: AppliedCoupon | null
}

const { api } = useApi()
const orders = ref<OrderSummary[]>([])
const pending = ref(true)
const errorMessage = ref('')

try {
  const response = await api<{ data: OrderSummary[] }>('/orders')
  orders.value = response.data ?? []
}
catch (error: unknown) {
  errorMessage.value = apiErrorMessage(error, 'โหลดประวัติไม่สำเร็จ')
}
finally {
  pending.value = false
}
</script>
