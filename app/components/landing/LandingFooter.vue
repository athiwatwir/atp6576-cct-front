<template>
  <footer class="mt-12 bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-600">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <ul class="grid gap-3 border-b border-blue-100 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="item in highlights" :key="item.title" class="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-blue-50">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :class="item.chip">
            <LearnIcon :name="item.icon" class="h-5 w-5" />
          </span>
          <span class="text-sm font-bold text-slate-800">{{ item.title }}</span>
        </li>
      </ul>

      <div class="grid gap-10 py-10 md:grid-cols-[1.3fr_1fr_1.4fr]">
        <div>
          <HeaderLogo image-class="h-12 w-auto" variant="light" />
          <p class="mt-4 max-w-xs text-sm leading-relaxed">
            คอร์สเรียนออนไลน์สำหรับเด็ก เข้าใจง่าย เรียนสนุก เรียนได้ทุกที่ ทุกเวลา
          </p>
          <NuxtLink to="/demo" class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-700">
            <LearnIcon name="play" class="h-4 w-4" />
            ทดลองเรียนฟรี
          </NuxtLink>
        </div>

        <nav aria-label="เมนูท้ายเว็บ">
          <h2 class="text-sm font-extrabold text-slate-900">เมนู</h2>
          <ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <li v-for="link in links" :key="link.to">
              <NuxtLink :to="link.to" class="transition hover:text-blue-700">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <h2 class="text-sm font-extrabold text-slate-900">ติดต่อเรา</h2>
          <p class="mt-4 font-bold text-slate-800">{{ company.name }}</p>
          <ul class="mt-3 space-y-3 text-sm">
            <li>
              <a :href="mapUrl" target="_blank" rel="noopener" class="flex gap-2.5 transition hover:text-blue-700">
                <LearnIcon name="location" class="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <span class="leading-relaxed">{{ company.address }}</span>
              </a>
            </li>
            <li>
              <a :href="contactInfo.phoneHref" class="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50">
                <LearnIcon name="phone" class="h-4 w-4" />
                {{ company.phone }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-blue-100 bg-white/60">
      <p class="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-slate-500 md:px-6">
        © {{ year }} {{ company.name }} สงวนลิขสิทธิ์
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const company = { name: contactInfo.company, address: contactInfo.address, phone: contactInfo.phone }
const mapUrl = contactInfo.mapUrl
const year = new Date().getFullYear()

const highlights = [
  { title: 'เข้าใจง่าย เรียนสนุก', icon: 'play' as const, chip: 'bg-sky-100 text-sky-600' },
  { title: 'มีเกมและรางวัล', icon: 'exam' as const, chip: 'bg-amber-100 text-amber-600' },
  { title: 'เรียนได้ทุกที่ ทุกเวลา', icon: 'classroom' as const, chip: 'bg-blue-100 text-blue-600' },
  { title: 'ปลอดภัยสำหรับเด็ก', icon: 'profile' as const, chip: 'bg-emerald-100 text-emerald-600' },
]

const links = [
  { label: 'หน้าแรก', to: '/' },
  { label: 'คอร์สเรียน', to: '/courses' },
  { label: 'ข้อสอบ', to: '/exams' },
  { label: 'หนังสือ', to: '/books' },
  { label: 'ทดลองเรียน', to: '/demo' },
  { label: 'ห้องเรียนของฉัน', to: '/home' },
  { label: 'ตะกร้าสินค้า', to: '/cart' },
  { label: 'ติดต่อเรา', to: '/contact' },
]
</script>
