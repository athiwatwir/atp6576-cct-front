<template>
  <section class="mx-auto max-w-3xl px-4 py-8 md:px-6">
    <h1 class="flex items-center gap-3 text-3xl font-extrabold text-slate-900">
      <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
        <LearnIcon name="contact" class="h-6 w-6" />
      </span>
      ติดต่อเรา
    </h1>
    <p class="mt-3 text-slate-600">สอบถามคอร์สเรียน หนังสือ และการสั่งซื้อได้ผ่านบัญชีนักเรียน</p>
    <div class="mt-6 space-y-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <p class="font-bold text-slate-800">ClickClass Tutor</p>
      <p class="text-sm text-slate-500">หลังเข้าสู่ระบบ สามารถตรวจคำสั่งซื้อและส่งสลิปได้จากประวัติการสั่งซื้อ</p>
      <div class="flex flex-wrap gap-3 pt-2">
        <NuxtLink to="/courses" class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">
          <LearnIcon name="course" class="h-4 w-4" />
          ดูคอร์สเรียน
        </NuxtLink>
        <NuxtLink to="/orders" class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
          <LearnIcon name="cart" class="h-4 w-4" />
          ประวัติการสั่งซื้อ
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'ติดต่อเรา | ClickClass Tutor' })
</script>
