<template>
  <div class="space-y-8">
    <ProfileHeroCard v-if="user" :greeting="greeting" :cheer="cheer" :stats="stats" />

    <PageLoading v-if="!user" message="กำลังโหลดห้องเรียน..." />

    <template v-else>
      <div v-if="expiringSoon.length"
        class="flex flex-wrap items-center gap-3 rounded-3xl bg-gradient-to-r from-rose-50 to-amber-50 p-4 ring-1 ring-rose-100">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm"
          aria-hidden="true">⏰</span>
        <p class="min-w-0 flex-1 text-sm text-slate-700">
          <span class="block font-extrabold text-rose-700">อย่าลืมเรียนให้ทันก่อนหมดสิทธิ์นะ</span>
          {{expiringSoon.map(item => `${item.name} (${expiry(item.expires_at).headline})`).join(' · ')}}
        </p>
        <NuxtLink :to="expiringSoon[0]!.to"
          class="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-rose-200 hover:bg-rose-600">
          <LearnIcon name="play" class="h-4 w-4" />
          ไปเรียนเลย
        </NuxtLink>
      </div>

      <section v-if="!classroom.items.length"
        class="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <span class="text-5xl" aria-hidden="true">🎒</span>
        <p class="text-lg font-extrabold text-slate-900">กระเป๋าเรียนยังว่างอยู่เลย</p>
        <p class="max-w-md text-sm text-slate-500">เลือกคอร์สที่ชอบได้เลย เมื่อชำระเงินสำเร็จ
          คอร์สจะมาอยู่ที่นี่ให้เริ่มเรียนได้ทันที</p>
        <div class="mt-2 flex flex-wrap justify-center gap-2">
          <NuxtLink to="/courses"
            class="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600">
            <LearnIcon name="course" class="h-4 w-4" />
            ดูคอร์สเรียน
          </NuxtLink>
          <NuxtLink to="/demo"
            class="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-purple-700 ring-1 ring-purple-200 hover:bg-purple-50">
            <LearnIcon name="play" class="h-4 w-4" />
            ลองเรียนฟรีก่อน
          </NuxtLink>
        </div>
      </section>

      <template v-else>
        <section v-for="group in groups" :key="group.kind"
          class="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl" :class="group.chip"
              aria-hidden="true">{{ group.emoji }}</span>
            <div class="min-w-0">
              <h2 class="text-xl font-extrabold text-slate-900">{{ group.title }}</h2>
              <p class="text-sm text-slate-500">{{ group.items.length ? group.subtitle : group.empty }}</p>
            </div>
            <span v-if="group.items.length" class="ms-auto shrink-0 rounded-full px-3 py-1 text-sm font-extrabold"
              :class="group.chip">{{ group.items.length }}</span>
          </div>

          <ul v-if="group.items.length" class="mt-5 grid gap-4 sm:grid-cols-2"
            :class="{ 'lg:grid-cols-3': group.kind !== 'learning' }">
            <li v-for="item in group.items" :key="`${item.kind}-${item.id}`">
              <article
                class="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg hover:ring-orange-200">
                <NuxtLink :to="item.to" class="relative block aspect-video w-full overflow-hidden"
                  :class="coverClass(item.kind)">
                  <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.name"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105">
                  <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'"
                    class="absolute inset-0 m-auto h-12 w-12" />
                  <span
                    class="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">{{
                    item.kindLabel }}</span>
                  <span
                    class="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/20 group-hover:opacity-100"
                    aria-hidden="true">
                    <span
                      class="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-orange-500 shadow-lg">
                      <LearnIcon :name="item.kind === 'exam' ? 'exam' : 'play'" class="h-7 w-7" />
                    </span>
                  </span>
                </NuxtLink>

                <div class="flex flex-1 flex-col gap-3 p-4">
                  <NuxtLink :to="item.to" class="block font-bold leading-snug text-slate-900 hover:text-orange-600">{{
                    item.name }}</NuxtLink>

                  <span class="inline-flex items-center gap-2 self-start rounded-xl px-3 py-1.5"
                    :class="expiry(item.expires_at).tone">
                    <LearnIcon :name="item.expires_at ? 'clock' : 'infinity'" class="h-5 w-5 shrink-0" />
                    <span class="leading-tight">
                      <span class="block text-sm font-extrabold">{{ expiry(item.expires_at).headline }}</span>
                      <span v-if="item.expires_at" class="block text-[11px] font-semibold opacity-80">ใช้ได้ถึง {{
                        formatThaiDate(item.expires_at) }}</span>
                    </span>
                  </span>

                  <div class="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button v-if="item.expires_at" type="button"
                      class="renew-btn group relative isolate inline-flex items-center gap-1.5 rounded-full py-1.5 pe-1.5 ps-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 active:scale-[0.97]"
                      :class="{ 'renew-btn--urgent': renewUrgent(item.expires_at) }"
                      :aria-label="`ต่ออายุ ${item.name} ราคาพิเศษ`"
                      @click="renewItem = item">
                      <span class="pointer-events-none absolute inset-0 rounded-full" aria-hidden="true"
                        :class="renewUrgent(item.expires_at)
                          ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500'
                          : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'" />
                      <span class="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
                        <span class="renew-shine absolute inset-y-0 -start-1/2 w-1/2" />
                      </span>
                      <span v-for="spark in RENEW_SPARKS" :key="spark.style" class="renew-spark pointer-events-none absolute text-xs"
                        :style="spark.style" aria-hidden="true">✨</span>
                      <LearnIcon name="clock" class="renew-clock relative h-4 w-4" />
                      <span class="relative">ต่ออายุ</span>
                      <span
                        class="renew-tag relative rounded-full bg-yellow-300 px-2 py-0.5 text-[11px] font-extrabold text-rose-700 shadow-sm">
                        ราคาพิเศษ
                      </span>
                    </button>
                    <NuxtLink :to="item.to"
                      class="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600">
                      <LearnIcon :name="item.kind === 'exam' ? 'exam' : 'play'" class="h-4 w-4" />
                      {{ item.kind === 'exam' ? 'เข้าสอบ' : 'เข้าเรียน' }}
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </li>
          </ul>
        </section>
      </template>

      <section class="grid gap-3 sm:grid-cols-3">
        <div v-for="tip in tips" :key="tip.title" class="flex items-start gap-3 rounded-3xl p-4 ring-1"
          :class="tip.tone">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm"
            aria-hidden="true">{{ tip.emoji }}</span>
          <span>
            <span class="block text-sm font-extrabold text-slate-800">{{ tip.title }}</span>
            <span class="mt-0.5 block text-xs leading-relaxed text-slate-600">{{ tip.text }}</span>
          </span>
        </div>
      </section>

      <section v-if="recommendPending || recommended.length"
        class="rounded-[2rem] bg-gradient-to-br from-sky-50 via-white to-orange-50 p-5 ring-1 ring-sky-100 md:p-6">
        <CatalogGrid title="คอร์สเรียนที่แนะนำ" :description="recommendReason" :items="recommended"
          :pending="recommendPending" heading="h2" purchasable icon="course" chip="bg-orange-100 text-orange-600" />
        <div class="mt-5 text-center">
          <NuxtLink to="/courses"
            class="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-50">
            ดูคอร์สทั้งหมด
            <LearnIcon name="arrow" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </section>
    </template>

    <RenewPlanModal v-if="renewItem" :item="renewItem" @close="renewItem = null" />
  </div>
