<template>
    <section v-if="pending || banners.length" class="mx-auto max-w-6xl px-4 pt-6 md:px-6" aria-roledescription="carousel"
    :aria-label="label" @mouseenter="paused = true" @mouseleave="paused = false">
    <div v-if="pending && !banners.length"
      class="aspect-[16/9] animate-pulse rounded-[2rem] bg-sky-100 md:aspect-[21/8]" />

    <div v-else class="relative overflow-hidden rounded-[2rem] bg-sky-100 shadow-sm" @pointerdown="onPointerDown"
      @pointerup="onPointerUp" @pointercancel="startX = null">
      <div class="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        :style="{ transform: `translateX(-${current * 100}%)` }">
        <article v-for="(banner, index) in banners" :key="banner.id" class="relative min-w-full">
          <component :is="linkComponent(banner)" v-bind="linkBindings(banner)" class="relative block">
            <img v-if="banner.image_url" :src="banner.image_url" :alt="banner.title"
              :fetchpriority="index === 0 ? 'high' : 'low'" decoding="async"
              class="aspect-[16/9] w-full object-cover md:aspect-[21/8]">
            <div v-else class="aspect-[16/9] w-full bg-gradient-to-br from-sky-200 to-blue-100 md:aspect-[21/8]" />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-5 pt-10 text-white" :class="banners.length > 1 ? 'pb-10' : 'pb-5'">
              <p class="text-lg font-bold md:text-2xl">{{ banner.title }}</p>
              <p v-if="banner.excerpt" class="mt-1 max-w-2xl text-sm text-white/90">{{ banner.excerpt }}</p>
            </div>
          </component>
        </article>
      </div>

      <template v-if="banners.length > 1">
        <button type="button"
          class="absolute start-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
          aria-label="แบนเนอร์ก่อนหน้า" @click="previous">
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button"
          class="absolute end-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
          aria-label="แบนเนอร์ถัดไป" @click="next">
          <span aria-hidden="true">›</span>
        </button>
        <div class="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          <button v-for="(banner, index) in banners" :key="banner.id" type="button"
            class="h-2.5 rounded-full transition-all" :class="index === current ? 'w-6 bg-white' : 'w-2.5 bg-white/60'"
            :aria-label="`ไปที่แบนเนอร์ ${index + 1}`" :aria-current="index === current ? 'true' : undefined"
            @click="current = index" />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface HomeBanner {
  id: number
  title: string
  excerpt: string | null
  image_url: string | null
  link_url: string | null
  placement: string
  placement_label: string
}

const props = withDefaults(defineProps<{
  banners: HomeBanner[]
  pending?: boolean
  label?: string
}>(), {
  label: 'แบนเนอร์หน้าแรก',
})

const current = ref(0)
const paused = ref(false)
const startX = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

watch(() => props.banners.length, (length) => {
  if (current.value >= length) current.value = 0
  startAutoplay()
})

onMounted(startAutoplay)
onUnmounted(stopAutoplay)

function startAutoplay() {
  stopAutoplay()
  if (props.banners.length < 2) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 5000)
}

function stopAutoplay() {
  if (timer) clearInterval(timer)
  timer = undefined
}

function next() {
  if (!props.banners.length) return
  current.value = (current.value + 1) % props.banners.length
}

function previous() {
  if (!props.banners.length) return
  current.value = (current.value - 1 + props.banners.length) % props.banners.length
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  startX.value = event.clientX
}

function onPointerUp(event: PointerEvent) {
  if (startX.value === null) return
  const delta = event.clientX - startX.value
  startX.value = null
  if (delta > 48) previous()
  else if (delta < -48) next()
}

function internalPath(url: string | null) {
  if (!url) return null
  if (url.startsWith('/') && !url.startsWith('//')) return url
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  }
  catch {
    return null
  }
  return null
}

function linkComponent(banner: HomeBanner) {
  if (!banner.link_url) return 'div'
  return internalPath(banner.link_url) ? resolveComponent('NuxtLink') : 'a'
}

function linkBindings(banner: HomeBanner) {
  const path = internalPath(banner.link_url)
  if (path) return { to: path }
  if (banner.link_url) return { href: banner.link_url, target: '_blank', rel: 'noopener noreferrer' }
  return {}
}
</script>
