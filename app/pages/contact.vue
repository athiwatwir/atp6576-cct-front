<template>
  <div>
    <section class="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <span class="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden="true" />
      <span class="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" aria-hidden="true" />
      <div class="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:px-6 md:py-14">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <LearnIcon name="contact" class="h-4 w-4" />
            ติดต่อเรา
          </span>
          <h1 class="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
            มีคำถามเรื่องคอร์สเรียน<br class="hidden sm:block">
            หรือการสั่งซื้อ <span class="text-emerald-600">ทักเราได้เลย</span>
          </h1>
          <p class="mt-3 max-w-lg text-slate-600">
            ทีมงาน {{ contactInfo.brand }} พร้อมช่วยเลือกคอร์สที่เหมาะกับน้อง ๆ ตอบเรื่องการชำระเงิน และแก้ปัญหาการเข้าเรียน
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a :href="contactInfo.lineUrl" target="_blank" rel="noopener"
              class="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-[#05b14c]">
              <span class="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-[#06C755]">LINE</span>
              แชททาง LINE {{ contactInfo.lineId }}
            </a>
            <a :href="contactInfo.phoneHref"
              class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-50">
              <LearnIcon name="phone" class="h-4 w-4" />
              โทร {{ contactInfo.phone }}
            </a>
          </div>
        </div>
        <div class="flex justify-center md:justify-end">
          <span class="relative block h-44 w-44 md:h-56 md:w-56">
            <span class="absolute inset-0 rounded-full bg-[#06C755]/15" aria-hidden="true" />
            <img src="/images/support.webp" alt="ทีมซัพพอร์ต ClickClass Tutor" width="240" height="240"
              class="relative h-full w-full rounded-full object-cover shadow-xl ring-8 ring-white">
          </span>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <ul class="grid gap-4 md:grid-cols-3">
        <li v-for="channel in channels" :key="channel.title">
          <a :href="channel.href" :target="channel.external ? '_blank' : undefined" :rel="channel.external ? 'noopener' : undefined"
            class="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="channel.chip">
              <span v-if="channel.badge" class="text-xs font-extrabold">{{ channel.badge }}</span>
              <LearnIcon v-else :name="channel.icon" class="h-6 w-6" />
            </span>
            <h2 class="mt-4 font-extrabold text-slate-900">{{ channel.title }}</h2>
            <p class="mt-1 text-sm leading-relaxed text-slate-600">{{ channel.detail }}</p>
            <span class="mt-auto pt-4 text-sm font-bold" :class="channel.action">{{ channel.cta }} →</span>
          </a>
        </li>
      </ul>

      <div class="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <iframe :src="contactInfo.mapEmbedUrl" title="แผนที่บริษัท" class="h-72 w-full border-0 md:h-96"
            loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen />
          <div class="flex flex-wrap items-start justify-between gap-3 p-5">
            <div class="min-w-0">
              <p class="font-extrabold text-slate-900">{{ contactInfo.company }}</p>
              <p class="mt-1 text-sm leading-relaxed text-slate-600">{{ contactInfo.address }}</p>
            </div>
            <a :href="contactInfo.mapUrl" target="_blank" rel="noopener"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">
              <LearnIcon name="location" class="h-4 w-4" />
              เปิดใน Google Maps
            </a>
          </div>
        </div>

        <div class="space-y-4">
          <div class="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-100">
            <h2 class="font-extrabold text-slate-900">เตรียมข้อมูลก่อนติดต่อ</h2>
            <p class="mt-1 text-sm text-slate-600">ช่วยให้ทีมงานตอบได้เร็วขึ้น</p>
            <ul class="mt-4 space-y-2.5 text-sm text-slate-700">
              <li v-for="tip in tips" :key="tip" class="flex gap-2.5">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-extrabold text-white" aria-hidden="true">✓</span>
                {{ tip }}
              </li>
            </ul>
          </div>

          <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 class="font-extrabold text-slate-900">ทำเองได้ทันที</h2>
            <ul class="mt-4 space-y-2">
              <li v-for="link in selfHelp" :key="link.to">
                <NuxtLink :to="link.to" class="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-slate-50">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" :class="link.chip">
                    <LearnIcon :name="link.icon" class="h-4 w-4" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-sm font-bold text-slate-800">{{ link.label }}</span>
                    <span class="block text-xs text-slate-500">{{ link.caption }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'ติดต่อเรา | ClickClass Tutor',
  description: `ติดต่อ ${contactInfo.brand} ทาง LINE ${contactInfo.lineId} หรือโทร ${contactInfo.phone} ${contactInfo.company} ${contactInfo.address}`,
})

const channels = [
  {
    title: `LINE ${contactInfo.lineId}`,
    detail: 'แชทสะดวก ส่งรูปได้ สอบถามคอร์ส ส่งสลิป หรือแจ้งปัญหาการเข้าเรียน',
    cta: 'เริ่มแชท',
    href: contactInfo.lineUrl,
    external: true,
    badge: 'LINE',
    icon: 'contact' as const,
    chip: 'bg-[#06C755] text-white',
    action: 'text-emerald-600',
  },
  {
    title: contactInfo.phone,
    detail: 'โทรคุยกับทีมงานโดยตรง เหมาะกับเรื่องที่ต้องการคำตอบด่วน',
    cta: 'โทรเลย',
    href: contactInfo.phoneHref,
    external: false,
    badge: '',
    icon: 'phone' as const,
    chip: 'bg-blue-100 text-blue-600',
    action: 'text-blue-700',
  },
  {
    title: 'ที่ตั้งบริษัท',
    detail: contactInfo.address,
    cta: 'ดูแผนที่',
    href: contactInfo.mapUrl,
    external: true,
    badge: '',
    icon: 'location' as const,
    chip: 'bg-orange-100 text-orange-600',
    action: 'text-orange-600',
  },
]

const tips = [
  'เลขที่คำสั่งซื้อ (ถ้ามี)',
  'อีเมลที่ใช้สมัครหรือใช้สั่งซื้อ',
  'ชื่อคอร์สหรือข้อสอบที่ต้องการสอบถาม',
  'ภาพหน้าจอเมื่อเจอปัญหา',
]

const selfHelp = [
  { label: 'ประวัติการสั่งซื้อ', caption: 'ตรวจสถานะ ชำระเงิน และส่งสลิป', to: '/orders', icon: 'cart' as const, chip: 'bg-blue-100 text-blue-600' },
  { label: 'ห้องเรียนของฉัน', caption: 'เข้าเรียนคอร์สและทำข้อสอบที่ซื้อแล้ว', to: '/home', icon: 'classroom' as const, chip: 'bg-emerald-100 text-emerald-600' },
  { label: 'ทดลองเรียนฟรี', caption: 'ดูตัวอย่างบทเรียนก่อนตัดสินใจ', to: '/demo', icon: 'play' as const, chip: 'bg-purple-100 text-purple-600' },
]
</script>