</template>

<script setup lang="ts">
import type { ClassroomItem } from '@/composables/useAuth'
import type { CatalogItem } from '@/composables/useCart'

useHead({ title: 'ห้องเรียนของฉัน | ClickClass Tutor' })

const { user, classroom, fetchUser } = useAuth()
const { fetchAll } = useStorefront()

onMounted(() => {
  fetchUser()
})

const hourMs = 60 * 60 * 1000
const dayMs = 24 * hourMs
const now = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = Date.now()
  }, 60 * 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const firstName = computed(() => user.value?.nickname?.trim() || user.value?.name?.trim().split(/\s+/)[0] || '')

const greeting = computed(() => {
  const hour = new Date(now.value).getHours()
  if (hour < 12) return { emoji: '🌤️', text: `สวัสดีตอนเช้า${firstName.value ? ` ${firstName.value}` : ''}` }
  if (hour < 17) return { emoji: '☀️', text: `สวัสดีตอนบ่าย${firstName.value ? ` ${firstName.value}` : ''}` }
  return { emoji: '🌙', text: `สวัสดีตอนเย็น${firstName.value ? ` ${firstName.value}` : ''}` }
})

const cheer = computed(() => (classroom.value.items.length
  ? 'วันนี้เรียนต่ออีกนิด เก่งขึ้นอีกหน่อย เราเป็นกำลังใจให้นะ'
  : 'เริ่มต้นการเรียนรู้ใหม่ๆ ได้เลย เลือกคอร์สที่ชอบแล้วมาเรียนด้วยกัน'))

