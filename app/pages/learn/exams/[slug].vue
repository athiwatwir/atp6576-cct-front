<template>
  <div class="mx-auto max-w-3xl p-4 md:p-6">
    <NuxtLink :to="backTo" class="text-sm font-bold text-blue-700">{{ backLabel }}</NuxtLink>

    <p v-if="pending" class="mt-6 text-sm text-slate-500">กำลังโหลดข้อสอบ...</p>
    <div v-else-if="loadError" class="mt-6 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
      <p class="text-3xl" aria-hidden="true">📝</p>
      <p class="mt-2 font-extrabold text-slate-900">{{ loadError }}</p>
      <NuxtLink to="/home" class="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">กลับห้องเรียน</NuxtLink>
    </div>

    <template v-else-if="exam">
      <!-- รายละเอียดข้อสอบ -->
      <section v-if="screen === 'intro'" class="mt-4 space-y-4">
        <div class="rounded-3xl bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm ring-1 ring-amber-100">
          <p class="text-xs font-bold text-amber-600">{{ exam.type === 'primary_exam' ? 'ข้อสอบ' : 'แบบทดสอบในคอร์ส' }}</p>
          <h1 class="mt-1 text-2xl font-extrabold text-slate-900">{{ exam.name }}</h1>
          <p v-if="exam.description" class="mt-2 whitespace-pre-line text-sm text-slate-600">{{ exam.description }}</p>
          <dl class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
              <dt class="text-xs text-slate-500">จำนวนข้อ</dt>
              <dd class="text-lg font-extrabold text-slate-900">{{ exam.question_count }} ข้อ</dd>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
              <dt class="text-xs text-slate-500">เวลา</dt>
              <dd class="text-lg font-extrabold text-slate-900">{{ exam.duration_minutes ? `${exam.duration_minutes} นาที` : 'ไม่จำกัด' }}</dd>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
              <dt class="text-xs text-slate-500">คะแนนผ่าน</dt>
              <dd class="text-lg font-extrabold text-slate-900">{{ exam.passing_score !== null ? `${exam.passing_score}%` : 'ไม่กำหนด' }}</dd>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
              <dt class="text-xs text-slate-500">ทำได้อีก</dt>
              <dd class="text-lg font-extrabold text-slate-900">{{ exam.attempts_remaining === null ? 'ไม่จำกัด' : `${exam.attempts_remaining} ครั้ง` }}</dd>
            </div>
          </dl>
          <p v-if="actionError" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ actionError }}</p>
          <button
            v-if="exam.can_start && exam.question_count > 0"
            type="button"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:bg-slate-300 sm:w-auto"
            :disabled="busy"
            @click="startAttempt"
          >
            <LearnIcon name="exam" class="h-4 w-4" />
            {{ busy ? 'กำลังเตรียมข้อสอบ...' : exam.active_attempt_id ? 'ทำข้อสอบต่อ' : exam.attempts_used ? 'ทำอีกครั้ง' : 'เริ่มทำข้อสอบ' }}
          </button>
          <p v-else-if="exam.question_count === 0" class="mt-5 text-sm font-semibold text-slate-500">ข้อสอบนี้ยังไม่มีคำถาม</p>
          <p v-else class="mt-5 text-sm font-semibold text-slate-500">ทำข้อสอบนี้ครบจำนวนครั้งแล้ว</p>
          <p v-if="exam.duration_minutes && exam.can_start" class="mt-3 text-xs text-slate-400">เมื่อกดเริ่ม เวลาจะเดินทันที หมดเวลาแล้วระบบส่งคำตอบให้อัตโนมัติ</p>
        </div>

        <div v-if="exam.attempts.length" class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-extrabold text-slate-900">ประวัติการทำข้อสอบ</h2>
            <span v-if="exam.best_percentage !== null" class="text-sm font-bold text-emerald-600">ดีที่สุด {{ formatPercent(exam.best_percentage) }}</span>
          </div>
          <ul class="mt-3 divide-y divide-slate-100">
            <li v-for="attempt in exam.attempts" :key="attempt.id" class="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                <span class="block text-sm font-bold text-slate-800">ครั้งที่ {{ attempt.attempt_number }}</span>
                <span class="block text-xs text-slate-400">{{ attempt.submitted_at ? dateTime(attempt.submitted_at) : '' }}{{ attempt.status === 'expired' ? ' · หมดเวลา' : '' }}</span>
              </span>
              <span class="flex items-center gap-3">
                <span class="text-sm font-extrabold text-slate-900">{{ formatScore(attempt.score) }}/{{ formatScore(attempt.max_score) }} ({{ formatPercent(attempt.percentage) }})</span>
                <span v-if="attempt.passed !== null" class="rounded-full px-2.5 py-1 text-xs font-bold" :class="attempt.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">{{ attempt.passed ? 'ผ่าน' : 'ไม่ผ่าน' }}</span>
                <button type="button" class="text-sm font-bold text-blue-700 hover:underline" @click="openResult(attempt.id)">ดูเฉลย</button>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <!-- ทำข้อสอบ -->
      <section v-else-if="screen === 'taking' && attempt" class="mt-4">
        <div class="sticky top-14 z-20 -mx-4 mb-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-extrabold text-slate-900">{{ exam.name }}</p>
              <p class="text-xs text-slate-500">ตอบแล้ว {{ answeredCount }}/{{ attempt.questions.length }} ข้อ</p>
            </div>
            <span v-if="attempt.deadline_at" class="shrink-0 rounded-full px-3 py-1.5 font-mono text-sm font-bold" :class="secondsLeft <= 60 ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-800 ring-1 ring-slate-200'">
              ⏱ {{ clock(secondsLeft) }}
            </span>
          </div>
          <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200">
            <span class="block h-full rounded-full bg-amber-500 transition-all" :style="{ width: `${(answeredCount / attempt.questions.length) * 100}%` }" />
          </span>
        </div>

        <article v-if="currentQuestion" class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
          <p class="text-xs font-bold text-amber-600">ข้อที่ {{ currentQuestion.number }} จาก {{ attempt.questions.length }} · {{ formatScore(currentQuestion.points) }} คะแนน</p>
          <h2 class="mt-2 whitespace-pre-line text-lg font-bold leading-relaxed text-slate-900">{{ currentQuestion.text }}</h2>
          <img v-if="currentQuestion.image_url" :src="currentQuestion.image_url" alt="รูปประกอบคำถาม" class="mt-4 max-h-80 w-auto rounded-2xl ring-1 ring-slate-100">

          <div class="mt-5 grid gap-2" role="radiogroup" :aria-label="`ตัวเลือกข้อที่ ${currentQuestion.number}`">
            <button
              v-for="(choice, index) in currentQuestion.choices"
              :key="choice.id"
              type="button"
              role="radio"
              :aria-checked="answers[currentQuestion.id] === choice.id"
              class="flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-start text-sm transition"
              :class="answers[currentQuestion.id] === choice.id ? 'border-amber-500 bg-amber-50 font-bold text-slate-900' : 'border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40'"
              @click="choose(currentQuestion.id, choice.id)"
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold" :class="answers[currentQuestion.id] === choice.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'">{{ choiceLabel(index) }}</span>
              <span class="whitespace-pre-line pt-1">{{ choice.text }}</span>
            </button>
          </div>

          <div class="mt-6 flex items-center justify-between gap-3">
            <button type="button" class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40" :disabled="currentIndex === 0" @click="currentIndex--">ข้อก่อนหน้า</button>
            <button v-if="currentIndex < attempt.questions.length - 1" type="button" class="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700" @click="currentIndex++">ข้อถัดไป</button>
            <button v-else type="button" class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700" @click="confirmOpen = true">ส่งคำตอบ</button>
          </div>
        </article>

        <div class="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p class="text-xs font-bold text-slate-500">เลือกข้อ</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="(question, index) in attempt.questions"
              :key="question.id"
              type="button"
              class="h-9 w-9 rounded-xl text-sm font-bold transition"
              :class="index === currentIndex ? 'bg-blue-600 text-white' : answers[question.id] ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
              :aria-label="`ไปข้อที่ ${question.number}${answers[question.id] ? ' (ตอบแล้ว)' : ''}`"
              @click="currentIndex = index"
            >
              {{ question.number }}
            </button>
          </div>
          <button type="button" class="mt-4 w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700" @click="confirmOpen = true">ส่งคำตอบ</button>
        </div>
      </section>

      <!-- ผลสอบ -->
      <section v-else-if="screen === 'result' && result" class="mt-4 space-y-4">
        <div class="rounded-3xl p-6 text-center shadow-sm ring-1" :class="result.passed === false ? 'bg-rose-50 ring-rose-100' : 'bg-emerald-50 ring-emerald-100'">
          <p class="text-4xl" aria-hidden="true">{{ result.status === 'expired' ? '⏰' : result.passed === false ? '💪' : result.passed === true ? '🎉' : '📝' }}</p>
          <p class="mt-2 text-sm font-bold" :class="result.passed === false ? 'text-rose-600' : 'text-emerald-600'">
            {{ result.status === 'expired' ? 'หมดเวลา' : result.passed === true ? 'สอบผ่าน' : result.passed === false ? 'ยังไม่ผ่าน ลองอีกครั้งนะ' : 'ส่งคำตอบแล้ว' }}
          </p>
          <p class="mt-1 text-5xl font-extrabold text-slate-900">{{ formatPercent(result.percentage) }}</p>
          <p class="mt-2 text-sm text-slate-600">
            ได้ {{ formatScore(result.score) }} จาก {{ formatScore(result.max_score) }} คะแนน · ตอบถูก {{ result.correct_count }}/{{ result.question_count }} ข้อ
            <template v-if="result.passing_score !== null"> · เกณฑ์ผ่าน {{ result.passing_score }}%</template>
          </p>
          <div class="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" @click="backToIntro">กลับหน้าข้อสอบ</button>
            <NuxtLink :to="backTo" class="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">{{ backLabel }}</NuxtLink>
          </div>
        </div>

        <div class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 class="font-extrabold text-slate-900">เฉลย</h2>
          <ol class="mt-4 space-y-5">
            <li v-for="question in result.review" :key="question.id" class="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <p class="flex items-start gap-2 text-sm font-bold text-slate-900">
                <span class="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs" :class="question.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">{{ question.is_correct ? 'ถูก' : 'ผิด' }}</span>
                <span class="whitespace-pre-line">{{ question.number }}. {{ question.text }}</span>
              </p>
              <img v-if="question.image_url" :src="question.image_url" alt="รูปประกอบคำถาม" class="mt-3 max-h-60 w-auto rounded-2xl ring-1 ring-slate-100">
              <ul class="mt-3 space-y-1.5">
                <li
                  v-for="(choice, index) in question.choices"
                  :key="choice.id"
                  class="flex items-start gap-2 rounded-xl px-3 py-2 text-sm"
                  :class="choice.id === question.correct_choice_id ? 'bg-emerald-50 font-bold text-emerald-800' : choice.id === question.selected_choice_id ? 'bg-rose-50 text-rose-700 line-through' : 'text-slate-600'"
                >
                  <span class="shrink-0 font-bold">{{ choiceLabel(index) }}.</span>
                  <span class="whitespace-pre-line">{{ choice.text }}</span>
                  <span v-if="choice.id === question.correct_choice_id" class="ms-auto shrink-0 text-xs">✓ คำตอบที่ถูก</span>
                  <span v-else-if="choice.id === question.selected_choice_id" class="ms-auto shrink-0 text-xs no-underline">คำตอบของคุณ</span>
                </li>
              </ul>
              <p v-if="!question.selected_choice_id" class="mt-2 text-xs font-semibold text-slate-400">ไม่ได้ตอบข้อนี้</p>
              <p v-if="question.explanation" class="mt-3 whitespace-pre-line rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-700">
                <span class="font-bold text-sky-700">คำอธิบาย:</span> {{ question.explanation }}
              </p>
            </li>
          </ol>
        </div>
      </section>
    </template>

    <div v-if="confirmOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" @click.self="confirmOpen = false">
      <div role="dialog" aria-modal="true" aria-labelledby="submit-title" class="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
        <h2 id="submit-title" class="text-lg font-extrabold text-slate-900">ส่งคำตอบเลยไหม</h2>
        <p class="mt-2 text-sm text-slate-600">
          ตอบแล้ว {{ answeredCount }}/{{ attempt?.questions.length ?? 0 }} ข้อ
          <template v-if="unansweredCount"><br><span class="font-bold text-rose-600">ยังไม่ได้ตอบ {{ unansweredCount }} ข้อ</span></template>
        </p>
        <p v-if="actionError" class="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ actionError }}</p>
        <div class="mt-5 grid grid-cols-2 gap-2">
          <button type="button" class="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200" @click="confirmOpen = false">กลับไปตรวจ</button>
          <button type="button" class="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300" :disabled="busy" @click="submitAttempt">{{ busy ? 'กำลังส่ง...' : 'ส่งคำตอบ' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'learn' })

