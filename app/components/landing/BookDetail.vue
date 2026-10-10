<template>
  <article class="mx-auto max-w-4xl px-4 py-8 md:px-6">
    <NuxtLink to="/books" class="text-sm font-bold text-blue-700">กลับไปหน้าหนังสือ</NuxtLink>
    <p v-if="pending" class="mt-6 text-sm text-slate-500">กำลังโหลด...</p>
    <p v-else-if="failed || !book" class="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ไม่พบหนังสือเล่มนี้</p>
    <div v-else class="mt-4 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
      <div class="overflow-hidden rounded-3xl bg-sky-50">
        <img v-if="book.thumbnail_url" :src="book.thumbnail_url" :alt="book.name" class="aspect-[4/3] w-full object-cover">
        <div v-else class="flex aspect-[4/3] items-center justify-center text-6xl" aria-hidden="true">📚</div>
      </div>
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">{{ book.name }}</h1>
        <p v-if="book.code" class="mt-2 text-sm text-slate-400">รหัส {{ book.code }}</p>
        <p v-if="book.purchased" class="mt-2 text-sm font-semibold text-emerald-600">สั่งซื้อแล้ว</p>
        <p class="mt-2 text-sm text-slate-500">{{ stockLabel }}</p>
        <div class="mt-4">
          <p v-if="book.sale_price && book.sale_price < book.price" class="text-sm text-slate-400 line-through">ราคาเต็ม {{ formatBaht(book.price) }}</p>
          <p v-if="book.sale_price && book.sale_price < book.price" class="text-sm text-slate-500">ราคาขาย {{ formatBaht(book.sale_price) }}</p>
          <p class="text-2xl font-extrabold text-blue-700">{{ formatBaht(book.effective_price) }}</p>
        </div>
        <button
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          :class="canAdd(book) ? 'bg-orange-500 shadow-orange-200 hover:-translate-y-0.5 hover:bg-orange-600' : 'bg-slate-300'"
          :disabled="!canAdd(book)"
          @click="addBook(book)"
        >
          <LearnIcon name="cart" class="h-4 w-4" />
          {{ buttonLabel }}
        </button>
      </div>
      <div v-if="book.description" class="md:col-span-2 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">รายละเอียด</h2>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{{ book.description }}</p>
      </div>
      <div v-if="book.video_url" class="md:col-span-2">
        <h2 class="font-extrabold text-slate-900">วิดีโอ</h2>
        <video :src="book.video_url" controls class="mt-3 w-full rounded-3xl bg-black" />
      </div>
      <div v-if="book.images?.length" class="md:col-span-2">
        <h2 class="font-extrabold text-slate-900">รูปเพิ่มเติม</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <img v-for="(image, index) in book.images" :key="image" :src="image" :alt="`${book.name} รูปที่ ${index + 1}`" class="w-full rounded-3xl object-cover">
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { StoreBook } from '@/composables/useCart'

const props = defineProps<{
  book: StoreBook | null
  pending?: boolean
  failed?: boolean
}>()

const { canAdd, addBook, quantityOf } = useCart()

const stockLabel = computed(() => {
  const book = props.book
  if (!book) return ''
  if (!book.in_stock || (book.stock !== null && book.stock <= 0)) return 'สินค้าหมด'
  if (book.stock === null) return 'พร้อมส่ง ไม่จำกัดจำนวน'
  return `เหลือ ${book.stock} เล่ม`
})

const buttonLabel = computed(() => {
  const book = props.book
  if (!book) return 'ใส่ตะกร้า'
  if (!book.in_stock || (book.stock !== null && book.stock <= 0)) return 'สินค้าหมด'
  if (quantityOf('book', book.id) > 0 && !canAdd(book)) return 'ในตะกร้าแล้ว'
  if (quantityOf('book', book.id) > 0) return 'เพิ่มในตะกร้า'
  return 'ใส่ตะกร้า'
})
</script>
