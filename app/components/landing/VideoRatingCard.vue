<template>
  <section class="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-sm ring-1 ring-amber-100 md:p-5">
    <template v-if="saved && !editing">
      <div class="flex flex-wrap items-center gap-3">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">💛</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-extrabold text-slate-900">ขอบคุณที่ให้คะแนนบทเรียนนี้</p>
          <p class="mt-0.5 flex items-center gap-1 text-amber-500" :aria-label="`ให้ ${saved.rating} ดาว`">
            <svg v-for="star in 5" :key="star" viewBox="0 0 24 24" class="h-5 w-5" :class="star <= saved.rating ? 'fill-current' : 'fill-slate-200'" aria-hidden="true">
              <path :d="STAR_PATH" />
            </svg>
            <span class="ms-1 text-xs font-bold text-slate-500">{{ LABELS[saved.rating - 1] }}</span>
          </p>
          <p v-if="saved.comment" class="mt-1.5 line-clamp-2 text-sm text-slate-600">“{{ saved.comment }}”</p>
        </div>
        <button type="button" class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-50" @click="startEdit">
          แก้ไขคำติชม
        </button>
      </div>
    </template>

    <form v-else @submit.prevent="submit">
      <div class="flex items-start gap-3">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">⭐</span>
        <div class="min-w-0">
          <h3 class="text-base font-extrabold text-slate-900">บทเรียนนี้เป็นอย่างไรบ้าง?</h3>
          <p class="text-sm text-slate-500">ให้ดาวและบอกเราหน่อย จะได้ทำบทเรียนให้ดีขึ้นอีก</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2" role="radiogroup" aria-label="ให้คะแนนวิดีโอ">
        <div class="flex items-center gap-1" @mouseleave="hovered = 0">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            role="radio"
            :aria-checked="rating === star"
            :aria-label="`${star} ดาว ${LABELS[star - 1]}`"
            class="rounded-lg p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            @mouseenter="hovered = star"
            @focus="hovered = star"
            @blur="hovered = 0"
            @click="rating = star"
          >
            <svg viewBox="0 0 24 24" class="h-9 w-9 drop-shadow-sm transition" :class="star <= (hovered || rating) ? 'fill-amber-400' : 'fill-slate-200'" aria-hidden="true">
              <path :d="STAR_PATH" />
            </svg>
          </button>
        </div>
        <span class="min-w-24 text-sm font-bold" :class="hovered || rating ? 'text-amber-600' : 'text-slate-400'">
          {{ hovered || rating ? LABELS[(hovered || rating) - 1] : 'แตะดาวเพื่อให้คะแนน' }}
        </span>
      </div>

      <label class="mt-4 block text-sm font-semibold text-slate-700">
        คำแนะนำ <span class="font-normal text-slate-400">(ไม่บังคับ)</span>
        <textarea
          v-model="comment"
          rows="3"
          maxlength="1000"
          placeholder="ชอบตรงไหน หรืออยากให้ปรับอะไร เช่น อธิบายช้าลงหน่อย อยากได้ตัวอย่างเพิ่ม"
          class="mt-1 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        <span class="mt-0.5 block text-end text-xs font-normal text-slate-400">{{ comment.length }}/1000</span>
      </label>

      <p v-if="error" class="mt-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{{ error }}</p>

      <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button v-if="saved" type="button" class="rounded-full px-4 py-2 text-sm font-bold text-slate-500 hover:bg-white" @click="editing = false">
          ยกเลิก
        </button>
        <button type="submit" class="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-200 transition hover:bg-amber-600 disabled:bg-slate-300 disabled:shadow-none" :disabled="!rating || pending">
          {{ pending ? 'กำลังส่ง...' : saved ? 'บันทึกคำติชม' : 'ส่งคำติชม' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { CourseVideo, VideoRating } from '@/composables/useCart'

const STAR_PATH = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8Z'
const LABELS = ['ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ยอดเยี่ยม']

const props = defineProps<{
  courseSlug: string
  video: CourseVideo
}>()

const emit = defineEmits<{ saved: [rating: VideoRating] }>()

const { api } = useApi()
const saved = ref<VideoRating | null>(props.video.my_rating ?? null)
const editing = ref(false)
const rating = ref(saved.value?.rating ?? 0)
const hovered = ref(0)
const comment = ref(saved.value?.comment ?? '')
const pending = ref(false)
const error = ref('')

function startEdit() {
  rating.value = saved.value?.rating ?? 0
  comment.value = saved.value?.comment ?? ''
  error.value = ''
  editing.value = true
}

async function submit() {
  if (!rating.value || pending.value) return
  pending.value = true
  error.value = ''
  try {
    const response = await api<{ data: VideoRating }>(`/courses/${props.courseSlug}/videos/${props.video.id}/rating`, {
      method: 'PUT',
      body: { rating: rating.value, comment: comment.value.trim() || null },
    })
    saved.value = response.data
    editing.value = false
    emit('saved', response.data)
  }
  catch (exception: unknown) {
    error.value = apiErrorMessage(exception, 'ส่งคำติชมไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  finally {
    pending.value = false
  }
}
</script>