const learningItems = computed(() => [...classroom.value.courses, ...classroom.value.curriculums])

const expiringSoon = computed(() => classroom.value.items.filter((item) => {
  if (!item.expires_at) return false
  const left = new Date(item.expires_at).getTime() - now.value
  return left > 0 && left <= 7 * dayMs
}))

const stats = computed(() => [
  { label: 'คอร์ส', value: learningItems.value.length, icon: 'course' as const, iconClass: 'text-blue-500', valueClass: 'text-blue-700' },
  { label: 'ข้อสอบ', value: classroom.value.exams.length, icon: 'exam' as const, iconClass: 'text-amber-500', valueClass: 'text-amber-600' },
  { label: 'ใกล้หมดสิทธิ์', value: expiringSoon.value.length, icon: 'clock' as const, iconClass: 'text-rose-500', valueClass: expiringSoon.value.length ? 'text-rose-600' : 'text-slate-400' },
])

const groups = computed(() => [
  {
    kind: 'learning',
    emoji: '📚',
    chip: 'bg-blue-50 text-blue-700',
    title: 'คอร์สเรียนของฉัน',
    subtitle: 'กดที่คอร์สเพื่อเรียนต่อจากที่ค้างไว้',
    empty: 'ยังไม่มีคอร์สหรือหลักสูตรที่เปิดสิทธิ์',
    items: learningItems.value,
  },
  {
    kind: 'exam',
    emoji: '📝',
    chip: 'bg-amber-50 text-amber-700',
    title: 'ข้อสอบของฉัน',
    subtitle: 'ฝึกทำข้อสอบเพื่อวัดความเข้าใจ',
    empty: 'ยังไม่มีข้อสอบที่เปิดสิทธิ์',
    items: classroom.value.exams,
  },
].filter(group => group.kind !== 'exam' || group.items.length))

const tips = [
  { emoji: '⏱️', title: 'เรียนวันละนิด', text: 'วันละ 20–30 นาทีแต่ทำทุกวัน ได้ผลกว่าเรียนรวดเดียว', tone: 'bg-sky-50 ring-sky-100' },
  { emoji: '✍️', title: 'จดสิ่งที่เข้าใจ', text: 'หยุดวิดีโอแล้วจดสั้นๆ ช่วยให้จำได้นานขึ้น', tone: 'bg-amber-50 ring-amber-100' },
  { emoji: '🏆', title: 'ทำแบบทดสอบท้ายบท', text: 'ลองทำข้อสอบหลังเรียน แล้วดูเฉลยเพื่อเก่งขึ้นอีก', tone: 'bg-emerald-50 ring-emerald-100' },
]

const { data: catalogData, pending: recommendPending } = useLazyAsyncData('home-recommend', () =>
  fetchAll<CatalogItem>('/catalog', { type: 'course,curriculum' }),
)

const catalog = computed(() => catalogData.value?.data ?? [])
const owned = computed(() => catalog.value.filter(item => item.purchased))
const ownedSubjects = computed(() => new Set(owned.value.map(item => item.subject?.slug).filter(Boolean)))
const ownedLevels = computed(() => new Set(owned.value.map(item => item.category?.slug).filter(Boolean)))

function relevance(item: CatalogItem) {
  let score = 0
  if (item.category?.slug && ownedLevels.value.has(item.category.slug)) score += 3
  if (item.subject?.slug && ownedSubjects.value.has(item.subject.slug)) score += 2
  if (item.is_featured) score += 1
  if (item.is_trial_available) score += 0.5
  return score
}

