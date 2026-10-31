<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <NuxtLink :to="backTo" class="text-sm font-bold text-blue-700">{{ backLabel }}</NuxtLink>
    <ExamRunner :slug="slug" :exit-label="backLabel" class="mt-4" @exit="navigateTo(backTo)" @loaded="onLoaded" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'learn' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const firstCourse = ref('')
const examName = ref('')

const courseSlug = computed(() => (typeof route.query.course === 'string' ? route.query.course : firstCourse.value))
const backTo = computed(() => (courseSlug.value ? `/learn/${courseSlug.value}` : '/home'))
const backLabel = computed(() => (courseSlug.value ? 'กลับไปหน้าเรียน' : 'กลับห้องเรียน'))

function onLoaded(exam: { name: string, courses: { slug: string }[] }) {
  firstCourse.value = exam.courses[0]?.slug ?? ''
  examName.value = exam.name
}

useHead({ title: () => (examName.value ? `${examName.value} | ห้องเรียน ClickClass Tutor` : 'ข้อสอบ | ห้องเรียน ClickClass Tutor') })
</script>
