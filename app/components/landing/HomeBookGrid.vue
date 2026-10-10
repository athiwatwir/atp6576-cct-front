<template>
  <div>
    <div class="mb-4 flex items-end justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <LearnIcon name="book" class="h-6 w-6" />
        </span>
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">หนังสือ</h2>
          <p class="mt-1 text-sm text-slate-500">เลือกเล่มที่ต้องการ แล้วใส่ตะกร้าเพื่อสั่งซื้อ</p>
        </div>
      </div>
      <NuxtLink to="/cart" class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:text-blue-800">
        <LearnIcon name="cart" class="h-4 w-4" />
        ตะกร้า ({{ count }})
      </NuxtLink>
    </div>

    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="index in 4" :key="index" class="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
    </div>

    <p v-else-if="failed" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
      โหลดรายการหนังสือไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง
    </p>

    <p v-else-if="books.length === 0" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
      ยังไม่มีหนังสือที่เปิดขาย
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="book in books" :key="book.id" class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <div class="aspect-[4/3] bg-sky-50">
          <img
            v-if="book.thumbnail_url"
            :src="book.thumbnail_url"
            :alt="book.name"
            class="h-full w-full object-cover"
          >
          <div v-else class="flex h-full items-center justify-center text-5xl" aria-hidden="true">📚</div>
        </div>
        <div class="flex flex-1 flex-col p-4">
          <p v-if="book.code" class="text-xs text-slate-400">รหัส {{ book.code }}</p>
          <h3 class="mt-1 font-bold text-slate-800">{{ book.name }}</h3>
          <p v-if="book.purchased" class="mt-1 text-xs font-semibold text-emerald-600">สั่งซื้อแล้ว</p>
          <p class="mt-1 text-xs text-slate-400">{{ stockLabel(book) }}</p>
          <div class="mt-3">
            <p v-if="book.sale_price && book.sale_price < book.price" class="text-xs text-slate-400 line-through">
              {{ formatBaht(book.price) }}
            </p>
            <p class="text-sm font-bold text-blue-700">{{ formatBaht(book.effective_price) }}</p>
          </div>
          <NuxtLink :to="`/books/${book.slug}`" class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
            ดูรายละเอียด
            <LearnIcon name="arrow" class="h-3.5 w-3.5" />
          </NuxtLink>
          <button
            type="button"
            class="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            :class="canAdd(book) ? 'bg-orange-500 shadow-orange-200 hover:-translate-y-0.5 hover:bg-orange-600' : 'bg-slate-300'"
            :disabled="!canAdd(book)"
            @click="addBook(book)"
          >
            <LearnIcon name="cart" class="h-4 w-4" />
            {{ buttonLabel(book) }}
          </button>
        </div>
      </article>
    </div>

    <p v-if="!pending && !failed && total > books.length" class="mt-4 text-sm text-slate-400">
      แสดง {{ books.length }} จาก {{ total }} เล่ม
    </p>
  </div>
</template>

<script setup lang="ts">
import type { StoreBook } from '@/composables/useCart'

defineProps<{
  books: StoreBook[]
  pending?: boolean
  failed?: boolean
  total?: number
}>()

const { count, canAdd, addBook, quantityOf } = useCart()

function stockLabel(book: StoreBook) {
  if (!book.in_stock || (book.stock !== null && book.stock <= 0)) return 'สินค้าหมด'
  if (book.stock === null) return 'พร้อมส่ง ไม่จำกัดจำนวน'
  return `เหลือ ${book.stock} เล่ม`
}

function buttonLabel(book: StoreBook) {
  if (!book.in_stock || (book.stock !== null && book.stock <= 0)) return 'สินค้าหมด'
  if (quantityOf('book', book.id) > 0 && !canAdd(book)) return 'ในตะกร้าแล้ว'
  if (quantityOf('book', book.id) > 0) return 'เพิ่มในตะกร้า'
  return 'ใส่ตะกร้า'
}
</script>
