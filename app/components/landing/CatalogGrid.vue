<template>
  <div>
    <div class="mb-4 flex items-end justify-between gap-3">
      <div class="flex items-center gap-3">
        <span v-if="icon" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" :class="chip">
          <LearnIcon :name="icon" class="h-6 w-6" />
        </span>
        <div>
          <component :is="heading" class="text-3xl font-extrabold text-slate-900">{{ title }}</component>
          <p class="mt-1 text-sm text-slate-500">{{ description }}</p>
        </div>
      </div>
      <NuxtLink v-if="purchasable" to="/cart" class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
        <LearnIcon name="cart" class="h-4 w-4" />
        ตะกร้า ({{ count }})
      </NuxtLink>
    </div>

    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="index in 4" :key="index" class="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
    </div>
    <p v-else-if="failed" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">โหลดรายการไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง</p>
    <p v-else-if="items.length === 0" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ยังไม่มีรายการที่เปิดขาย</p>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="item in items" :key="`${item.item_type}-${item.id}`" class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <NuxtLink :to="detailPath(item)" class="block">
        <div class="aspect-[4/3] bg-sky-50">
          <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name" class="h-full w-full object-cover">
          <div v-else class="flex h-full items-center justify-center text-5xl" aria-hidden="true">{{ item.item_type === 'exam' ? '📝' : '📘' }}</div>
        </div>
        <div class="flex flex-1 flex-col p-4">
          <p class="text-xs text-slate-400">{{ metaLine(item) }}</p>
          <h2 class="mt-1 font-bold text-slate-800">{{ item.name }}</h2>
          <p v-if="item.code" class="mt-1 text-xs text-slate-400">รหัส {{ item.code }}</p>
          <p v-if="item.instructor" class="mt-1 text-xs text-slate-500">ผู้สอน {{ item.instructor.name }}</p>
          <p v-if="item.short_description" class="mt-1 text-xs text-slate-500">{{ item.short_description }}</p>
          <div v-if="item.is_featured || item.is_trial_available || item.purchased" class="mt-2 flex flex-wrap gap-1">
            <span v-if="item.is_featured" class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">แนะนำ</span>
            <span v-if="item.is_trial_available" class="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">ทดลองเรียนได้</span>
            <span v-if="item.purchased" class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">มีสิทธิ์แล้ว</span>
          </div>
          <ul class="mt-2 space-y-0.5 text-xs text-slate-400">
            <li v-if="item.chapter_count">{{ item.chapter_count }} บท</li>
            <li v-if="item.course_count">{{ item.course_count }} คอร์สในหลักสูตร</li>
            <li v-if="item.duration_minutes">เวลาทำ {{ item.duration_minutes }} นาที</li>
            <li v-if="item.question_count">{{ item.question_count }} ข้อ</li>
          </ul>
          <div class="mt-3">
            <p v-if="item.sale_price && item.sale_price < item.price" class="text-xs text-slate-400 line-through">ราคาเต็ม {{ formatBaht(item.price) }}</p>
            <p class="text-sm font-bold text-blue-700">{{ formatBaht(item.effective_price) }}</p>
          </div>
          <span class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
            ดูรายละเอียดทั้งหมด
            <LearnIcon name="arrow" class="h-3.5 w-3.5" />
          </span>
        </div>
        </NuxtLink>
        <div class="flex flex-col gap-3 px-4 pb-4">
          <NuxtLink
            v-if="item.item_type === 'course' && item.is_trial_available"
            :to="`${detailPath(item)}#trial`"
            class="inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600"
          >
            <LearnIcon name="play" class="h-4 w-4" />
            ดูวิดีโอทดลองเรียน
          </NuxtLink>
          <button
            v-if="purchasable && item.item_type !== 'exam'"
            type="button"
            class="inline-flex items-center justify-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            @click="addCatalog(item)"
          >
            <LearnIcon name="cart" class="h-4 w-4" />
            {{ inCart(item) ? 'อยู่ในตะกร้า' : 'ใส่ตะกร้า' }}
          </button>
          <p v-else-if="item.item_type === 'exam'" class="text-sm font-semibold text-slate-400">ยังไม่เปิดให้สั่งซื้อ</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogItem } from '@/composables/useCart'

withDefaults(defineProps<{
  title: string
  description: string
  items: CatalogItem[]
  pending?: boolean
  failed?: boolean
  purchasable?: boolean
  heading?: 'h1' | 'h2'
  icon?: 'home' | 'course' | 'exam' | 'book' | 'contact'
  chip?: string
}>(), {
  heading: 'h1',
  chip: 'bg-blue-100 text-blue-600',
})

const { count, addCatalog, quantityOf } = useCart()

function inCart(item: CatalogItem) {
  if (item.item_type === 'exam') return 0
  return quantityOf(item.item_type, item.id)
}

function detailPath(item: CatalogItem) {
  if (item.item_type === 'curriculum') return `/curriculums/${item.slug}`
  if (item.item_type === 'exam') return `/exams/${item.slug}`
  return `/courses/${item.slug}`
}

function metaLine(item: CatalogItem) {
  return [typeLabel(item.item_type), item.category?.name, item.subject?.name].filter(Boolean).join(' · ')
}

function typeLabel(type: CatalogItem['item_type']) {
  if (type === 'curriculum') return 'หลักสูตร'
  if (type === 'exam') return 'ข้อสอบ'
  return 'คอร์สเรียน'
}
</script>