interface AttemptSummary {
  id: number
  attempt_number: number
  status: 'in_progress' | 'submitted' | 'expired'
  started_at: string | null
  submitted_at: string | null
  score: number
  max_score: number
  percentage: number
  passed: boolean | null
}

interface ExamInfo {
  id: number
  slug: string
  name: string
  description: string | null
  type: string
  duration_minutes: number | null
  passing_score: number | null
  max_attempts: number | null
  question_count: number
  courses: { id: number, name: string, slug: string }[]
  attempts_used: number
  attempts_remaining: number | null
  can_start: boolean
  active_attempt_id: number | null
  best_percentage: number | null
  attempts: AttemptSummary[]
}

interface ExamChoice {
  id: number
  text: string
}

interface ExamQuestion {
  id: number
  number: number
  text: string
  image_url: string | null
  points: number
  choices: ExamChoice[]
}

interface RunningAttempt extends AttemptSummary {
  deadline_at: string | null
  questions: ExamQuestion[]
}

interface ReviewQuestion extends ExamQuestion {
  explanation: string | null
  selected_choice_id: number | null
  correct_choice_id: number | null
  is_correct: boolean
  points_awarded: number
}

interface AttemptResult extends AttemptSummary {
  passing_score: number | null
  correct_count: number
  question_count: number
  review: ReviewQuestion[]
}

