<template>
  <div>
    <section class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
      <div>
        <p class="mb-3 text-sm font-bold text-blue-600">คอร์สเรียนออนไลน์สำหรับเด็ก</p>
        <h1 class="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          เรียนสนุก เข้าใจง่าย<br>
          <span class="text-blue-600">เก่งขึ้นได้ทุกวัน!</span>
        </h1>
        <p class="mt-4 max-w-md text-base text-slate-600">
          คอร์สเรียนออนไลน์สำหรับเด็กประถม เข้าใจง่าย เรียนได้ทุกที่ ทุกเวลา
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink to="/signup" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600">
            เริ่มเรียนกันเลย!
          </NuxtLink>
          <NuxtLink to="/signin" class="rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">
            เข้าสู่ระบบ
          </NuxtLink>
        </div>
      </div>
      <div class="rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-blue-100 p-8 text-center shadow-sm">
        <p class="text-6xl" aria-hidden="true">📚</p>
        <p class="mt-3 text-lg font-bold text-blue-800">ห้องเรียนที่เข้าได้หลังสมัครสมาชิก</p>
        <p class="mt-1 text-sm text-slate-500">เมนูด้านซ้ายจะปรากฏเมื่อเข้าสู่ระบบแล้ว</p>
      </div>
    </section>

    <section id="subjects" class="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:grid-cols-5 md:px-6">
      <NuxtLink
        v-for="item in highlights"
        :key="item.label"
        :to="loggedIn ? item.to : '/signin'"
        class="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-blue-50 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <span class="text-3xl" aria-hidden="true">{{ item.emoji }}</span>
        <span class="mt-2 block text-sm font-bold text-slate-700">{{ item.label }}</span>
        <span class="block text-xs text-slate-400">{{ item.caption }}</span>
      </NuxtLink>
    </section>

    <section id="courses" class="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div class="mb-4 flex items-end justify-between">
        <h2 class="text-xl font-extrabold text-slate-900">คอร์สแนะนำสำหรับน้องๆ</h2>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="course in courses" :key="course.name" class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <div class="flex h-28 items-center justify-center text-5xl" :class="course.tone">
            {{ course.emoji }}
          </div>
          <div class="p-4">
            <h3 class="font-bold text-slate-800">{{ course.name }}</h3>
            <p class="mt-1 text-xs text-slate-400">{{ course.level }}</p>
            <p class="mt-3 text-sm font-bold text-blue-700">{{ course.price }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="books" class="mx-auto grid max-w-6xl gap-4 px-4 pb-12 md:grid-cols-3 md:px-6">
      <article class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">เช็กอินทุกวัน</h2>
        <p class="mt-2 text-sm text-slate-500">รับแต้มเพิ่มเมื่อเข้าเรียนต่อเนื่อง หลังเข้าสู่ระบบ</p>
      </article>
      <article class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">รางวัลของฉัน</h2>
        <p class="mt-2 text-sm text-slate-500">เก็บเหรียญจากการบ้านและแบบทดสอบในห้องเรียน</p>
      </article>
      <article class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 class="font-extrabold text-slate-900">กิจกรรมวันนี้</h2>
        <p class="mt-2 text-sm text-slate-500">แบบฝึกหัดสั้นๆ เปิดให้เมื่อล็อกอินแล้ว</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { loggedIn } = useAuth()

useHead({ title: 'ClickClass Tutor' })

const highlights = [
  { label: 'คอร์สเรียน', caption: 'เรียนตามบท', emoji: '📘', to: '/courses' },
  { label: 'วิชา', caption: 'ครบทุกวิชา', emoji: '📗', to: '/subjects' },
  { label: 'ข้อสอบ', caption: 'ทดลองความรู้', emoji: '📝', to: '/exams' },
  { label: 'หนังสือ', caption: 'อ่านเสริมเพิ่ม', emoji: '📚', to: '/books' },
  { label: 'โปรโมชัน', caption: 'ข้อเสนอพิเศษ', emoji: '🎁', to: '/promotions' },
]

const courses = [
  { name: 'คณิตศาสตร์ ป.1', level: 'ป.1', price: '890.-', emoji: '🐶', tone: 'bg-emerald-50' },
  { name: 'ภาษาไทยแสนสนุก ป.2', level: 'ป.2', price: '890.-', emoji: '🐰', tone: 'bg-rose-50' },
  { name: 'ภาษาอังกฤษพื้นฐาน ป.3', level: 'ป.3', price: '990.-', emoji: '🐻', tone: 'bg-amber-50' },
  { name: 'วิทยาศาสตร์รอบตัว ป.4', level: 'ป.4', price: '990.-', emoji: '🐸', tone: 'bg-lime-50' },
]
</script>
