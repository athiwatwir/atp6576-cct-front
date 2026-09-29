<template>
  <div class="space-y-6">
    <section class="rounded-[2rem] bg-gradient-to-r from-sky-100 to-blue-50 p-6 md:p-8">
      <p class="text-sm font-bold text-blue-600">สวัสดี{{ user?.name ? ` คุณ${user.name}` : '' }}</p>
      <h1 class="mt-1 text-3xl font-extrabold text-slate-900">เรียนสนุก เข้าใจง่าย</h1>
      <p class="mt-2 max-w-xl text-sm text-slate-600">เลือกบทเรียนจากเมนูด้านซ้าย แล้วเรียนต่อจากครั้งล่าสุดได้เลย</p>
    </section>

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <NuxtLink
        v-for="item in shortcuts"
        :key="item.to"
        :to="item.to"
        class="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-blue-50 hover:ring-blue-200"
      >
        <StudentNavIcon :name="item.icon" class="mx-auto text-blue-600" />
        <span class="mt-2 block text-sm font-bold">{{ item.label }}</span>
      </NuxtLink>
    </section>

    <section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 class="font-extrabold text-slate-900">เรียนต่อจากครั้งล่าสุด</h2>
      <p v-if="!learning.length" class="mt-3 text-sm text-slate-500">
        ยังไม่มีคอร์สที่เปิดสิทธิ์แล้ว เมื่อซื้อคอร์สสำเร็จ รายการจะแสดงที่นี่
      </p>
      <ul v-else class="mt-4 space-y-3">
        <li v-for="course in learning" :key="course.id" class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span class="font-semibold">{{ course.name }}</span>
          <NuxtLink :to="`/courses/${course.slug}`" class="text-sm font-bold text-blue-600">เรียนต่อ</NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'หน้าหลัก | ClickClass Tutor' })

const { user } = useAuth()

const shortcuts = studentNav.filter(item => item.to !== '/home').slice(0, 4)

const learning = computed(() => user.value?.learning?.courses ?? [])
</script>