const route = useRoute()
const { api } = useApi()
const slug = computed(() => String(route.params.slug || ''))

const exam = ref<ExamInfo | null>(null)
const pending = ref(true)
const loadError = ref('')
const screen = ref<'intro' | 'taking' | 'result'>('intro')
const attempt = ref<RunningAttempt | null>(null)
const result = ref<AttemptResult | null>(null)
const answers = reactive<Record<number, number>>({})
const currentIndex = ref(0)
const busy = ref(false)
const actionError = ref('')
const confirmOpen = ref(false)
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined

const courseSlug = computed(() => (typeof route.query.course === 'string' ? route.query.course : exam.value?.courses[0]?.slug ?? ''))
const backTo = computed(() => (courseSlug.value ? `/learn/${courseSlug.value}` : '/home'))
const backLabel = computed(() => (courseSlug.value ? 'กลับไปหน้าเรียน' : 'กลับห้องเรียน'))

const currentQuestion = computed(() => attempt.value?.questions[currentIndex.value] ?? null)
const answeredCount = computed(() => attempt.value?.questions.filter(question => answers[question.id]).length ?? 0)
const unansweredCount = computed(() => (attempt.value?.questions.length ?? 0) - answeredCount.value)
const secondsLeft = computed(() => {
  if (!attempt.value?.deadline_at) return 0
  return Math.max(0, Math.floor((new Date(attempt.value.deadline_at).getTime() - now.value) / 1000))
})

