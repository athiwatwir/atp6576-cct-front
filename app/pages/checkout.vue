<template>
  <section class="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
    <div>
      <h1 class="text-3xl font-extrabold text-slate-900">ยืนยันคำสั่งซื้อ</h1>
      <p class="mt-2 text-sm text-slate-500">{{ quote?.requires_shipping ? 'รายการนี้ต้องระบุที่อยู่จัดส่ง' : 'ตรวจยอดก่อนยืนยันคำสั่งซื้อ' }}</p>

      <form class="mt-6 space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100" @submit.prevent="submit">
        <template v-if="quote?.requires_shipping">
        <label class="block text-sm font-semibold text-slate-700">
          ชื่อผู้รับ
          <input v-model="form.name" required maxlength="150" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
        </label>
        <label class="block text-sm font-semibold text-slate-700">
          เบอร์โทร
          <input v-model="form.phone" required maxlength="30" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
        </label>
        <label class="block text-sm font-semibold text-slate-700">
          ที่อยู่
          <input v-model="form.address_line1" required class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
        </label>
        <label class="block text-sm font-semibold text-slate-700">
          ที่อยู่เพิ่มเติม
          <input v-model="form.address_line2" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-semibold text-slate-700">
            ตำบล/แขวง
            <input v-model="form.subdistrict" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            อำเภอ/เขต
            <input v-model="form.district" required class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            จังหวัด
            <input v-model="form.province" required class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            รหัสไปรษณีย์
            <input v-model="form.postal_code" required inputmode="numeric" maxlength="5" pattern="[0-9]{5}" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal">
          </label>
        </div>
        </template>
        <label class="block text-sm font-semibold text-slate-700">
          หมายเหตุ
          <textarea v-model="form.notes" rows="2" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 font-normal" />
        </label>
        <p v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</p>
        <button
          type="submit"
          class="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="submitting || quoting || !quote"
        >
          {{ submitting ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันสั่งซื้อ' }}
        </button>
      </form>
    </div>

    <aside class="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 class="font-extrabold text-slate-900">สรุปยอด</h2>
      <p v-if="quoting" class="mt-4 text-sm text-slate-500">กำลังคำนวณยอด...</p>
      <template v-else-if="quote">
        <ul class="mt-4 space-y-3">
          <li v-for="item in quote.items" :key="`${item.type}-${item.id}`" class="flex justify-between gap-3 text-sm">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span class="shrink-0 font-semibold">{{ formatBaht(item.total_price) }}</span>
          </li>
        </ul>
        <dl class="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">ราคาสินค้า</dt>
            <dd>{{ formatBaht(quote.subtotal) }}</dd>
          </div>
          <div v-if="quote.discount" class="flex justify-between">
            <dt class="text-slate-500">ส่วนลด</dt>
            <dd>-{{ formatBaht(quote.discount) }}</dd>
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
    </aside>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useHead({ title: 'ยืนยันคำสั่งซื้อ | ClickClass Tutor' })

interface QuoteItem {
  type: string
  id: number
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Quote {
  items: QuoteItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  requires_shipping: boolean
}

interface CreatedOrder {
  id: number
}

const { api } = useApi()
const { loggedIn, user } = useAuth()
const { items, couponCode, clear } = useCart()

const form = reactive({
  name: '',
  phone: '',
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

const ready = items.value.length > 0 && loggedIn.value

if (items.value.length === 0) {
  await navigateTo('/cart')
}
else if (!loggedIn.value) {
  await navigateTo({ path: '/signin', query: { redirect: '/checkout' } })
}

watch(user, (value) => {
  if (!value) return
  if (!form.name) form.name = value.name
  if (!form.phone && value.phone) form.phone = value.phone
}, { immediate: true })

async function refreshQuote() {
  if (items.value.length === 0) return
  quoting.value = true
  errorMessage.value = ''
  try {
    const response = await api<{ data: Quote }>('/checkout/quote', {
      method: 'POST',
      body: {
        items: items.value.map(item => ({
          type: item.type,
          id: item.id,
          quantity: item.quantity,
        })),
        coupon_code: couponCode.value.trim() || undefined,
      },
    })
    quote.value = response.data
  }
  catch (error: unknown) {
    quote.value = null
    if (apiStatus(error) === 401) {
      await navigateTo({ path: '/signin', query: { redirect: '/checkout' } })
      return
    }
    errorMessage.value = apiErrorMessage(error, 'คำนวณยอดไม่สำเร็จ')
  }
  finally {
    quoting.value = false
  }
}

if (ready) await refreshQuote()

async function submit() {
  if (!quote.value || submitting.value) return
  if (quote.value.requires_shipping && !/^\d{5}$/.test(form.postal_code.trim())) {
    errorMessage.value = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  try {
    const response = await api<{ data: CreatedOrder }>('/orders', {
      method: 'POST',
      body: {
        items: items.value.map(item => ({
          type: item.type,
          id: item.id,
          quantity: item.quantity,
        })),
        notes: form.notes.trim() || null,
        coupon_code: couponCode.value.trim() || undefined,
        ...(quote.value.requires_shipping
          ? {
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
          : {}),
      },
    })
    clear()
    await navigateTo(`/orders/${response.data.id}`)
  }
  catch (error: unknown) {
    errorMessage.value = apiErrorMessage(error, 'สร้างคำสั่งซื้อไม่สำเร็จ')
  }
  finally {
    submitting.value = false
  }
}
</script>
