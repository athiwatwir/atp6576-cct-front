<template>
  <div ref="rootEl">
    <template v-if="pending">
      <div v-if="embedded" class="flex flex-col items-center gap-3 py-16 text-sm font-semibold text-slate-500">
        <span class="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-hidden="true" />
        กำลังโหลดข้อสอบ...
      </div>
      <PageLoading v-else message="กำลังโหลดข้อสอบ..." />
    </template>
    <div v-else-if="loadError" class="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
      <p class="text-3xl" aria-hidden="true">📝</p>
      <p class="mt-2 font-extrabold text-slate-900">{{ loadError }}</p>
      <button type="button" class="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700" @click="emit('exit')">{{ exitLabel }}</button>
    </div>

    <template v-else-if="exam">
      <!-- รายละเอียดข้อสอบ -->
      <section v-if="screen === 'intro'" class="space-y-4">
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
            <span class="flex items-center gap-2">
              <span v-if="exam.best_percentage !== null" class="text-sm font-bold text-emerald-600">ดีที่สุด {{ formatPercent(exam.best_percentage) }}</span>
              <button type="button" class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100" @click="openLeaderboard">
                <LearnIcon name="trophy" class="h-3.5 w-3.5" />
                อันดับ Top {{ TOP_COUNT }}
              </button>
            </span>
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
      <section v-else-if="screen === 'taking' && attempt">
        <div class="sticky z-20 -mx-4 mb-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6" :class="embedded ? '-mt-4 top-0 md:-mt-6' : 'top-14'">
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
      <section v-else-if="screen === 'result' && result" class="space-y-4">
        <div class="relative overflow-hidden rounded-3xl p-6 text-center shadow-sm ring-1 md:p-8" :class="resultTheme.box">
          <span class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full blur-2xl" :class="resultTheme.glow" aria-hidden="true" />

          <span class="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-8" :class="resultTheme.badge">
            <LearnIcon :name="result.status === 'expired' ? 'clock' : 'trophy'" class="h-12 w-12" />
          </span>
          <p class="relative mt-4 text-base font-extrabold" :class="resultTheme.text">{{ resultHeadline }}</p>

          <p class="relative mt-3 text-sm font-bold text-slate-500">คะแนนที่ได้</p>
          <p class="relative mt-1 flex items-baseline justify-center gap-2 font-extrabold text-slate-900">
            <span class="text-6xl leading-none md:text-7xl" :class="resultTheme.score">{{ formatScore(result.score) }}</span>
            <span class="text-2xl text-slate-400">/</span>
            <span class="text-3xl text-slate-500">{{ formatScore(result.max_score) }}</span>
            <span class="text-base font-bold text-slate-500">คะแนน</span>
          </p>

          <div class="relative mx-auto mt-4 h-3 max-w-xs overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-100">
            <span class="block h-full rounded-full transition-all duration-700" :class="resultTheme.bar" :style="{ width: `${Math.min(100, result.percentage)}%` }" />
          </div>

          <div class="relative mt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span class="rounded-full bg-white px-3 py-1.5 text-slate-700 ring-1 ring-slate-100">{{ formatPercent(result.percentage) }}</span>
            <span class="rounded-full bg-white px-3 py-1.5 text-slate-700 ring-1 ring-slate-100">ตอบถูก {{ result.correct_count }}/{{ result.question_count }} ข้อ</span>
            <span v-if="result.passing_score !== null" class="rounded-full bg-white px-3 py-1.5 text-slate-700 ring-1 ring-slate-100">เกณฑ์ผ่าน {{ result.passing_score }}%</span>
          </div>

          <div v-if="result.ranking" class="relative mx-auto mt-5 flex max-w-sm items-center gap-3 rounded-2xl bg-white/90 p-3 text-start shadow-sm ring-1 ring-amber-100">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" :class="rankBadge(result.ranking.rank).box" aria-hidden="true">
              {{ rankBadge(result.ranking.rank).emoji }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-xs font-bold text-slate-500">อันดับครั้งนี้</span>
              <span class="block text-lg font-extrabold text-slate-900">
                ที่ {{ result.ranking.rank.toLocaleString('th-TH') }}
                <span class="text-sm font-bold text-slate-500">จาก {{ result.ranking.total_students.toLocaleString('th-TH') }} คน</span>
              </span>
            </span>
            <button type="button" class="shrink-0 rounded-full bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-amber-200 hover:bg-amber-600" @click="openLeaderboard">
              ดู Top {{ TOP_COUNT }}
            </button>
          </div>

          <div class="relative mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50" @click="backToIntro">กลับหน้าข้อสอบ</button>
            <button type="button" class="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700" @click="emit('exit')">{{ exitLabel }}</button>
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

    <div v-if="leaderboardOpen" class="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" @click.self="leaderboardOpen = false">
      <div role="dialog" aria-modal="true" aria-labelledby="leaderboard-title" class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <header class="relative shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 px-5 pb-5 pt-4 text-white">
          <button type="button" class="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30" aria-label="ปิด" @click="leaderboardOpen = false">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20"><LearnIcon name="trophy" class="h-7 w-7" /></span>
          <h2 id="leaderboard-title" class="mt-2 text-xl font-extrabold">อันดับคะแนน Top {{ TOP_COUNT }}</h2>
          <p class="text-sm text-white/90">{{ exam?.name }}<template v-if="leaderboard"> · ผู้เข้าสอบ {{ leaderboard.total_students.toLocaleString('th-TH') }} คน</template></p>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <div v-if="leaderboardPending" class="flex flex-col items-center gap-3 py-12 text-sm font-semibold text-slate-500">
            <span class="h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500" aria-hidden="true" />
            กำลังโหลดอันดับ...
          </div>
          <p v-else-if="leaderboardError" class="m-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ leaderboardError }}</p>
          <p v-else-if="!leaderboard?.top.length" class="py-12 text-center text-sm text-slate-500">ยังไม่มีผู้ส่งคำตอบ เป็นคนแรกเลยสิ!</p>
          <ol v-else class="space-y-1.5">
            <li
              v-for="row in leaderboard.top"
              :key="`${row.rank}-${row.name}-${row.submitted_at}`"
              class="flex items-center gap-3 rounded-2xl px-3 py-2.5"
              :class="row.is_me ? 'bg-blue-50 ring-2 ring-blue-300' : row.rank <= 3 ? 'bg-amber-50/70' : 'bg-slate-50'"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold" :class="rankBadge(row.rank).box">
                {{ row.rank <= 3 ? rankBadge(row.rank).emoji : row.rank }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-bold text-slate-800">{{ row.name }}<span v-if="row.is_me" class="ms-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">คุณ</span></span>
                <span v-if="row.school_name" class="block truncate text-xs text-slate-400">{{ row.school_name }}</span>
              </span>
              <span class="shrink-0 text-end">
                <span class="block text-sm font-extrabold text-slate-900">{{ formatScore(row.score) }}/{{ formatScore(row.max_score) }}</span>
                <span class="block text-xs font-semibold text-slate-400">{{ formatPercent(row.percentage) }}</span>
              </span>
            </li>
          </ol>
        </div>

        <footer v-if="leaderboard?.me && !leaderboard.top.some(row => row.is_me)" class="shrink-0 border-t border-slate-100 bg-white p-3">
          <p class="px-1 pb-1.5 text-xs font-bold text-slate-400">อันดับของคุณ</p>
          <div class="flex items-center gap-3 rounded-2xl bg-blue-50 px-3 py-2.5 ring-2 ring-blue-300">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white">{{ leaderboard.me.rank }}</span>
            <span class="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">{{ leaderboard.me.name }}</span>
            <span class="shrink-0 text-sm font-extrabold text-slate-900">{{ formatScore(leaderboard.me.score) }}/{{ formatScore(leaderboard.me.max_score) }}</span>
          </div>
        </footer>
        <p v-else-if="leaderboard && !leaderboard.me" class="shrink-0 border-t border-slate-100 bg-white px-4 py-3 text-center text-xs text-slate-500">ส่งคำตอบให้ครบเพื่อติดอันดับกับเพื่อนๆ</p>
      </div>
    </div>

    <div v-if="confirmOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" @click.self="confirmOpen = false">
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

interface LeaderboardRow {
  rank: number
  name: string
  school_name: string | null
  score: number
  max_score: number
  percentage: number
  submitted_at: string | null
  is_me: boolean
}

interface Leaderboard {
  total_students: number
  top: LeaderboardRow[]
  me: LeaderboardRow | null
}

interface AttemptResult extends AttemptSummary {
  passing_score: number | null
  ranking?: { rank: number, total_students: number } | null
  correct_count: number
  question_count: number
  review: ReviewQuestion[]
}

const props = withDefaults(defineProps<{
  slug: string
  exitLabel: string
  /** แสดงใน modal: เลื่อนกล่องที่มี data-exam-scroll แทนทั้งหน้า และแถบเวลาติดขอบบนของกล่อง */
  embedded?: boolean
}>(), { embedded: false })

const emit = defineEmits<{
  exit: []
  loaded: [exam: { name: string, courses: { slug: string }[] }]
  taking: [value: boolean]
}>()

const { api } = useApi()

const rootEl = ref<HTMLElement | null>(null)
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

const currentQuestion = computed(() => attempt.value?.questions[currentIndex.value] ?? null)
const answeredCount = computed(() => attempt.value?.questions.filter(question => answers[question.id]).length ?? 0)
const unansweredCount = computed(() => (attempt.value?.questions.length ?? 0) - answeredCount.value)
const secondsLeft = computed(() => {
  if (!attempt.value?.deadline_at) return 0
  return Math.max(0, Math.floor((new Date(attempt.value.deadline_at).getTime() - now.value) / 1000))
})

const storageKey = (attemptId: number) => `cct-exam-answers-${attemptId}`

const TOP_COUNT = 50
const leaderboardOpen = ref(false)
const leaderboardPending = ref(false)
const leaderboardError = ref('')
const leaderboard = ref<Leaderboard | null>(null)

async function openLeaderboard() {
  leaderboardOpen.value = true
  leaderboardPending.value = true
  leaderboardError.value = ''
  try {
    leaderboard.value = (await api<{ data: Leaderboard }>(`/learning/exams/${props.slug}/leaderboard`)).data
  }
  catch (error: unknown) {
    leaderboardError.value = apiErrorMessage(error, 'โหลดอันดับไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  finally {
    leaderboardPending.value = false
  }
}

function rankBadge(rank: number) {
  if (rank === 1) return { emoji: '🥇', box: 'bg-amber-100 text-amber-700' }
  if (rank === 2) return { emoji: '🥈', box: 'bg-slate-200 text-slate-700' }
  if (rank === 3) return { emoji: '🥉', box: 'bg-orange-100 text-orange-700' }
  if (rank <= 10) return { emoji: '🏅', box: 'bg-sky-100 text-sky-700' }
  return { emoji: '⭐', box: 'bg-white text-slate-600 ring-1 ring-slate-200' }
}

const resultHeadline = computed(() => {
  const value = result.value
  if (!value) return ''
  if (value.status === 'expired') return 'หมดเวลาแล้ว ครั้งหน้าลองใหม่นะ'
  if (value.passed === true) return 'เยี่ยมมาก! สอบผ่านแล้ว'
  if (value.passed === false) return 'ยังไม่ผ่าน ลองอีกครั้ง เก่งขึ้นแน่นอน'
  return value.percentage >= 80 ? 'เก่งมาก! ทำได้ดีเยี่ยม' : value.percentage >= 50 ? 'ทำได้ดี! ฝึกต่ออีกนิด' : 'ส่งคำตอบแล้ว ลองดูเฉลยด้านล่างนะ'
})

const resultTheme = computed(() => {
  const value = result.value
  if (value?.status === 'expired') {
    return { box: 'bg-slate-50 ring-slate-200', glow: 'bg-slate-200/60', badge: 'bg-slate-200 text-slate-500 ring-slate-100', text: 'text-slate-600', score: 'text-slate-700', bar: 'bg-slate-400' }
  }
  if (value?.passed === false) {
    return { box: 'bg-gradient-to-br from-rose-50 to-white ring-rose-100', glow: 'bg-rose-200/50', badge: 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500 ring-white', text: 'text-rose-600', score: 'text-rose-600', bar: 'bg-rose-400' }
  }
  return { box: 'bg-gradient-to-br from-amber-50 via-white to-emerald-50 ring-amber-100', glow: 'bg-amber-200/60', badge: 'bg-gradient-to-br from-amber-300 to-orange-400 text-white ring-amber-100', text: 'text-emerald-600', score: 'text-amber-500', bar: 'bg-gradient-to-r from-amber-400 to-emerald-500' }
})

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

function scrollTop() {
  const box = props.embedded ? rootEl.value?.closest('[data-exam-scroll]') : null
  if (box) box.scrollTo({ top: 0 })
  else window.scrollTo({ top: 0 })
}

async function loadExam() {
  pending.value = true
  loadError.value = ''
  try {
    exam.value = (await api<{ data: ExamInfo }>(`/learning/exams/${props.slug}`)).data
    emit('loaded', exam.value)
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
    const running = (await api<{ data: RunningAttempt }>(`/learning/exams/${props.slug}/attempts`, { method: 'POST' })).data
    attempt.value = running
    for (const key of Object.keys(answers)) delete answers[Number(key)]
    const saved = JSON.parse(localStorage.getItem(storageKey(running.id)) || '{}') as Record<string, number>
    for (const [questionId, choiceId] of Object.entries(saved)) answers[Number(questionId)] = choiceId
    currentIndex.value = Math.max(0, running.questions.findIndex(question => !answers[question.id]))
    screen.value = 'taking'
    startTimer()
    scrollTop()
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
    const response = await api<{ data: AttemptResult }>(`/learning/exams/${props.slug}/attempts/${running.id}/submit`, {
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
  scrollTop()
}

async function openResult(attemptId: number) {
  busy.value = true
  actionError.value = ''
  try {
    result.value = (await api<{ data: AttemptResult }>(`/learning/exams/${props.slug}/attempts/${attemptId}`)).data
    screen.value = 'result'
    scrollTop()
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

watch(screen, value => emit('taking', value === 'taking'))

watch(() => props.slug, () => {
  stopTimer()
  screen.value = 'intro'
  attempt.value = null
  result.value = null
  confirmOpen.value = false
  leaderboardOpen.value = false
  leaderboard.value = null
  actionError.value = ''
  loadExam()
}, { immediate: true })

onMounted(() => window.addEventListener('beforeunload', warnBeforeLeave))
onUnmounted(() => {
  stopTimer()
  window.removeEventListener('beforeunload', warnBeforeLeave)
})
</script>