const storageKey = (attemptId: number) => `cct-exam-answers-${attemptId}`

function choiceLabel(index: number) {
  return ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ'][index] ?? String(index + 1)
}

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function formatPercent(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

function clock(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  return [hours, minutes, rest].map(part => String(part).padStart(2, '0')).join(':')
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

async function loadExam() {
  pending.value = true
  loadError.value = ''
  try {
    exam.value = (await api<{ data: ExamInfo }>(`/learning/exams/${slug.value}`)).data
    useHead({ title: `${exam.value.name} | ห้องเรียน ClickClass Tutor` })
  }
  catch (error: unknown) {
    const status = apiStatus(error)
    loadError.value = status === 403
      ? 'ยังไม่มีสิทธิ์ทำข้อสอบนี้ หรือสิทธิ์เรียนหมดอายุแล้ว'
      : status === 404 ? 'ไม่พบข้อสอบนี้' : apiErrorMessage(error, 'โหลดข้อสอบไม่สำเร็จ')
  }
  finally {
    pending.value = false
  }
}

function stopTimer() {
  if (timer) clearInterval(timer)
  timer = undefined
}

function startTimer() {
  stopTimer()
  if (!attempt.value?.deadline_at) return
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
    if (secondsLeft.value <= 0 && screen.value === 'taking' && !busy.value) submitAttempt()
  }, 1000)
}

