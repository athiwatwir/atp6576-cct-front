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

    </div>

    <slot name="toolbar" />

    <div v-if="pending" class="grid gap-4 sm:grid-cols-2" :class="gridColumns">
      <div v-for="index in columns" :key="index"
        class="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
    </div>
    <p v-else-if="failed" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">
      โหลดรายการไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง</p>
    <template v-else-if="items.length === 0">
      <slot name="empty">
        <p class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ยังไม่มีรายการที่เปิดขาย</p>
      </slot>
    </template>

    <div v-else class="space-y-10">
      <section v-for="group in groups" :key="group.key" :aria-label="group.title || undefined">
        <div v-if="group.title" class="mb-4 flex items-center gap-3">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <LearnIcon name="course" class="h-5 w-5" />
          </span>
          <h2 class="text-xl font-extrabold text-slate-900 md:text-2xl">{{ group.title }}</h2>
          <span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{{ group.items.length }}
            รายการ</span>
          <span class="h-px min-w-6 flex-1 bg-slate-200" aria-hidden="true" />
          <button v-if="group.key" type="button"
            class="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            @click="emit('select-section', group.key)">
            ดูเฉพาะระดับนี้
            <LearnIcon name="arrow" class="h-3.5 w-3.5" />
          </button>
        </div>
        <div class="grid gap-4 sm:grid-cols-2" :class="gridColumns">
          <article v-for="item in group.items" :key="`${item.item_type}-${item.id}`"
            class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
            <NuxtLink :to="detailPath(item)" class="flex flex-1 flex-col">
              <div class="relative aspect-[4/3] shrink-0 overflow-hidden bg-sky-50">
                <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name"
                  class="h-full w-full object-cover">
                <div v-else class="flex h-full items-center justify-center text-5xl" aria-hidden="true">{{
                  item.item_type
                    === 'exam' ? '📝' : '📘' }}</div>
                <div v-if="item.is_featured || item.is_trial_available"
                  class="absolute start-2 top-2 flex flex-wrap gap-1">
                  <span v-if="item.is_featured"
                    class="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-sm">แนะนำ</span>
                  <span v-if="item.is_trial_available"
                    class="rounded-full bg-sky-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">ทดลองเรียนได้</span>
                </div>
              </div>
              <div class="flex flex-1 flex-col p-4">
                <p class="text-xs text-slate-400">{{ metaLine(item) }}</p>
                <component :is="group.title ? 'h3' : 'h2'" class="mt-1 font-bold text-slate-800">{{ item.name }}
                </component>
                <p v-if="item.code" class="mt-1 text-xs text-slate-400">รหัส {{ item.code }}</p>



                <div class="mt-auto pt-3">
                  <p v-if="item.sale_price && item.sale_price < item.price" class="text-xs text-slate-400 line-through">
                    ราคาเต็ม {{ formatBaht(item.price) }}</p>
                  <p class="text-md font-bold text-blue-700">
                    {{ hasPlanChoice(item) ? `เริ่มต้น ${formatBaht(item.effective_price)}` :
                      formatBaht(item.effective_price) }}
                  </p>

                </div>
                <span class="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  ดูรายละเอียดทั้งหมด
                  <LearnIcon name="arrow" class="h-3.5 w-3.5" />
                </span>
              </div>
            </NuxtLink>
            <div v-if="showTrial(item) || showBuy(item)" class="grid gap-2 px-4 pb-4"
              :class="showTrial(item) && showBuy(item) ? 'grid-cols-2' : 'grid-cols-1'">
              <NuxtLink v-if="showTrial(item)" :to="`${detailPath(item)}#trial`"
                class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-sky-500 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-600"
                title="ดูวิดีโอทดลองเรียน">
                <LearnIcon name="play" class="h-4 w-4 shrink-0" />
                <span class="truncate">{{ showBuy(item) ? 'ทดลองเรียน' : 'ดูวิดีโอทดลองเรียน' }}</span>
              </NuxtLink>
              <template v-if="showBuy(item)">
                <NuxtLink v-if="hasPlanChoice(item) && !inCart(item)" :to="`${detailPath(item)}#plans`"
                  class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-orange-500 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
                  <LearnIcon name="cart" class="h-4 w-4 shrink-0" />
                  <span class="truncate">{{ item.purchased ? 'ต่ออายุ' : 'เลือกแพ็กเกจ' }}</span>
                </NuxtLink>
                <button v-else type="button"
                  class="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-orange-500 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
                  @click="addCatalog(item, planOf(item.item_type, item.id))">
                  <LearnIcon name="cart" class="h-4 w-4 shrink-0" />
                  <span class="truncate">{{ inCart(item) ? 'เลือกแล้ว' : item.purchased ? 'ต่ออายุ' : 'เลือกรายการนี้'
                  }}</span>
                </button>
              </template>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { canRenew, hasPlanChoice, type CatalogItem } from '@/composables/useCart'

export interface CatalogSection {
  /** slug ของกลุ่ม ค่าว่างคือกลุ่มที่เลือกดูแยกไม่ได้ */
  key: string
  title: string
  items: CatalogItem[]
}

const props = withDefaults(defineProps<{
  title: string
  description: string
  items: CatalogItem[]
  pending?: boolean
  failed?: boolean
  purchasable?: boolean
  heading?: 'h1' | 'h2'
  icon?: 'home' | 'course' | 'exam' | 'book' | 'contact'
  chip?: string
  /** จำนวนการ์ดต่อแถวบนจอใหญ่ */
  columns?: 3 | 4
  /** แบ่งการ์ดเป็นกลุ่มมีหัวข้อ ถ้าไม่ส่งจะแสดง items เป็นกริดเดียว */
  sections?: CatalogSection[]
}>(), {
  heading: 'h1',
  chip: 'bg-blue-100 text-blue-600',
  columns: 4,
})

const emit = defineEmits<{ 'select-section': [key: string] }>()

const groups = computed<CatalogSection[]>(() =>
  props.sections?.length ? props.sections : [{ key: '', title: '', items: props.items }],
)

const gridColumns = computed(() => (props.columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3'))

const { count, addCatalog, quantityOf, planOf } = useCart()

function inCart(item: CatalogItem) {
  return quantityOf(item.item_type, item.id)
}

function showTrial(item: CatalogItem) {
  return item.item_type === 'course' && Boolean(item.is_trial_available)
}

function showBuy(item: CatalogItem) {
  return props.purchasable && (!item.purchased || canRenew(item))
}

function planSummary(item: CatalogItem) {
  const plans = item.price_plans ?? []
  if (plans.length > 1) return `${plans.length} แพ็กเกจ · ${plans.map(plan => plan.name).join(' / ')}`
  const plan = plans[0]
  return plan ? plan.name : ''
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
