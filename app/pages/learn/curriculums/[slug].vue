<template>
  <section class="mx-auto max-w-4xl p-4 md:p-6">
    <p v-if="pending" class="text-sm text-slate-500">กำลังโหลดหลักสูตร...</p>
    <p v-else-if="failed || !curriculum" class="rounded-3xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-100">ไม่พบหลักสูตรนี้</p>

    <div v-else-if="!curriculum.purchased" class="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
      <p class="font-extrabold text-slate-900">{{ curriculum.name }}</p>
      <p class="mt-2 text-sm text-slate-500">ยังไม่มีสิทธิ์เรียนหลักสูตรนี้ หรือสิทธิ์หมดอายุแล้ว</p>
      <NuxtLink :to="`/curriculums/${curriculum.slug}`" class="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
        ดูแพ็กเกจและซื้อหลักสูตร
      </NuxtLink>
    </div>

    <template v-else>
      <p class="text-xs font-bold text-sky-600">หลักสูตร</p>
      <h1 class="mt-1 text-2xl font-extrabold text-slate-900">{{ curriculum.name }}</h1>
      <p v-if="curriculum.access_expires_at" class="mt-1 text-sm text-slate-400">ใช้ได้ถึง {{ formatThaiDate(curriculum.access_expires_at) }}</p>
      <p v-if="curriculum.short_description" class="mt-3 text-sm text-slate-600">{{ curriculum.short_description }}</p>

      <h2 class="mt-6 font-extrabold text-slate-900">คอร์สในหลักสูตร</h2>
      <p v-if="!curriculum.courses?.length" class="mt-3 rounded-3xl bg-white p-5 text-sm text-slate-500 ring-1 ring-slate-100">ยังไม่มีคอร์สในหลักสูตรนี้</p>
      <ul v-else class="mt-3 grid gap-3 sm:grid-cols-2">
        <li v-for="(entry, index) in curriculum.courses" :key="entry.id">
          <NuxtLink :to="`/learn/${entry.slug}`" class="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition hover:ring-blue-200">
            <span class="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-blue-100 text-blue-600">
              <img v-if="entry.thumbnail_url" :src="entry.thumbnail_url" :alt="entry.name" class="h-full w-full object-cover">
              <LearnIcon v-else name="course" class="absolute inset-0 m-auto h-6 w-6" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-xs font-semibold text-slate-400">คอร์สที่ {{ index + 1 }}</span>
              <span class="block font-bold text-slate-800">{{ entry.name }}</span>
            </span>
            <span class="shrink-0 text-xs font-bold text-blue-700">เข้าเรียน</span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { CatalogItem } from '@/composables/useCart'

definePageMeta({ layout: 'learn' })

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = useLazyAsyncData(
  () => `learn-curriculum-${slug.value}`,
  () => api<{ data: CatalogItem }>(`/curriculums/${slug.value}`),
  { watch: [slug] },
)

const curriculum = computed(() => data.value?.data ?? null)
const failed = computed(() => Boolean(error.value))

useHead({ title: () => curriculum.value ? `${curriculum.value.name} | ห้องเรียน ClickClass Tutor` : 'ห้องเรียน | ClickClass Tutor' })
</script>