async function startAttempt() {
  busy.value = true
  actionError.value = ''
  try {
    const running = (await api<{ data: RunningAttempt }>(`/learning/exams/${slug.value}/attempts`, { method: 'POST' })).data
    attempt.value = running
    for (const key of Object.keys(answers)) delete answers[Number(key)]
    const saved = JSON.parse(localStorage.getItem(storageKey(running.id)) || '{}') as Record<string, number>
    for (const [questionId, choiceId] of Object.entries(saved)) answers[Number(questionId)] = choiceId
    currentIndex.value = Math.max(0, running.questions.findIndex(question => !answers[question.id]))
    screen.value = 'taking'
    startTimer()
    window.scrollTo({ top: 0 })
  }
  catch (error: unknown) {
    actionError.value = apiErrorMessage(error, 'เริ่มทำข้อสอบไม่สำเร็จ')
  }
  finally {
    busy.value = false
  }
}

function choose(questionId: number, choiceId: number) {
  answers[questionId] = choiceId
  if (attempt.value) localStorage.setItem(storageKey(attempt.value.id), JSON.stringify(answers))
}

async function submitAttempt() {
  if (!attempt.value || busy.value) return
  busy.value = true
  actionError.value = ''
  const running = attempt.value
  try {
    const response = await api<{ data: AttemptResult }>(`/learning/exams/${slug.value}/attempts/${running.id}/submit`, {
      method: 'POST',
      body: { answers: running.questions.map(question => ({ question_id: question.id, choice_id: answers[question.id] ?? null })) },
    })
    showResult(response.data, running.id)
  }
  catch (error: unknown) {
    const data = (error as { data?: { data?: AttemptResult } }).data?.data
    if (data?.review) showResult(data, running.id)
    else actionError.value = apiErrorMessage(error, 'ส่งคำตอบไม่สำเร็จ ลองอีกครั้ง')
  }
  finally {
    busy.value = false
  }
}

function showResult(value: AttemptResult, attemptId: number) {
  stopTimer()
  localStorage.removeItem(storageKey(attemptId))
  confirmOpen.value = false
  result.value = value
  attempt.value = null
  screen.value = 'result'
  window.scrollTo({ top: 0 })
}

async function openResult(attemptId: number) {
  busy.value = true
  actionError.value = ''
  try {
    result.value = (await api<{ data: AttemptResult }>(`/learning/exams/${slug.value}/attempts/${attemptId}`)).data
    screen.value = 'result'
    window.scrollTo({ top: 0 })
  }
  catch (error: unknown) {
    actionError.value = apiErrorMessage(error, 'โหลดผลสอบไม่สำเร็จ')
  }
  finally {
    busy.value = false
  }
}

async function backToIntro() {
  screen.value = 'intro'
  result.value = null
  await loadExam()
}

function warnBeforeLeave(event: BeforeUnloadEvent) {
  if (screen.value !== 'taking') return
  event.preventDefault()
}

onMounted(() => window.addEventListener('beforeunload', warnBeforeLeave))
onUnmounted(() => {
  stopTimer()
  window.removeEventListener('beforeunload', warnBeforeLeave)
})

await loadExam()
</script>
