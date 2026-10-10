<template>
  <section>
    <h1 class="text-3xl font-extrabold text-slate-900">ประวัติการสั่งซื้อ</h1>
    <p v-if="pending" class="mt-4 text-sm text-slate-500">กำลังโหลด...</p>
    <p v-else-if="errorMessage" class="mt-4 text-sm text-rose-600">{{ errorMessage }}</p>
    <p v-else-if="orders.length === 0" class="mt-4 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ยังไม่มีคำสั่งซื้อ</p>
    <ul v-else class="mt-4 space-y-3">
      <li v-for="order in orders" :key="order.id">
        <NuxtLink :to="`/orders/${order.id}`" class="flex items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
          <span>
            <span class="block font-bold text-slate-800">{{ order.order_no }}</span>
            <span class="text-sm text-slate-500">{{ order.payment_status_label }}</span>
          </span>
          <span class="font-bold text-blue-700">{{ formatBaht(order.total) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
useHead({ title: 'ประวัติการสั่งซื้อ | ClickClass Tutor' })

interface OrderSummary {
  id: number
  order_no: string
  total: number
  payment_status_label: string
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
