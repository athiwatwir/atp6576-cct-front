<template>
  <section v-if="pending || reviews.length" class="py-10" aria-labelledby="reviews-title">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <h2 id="reviews-title" class="text-3xl font-extrabold text-slate-900">รีวิวจากผู้เรียน</h2>
      <p class="mt-1 text-sm text-slate-500">เสียงจากนักเรียนและผู้ปกครองที่เรียนกับเรา</p>
    </div>

    <div v-if="pending && !reviews.length" class="mx-auto mt-4 flex max-w-6xl gap-4 overflow-hidden px-4 md:px-6">
      <div v-for="index in 3" :key="index" class="h-96 w-72 shrink-0 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100 sm:w-80" />
    </div>

    <div
      v-else
      ref="viewport"
      class="mt-4 py-2"
      :class="moving ? 'review-marquee overflow-hidden' : 'mx-auto max-w-6xl overflow-x-auto pe-4 md:px-2'"
      :style="moving ? { '--review-duration': `${duration}s` } : undefined"
    >
      <ul class="flex w-max" :class="{ 'review-track': moving }">
        <li
          v-for="(review, index) in track"
          :key="`${review.id}-${index}`"
          class="flex w-72 shrink-0 ps-4 sm:w-80"
          :aria-hidden="index >= reviews.length ? 'true' : undefined"
        >
          <figure class="flex w-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
            <img
              v-if="review.image_url"
              :src="review.image_url"
              :alt="`รีวิวจาก ${review.name}`"
              class="block h-auto w-full bg-sky-50"
            >
            <div
              v-else
              class="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-sky-100 to-blue-50 text-6xl font-extrabold text-blue-300"
              aria-hidden="true"
            >
              {{ initial(review.name) }}
            </div>
            <figcaption class="flex flex-1 flex-col border-t border-slate-100 p-5">
              <span class="font-bold text-slate-900">{{ review.name }}</span>
              <span class="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">“{{ review.content }}”</span>
            </figcaption>
          </figure>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface HomeReview {
  id: number
  name: string
  content: string
  image_url: string | null
}

const props = defineProps<{
  reviews: HomeReview[]
  pending?: boolean
}>()

const pixelsPerSecond = 40

const viewport = useTemplateRef<HTMLElement>('viewport')
const screenWidth = ref(0)
const cardWidth = ref(0)
const reducedMotion = ref(false)

const setWidth = computed(() => cardWidth.value * props.reviews.length)

// Looping needs a second copy of the list; it stays off-screen only when one copy is at least as wide as the screen.
const moving = computed(() => !reducedMotion.value && screenWidth.value > 0 && setWidth.value >= screenWidth.value)

const track = computed(() => (moving.value ? [...props.reviews, ...props.reviews] : props.reviews))

const duration = computed(() => Math.max(Math.round(setWidth.value / pixelsPerSecond), 10))

let observer: ResizeObserver | undefined

function measure() {
  const element = viewport.value
  if (!element) return
  screenWidth.value = element.parentElement?.clientWidth ?? 0
  cardWidth.value = element.querySelector('li')?.offsetWidth ?? cardWidth.value
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  observer = new ResizeObserver(measure)
  watch(viewport, (element, previous) => {
    if (previous) observer?.unobserve(previous)
    if (element?.parentElement) observer?.observe(element.parentElement)
    nextTick(measure)
  }, { immediate: true })
})

watch(() => props.reviews.length, () => nextTick(measure))

onUnmounted(() => observer?.disconnect())

function initial(name: string) {
  return name.trim().charAt(0) || '?'
}
</script>

<style scoped>
.review-marquee {
  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}

.review-track {
  animation: review-scroll var(--review-duration) linear infinite;
}

.review-marquee:hover .review-track,
.review-marquee:focus-within .review-track {
  animation-play-state: paused;
}

@keyframes review-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>
