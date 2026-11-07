<template>
  <section class="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100">
    <div class="relative h-36 overflow-hidden bg-amber-100 sm:h-48 md:h-56">
      <img src="/images/cover/clickclass-learn.webp" alt="" class="h-full w-full object-cover object-[70%_35%]" aria-hidden="true">
      <span class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" aria-hidden="true" />
      <p class="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-orange-600 shadow-sm backdrop-blur md:start-6 md:top-6">
        <span aria-hidden="true">{{ greeting.emoji }}</span>
        {{ greeting.text }}
      </p>
    </div>

    <div class="relative px-4 pb-5 md:px-8 md:pb-7">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="-mt-14 shrink-0 sm:-mt-16">
          <button
            type="button"
            class="group relative block h-28 w-28 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 disabled:cursor-wait sm:h-32 sm:w-32"
            :disabled="avatarPending"
            aria-label="เปลี่ยนรูปโปรไฟล์"
            @click="avatarInput?.click()"
          >
            <span class="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-100 to-amber-200 text-4xl font-extrabold text-orange-600 shadow-lg ring-4 ring-white">
              <img v-if="previewUrl || user?.avatar_url" :src="previewUrl || user?.avatar_url || ''" alt="" class="h-full w-full object-cover">
              <span v-else>{{ initial }}</span>
            </span>
            <span class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-slate-900/50 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" :class="{ 'opacity-100': avatarPending }" aria-hidden="true">
              <span v-if="avatarPending" class="h-8 w-8 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
              <template v-else>
                <LearnIcon name="camera" class="h-7 w-7" />
                <span class="mt-0.5 text-xs font-bold">เปลี่ยนรูป</span>
              </template>
            </span>
            <span class="absolute bottom-1 end-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-[3px] ring-white transition group-hover:bg-orange-600" aria-hidden="true">
              <LearnIcon name="camera" class="h-4 w-4" />
            </span>
          </button>
          <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onAvatar">
        </div>

        <NuxtLink to="/profile" class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
          <LearnIcon name="profile" class="h-4 w-4" />
          แก้ไขโปรไฟล์
        </NuxtLink>
      </div>

      <div class="mt-3">
        <form v-if="editingNickname" class="flex max-w-md flex-wrap items-center gap-2" @submit.prevent="saveNickname">
          <label class="min-w-0 flex-1">
            <span class="sr-only">ชื่อเล่น</span>
            <input
              ref="nicknameInput"
              v-model="nicknameDraft"
              maxlength="30"
              placeholder="เช่น น้องเก่ง"
              class="w-full rounded-full border border-orange-200 bg-orange-50/50 px-4 py-2 text-lg font-extrabold text-slate-900 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              @keydown.esc="cancelNickname"
            >
          </label>
          <button type="submit" class="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300" :disabled="nicknamePending">
            {{ nicknamePending ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
          <button type="button" class="rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100" @click="cancelNickname">ยกเลิก</button>
        </form>

        <div v-else class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">{{ displayName }}</h1>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition"
            :class="user?.nickname ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600' : 'bg-orange-50 text-orange-600 ring-1 ring-orange-200 hover:bg-orange-100'"
            @click="startNickname"
          >
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
              <path d="m13.5 6.5 4 4" />
            </svg>
            {{ user?.nickname ? 'แก้ชื่อเล่น' : 'ตั้งชื่อเล่น' }}
          </button>
        </div>

        <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span v-if="user?.nickname">{{ user.name }}</span>
          <span v-if="user?.school_name" class="inline-flex items-center gap-1">
            <LearnIcon name="location" class="h-4 w-4 text-orange-500" />
            {{ user.school_name }}
          </span>
        </p>
        <p class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span v-if="user?.email" class="inline-flex min-w-0 items-center gap-1">
            <LearnIcon name="mail" class="h-4 w-4 shrink-0 text-sky-500" />
            <span class="truncate">{{ user.email }}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <LearnIcon name="phone" class="h-4 w-4 shrink-0 text-emerald-500" />
            <span v-if="user?.phone">{{ user.phone }}</span>
            <NuxtLink v-else to="/profile" class="font-semibold text-orange-600 hover:underline">เพิ่มเบอร์โทร</NuxtLink>
          </span>
        </p>
        <p class="mt-2 max-w-xl text-sm text-slate-600">{{ cheer }}</p>

        <p v-if="message" class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold" :class="messageError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'">
          {{ message }}
        </p>
      </div>

      <dl class="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3 text-center ring-1 ring-slate-100 sm:max-w-md">
        <div v-for="stat in stats" :key="stat.label" class="px-2">
          <dd class="text-2xl font-extrabold" :class="stat.valueClass">{{ stat.value }}</dd>
          <dt class="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-slate-500">
            <LearnIcon :name="stat.icon" class="h-3.5 w-3.5" :class="stat.iconClass" />
            {{ stat.label }}
          </dt>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
type StatIcon = 'course' | 'exam' | 'clock'

defineProps<{
  greeting: { emoji: string, text: string }
  cheer: string
  stats: { label: string, value: number, icon: StatIcon, iconClass: string, valueClass: string }[]
}>()

const { user, patchProfile } = useAuth()

const avatarInput = ref<HTMLInputElement | null>(null)
const nicknameInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const avatarPending = ref(false)
const nicknamePending = ref(false)
const editingNickname = ref(false)
const nicknameDraft = ref('')
const message = ref('')
const messageError = ref(false)

const displayName = computed(() => user.value?.nickname?.trim() || user.value?.name || 'ห้องเรียนของฉัน')
const initial = computed(() => displayName.value.trim().charAt(0) || 'น')

function notify(text: string, isError = false) {
  message.value = text
  messageError.value = isError
}

function clearPreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

async function onAvatar(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return notify('ใช้ได้เฉพาะไฟล์ jpg, png หรือ webp', true)
  if (file.size > 4 * 1024 * 1024) return notify('รูปโปรไฟล์ต้องไม่เกิน 4 MB', true)

  clearPreview()
  previewUrl.value = URL.createObjectURL(file)
  avatarPending.value = true
  message.value = ''
  try {
    await patchProfile({ avatar: file })
    notify('เปลี่ยนรูปโปรไฟล์แล้ว')
  }
  catch (error: unknown) {
    notify(apiErrorMessage(error, 'เปลี่ยนรูปโปรไฟล์ไม่สำเร็จ'), true)
  }
  finally {
    clearPreview()
    avatarPending.value = false
  }
}

function startNickname() {
  nicknameDraft.value = user.value?.nickname ?? ''
  message.value = ''
  editingNickname.value = true
  nextTick(() => nicknameInput.value?.focus())
}

function cancelNickname() {
  editingNickname.value = false
}

async function saveNickname() {
  if (nicknamePending.value) return
  nicknamePending.value = true
  try {
    await patchProfile({ nickname: nicknameDraft.value.trim() || null })
    editingNickname.value = false
    notify(nicknameDraft.value.trim() ? 'บันทึกชื่อเล่นแล้ว' : 'ลบชื่อเล่นแล้ว')
  }
  catch (error: unknown) {
    notify(apiErrorMessage(error, 'บันทึกชื่อเล่นไม่สำเร็จ'), true)
  }
  finally {
    nicknamePending.value = false
  }
}

onBeforeUnmount(clearPreview)
</script>