const recommended = computed(() => catalog.value
  .filter(item => !item.purchased)
  .map(item => ({ item, score: relevance(item) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 4)
  .map(entry => entry.item))

const recommendReason = computed(() => (owned.value.length
  ? 'คัดมาให้จากระดับชั้นและวิชาที่เรียนอยู่ เรียนต่อเนื่องจะยิ่งเข้าใจมากขึ้น'
  : 'คอร์สแนะนำที่เพื่อนๆ เรียนกันเยอะ เริ่มต้นได้เลย'))

function expiry(value: string | null | undefined) {
  if (!value) return { headline: 'เรียนได้ไม่จำกัดเวลา', tone: 'bg-sky-100 text-sky-700' }
  const left = new Date(value).getTime() - now.value
  if (!Number.isFinite(left)) return { headline: 'ไม่ทราบวันหมดอายุ', tone: 'bg-slate-100 text-slate-600' }
  if (left <= 0) return { headline: 'หมดอายุแล้ว', tone: 'bg-rose-100 text-rose-700' }
  if (left < dayMs) {
    const hours = Math.max(1, Math.ceil(left / hourMs))
    return { headline: `เหลือ ${hours} ชั่วโมง`, tone: 'bg-rose-100 text-rose-700' }
  }
  const days = Math.ceil(left / dayMs)
  if (days <= 3) return { headline: `เหลือ ${days} วัน`, tone: 'bg-rose-100 text-rose-700' }
  if (days <= 7) return { headline: `เหลือ ${days} วัน`, tone: 'bg-amber-100 text-amber-700' }
  return { headline: `เหลือ ${days} วัน`, tone: 'bg-emerald-100 text-emerald-700' }
}

const renewItem = ref<ClassroomItem | null>(null)

function renewUrgent(value: string | null | undefined) {
  if (!value) return false
  return new Date(value).getTime() - now.value <= 7 * dayMs
}

function coverClass(kind: string) {
  if (kind === 'exam') return 'bg-amber-100 text-amber-600'
  if (kind === 'curriculum') return 'bg-sky-100 text-sky-600'
  return 'bg-blue-100 text-blue-600'
}

const RENEW_SPARKS = [
  { style: 'top: -9px; inset-inline-start: 10%; --sd: 0s' },
  { style: 'top: -7px; inset-inline-end: 18%; --sd: 0.7s' },
  { style: 'bottom: -9px; inset-inline-start: 42%; --sd: 1.3s' },
]
</script>

<style scoped>
.renew-btn {
  animation: renew-glow 2.2s ease-in-out infinite;
}

.renew-btn--urgent {
  animation-duration: 1.2s;
}

.renew-btn::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  background: conic-gradient(from var(--renew-angle, 0deg), #fde047, #fb923c, #f43f5e, #a855f7, #fde047);
  z-index: -1;
  opacity: 0.85;
  animation: renew-spin 3s linear infinite;
}

.renew-shine {
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 0.7), transparent);
  transform: skewX(-20deg);
  animation: renew-shine 2.6s ease-in-out infinite;
}

.renew-spark {
  animation: renew-twinkle 2s ease-in-out var(--sd, 0s) infinite;
}

.renew-tag {
  animation: renew-tag 2.2s ease-in-out infinite;
}

.renew-btn:hover .renew-clock {
  animation: renew-tick 0.6s ease-in-out;
}

.renew-btn:hover .renew-tag {
  animation: renew-wiggle 0.5s ease-in-out;
}

@property --renew-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes renew-spin {
  to { --renew-angle: 360deg; }
}

@keyframes renew-glow {
  0%, 100% { box-shadow: 0 4px 12px rgb(249 115 22 / 0.3); }
  50% { box-shadow: 0 6px 22px rgb(244 63 94 / 0.55), 0 0 0 4px rgb(253 224 71 / 0.25); }
}

@keyframes renew-shine {
  0% { inset-inline-start: -50%; }
  45%, 100% { inset-inline-start: 130%; }
}

@keyframes renew-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.4) rotate(0); }
  50% { opacity: 1; transform: scale(1.1) rotate(20deg); }
}

@keyframes renew-tag {
  0%, 100% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.08) rotate(-3deg); }
}

@keyframes renew-wiggle {
  0%, 100% { transform: rotate(0) scale(1.05); }
  25% { transform: rotate(-8deg) scale(1.12); }
  75% { transform: rotate(8deg) scale(1.12); }
}

@keyframes renew-tick {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(-25deg); }
}

@media (prefers-reduced-motion: reduce) {
  .renew-btn,
  .renew-btn::before,
  .renew-shine,
  .renew-spark,
  .renew-tag,
  .renew-btn:hover .renew-clock,
  .renew-btn:hover .renew-tag {
    animation: none;
  }

  .renew-shine,
  .renew-spark {
    display: none;
  }
}
</style>
