<template>
  <header class="sticky top-0 z-30 border-b border-blue-100 bg-white/90 backdrop-blur">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <div class="flex h-16 items-center gap-2 md:gap-3">
        <HeaderLogo image-class="h-9 w-auto sm:h-11" />

        <nav class="ms-1 hidden items-center gap-1 font-google-sans lg:flex">
          <NuxtLink
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pe-3 ps-1 text-sm font-semibold transition"
            :class="isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
          >
            <span class="flex h-7 w-7 items-center justify-center rounded-full" :class="item.chip">
              <LearnIcon :name="item.icon" class="h-4 w-4" />
            </span>
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="ms-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <NuxtLink to="/cart" class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:px-3">
            <LearnIcon name="cart" class="h-4 w-4" />
            ตะกร้า
            <span v-if="count" class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs text-white">{{ count }}</span>
          </NuxtLink>
          <template v-if="loggedIn">
            <div class="relative" v-click-outside="closeClassroom">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-4"
                :aria-expanded="classroomOpen"
                aria-haspopup="menu"
                @click="toggleClassroom"
              >
                <LearnIcon name="classroom" class="h-4 w-4" />
                <span class="hidden sm:inline">เข้าห้องเรียน</span>
                <span v-if="classroom.items.length" class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-blue-700">{{ classroom.items.length }}</span>
              </button>
              <div v-if="classroomOpen" class="absolute end-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-100" role="menu">
                <p class="px-3 py-2 text-xs font-semibold text-slate-400">สิทธิ์เรียนทั้งหมด</p>
                <p v-if="!classroom.items.length" class="px-3 py-2 text-sm text-slate-500">ยังไม่มีสิทธิ์เรียน</p>
                <div v-else class="max-h-80 overflow-y-auto">
                  <button
                    v-for="item in classroom.items"
                    :key="`${item.kind}-${item.id}`"
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    @click="openClassroom(item.to)"
                  >
                    <span class="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                      <img v-if="item.thumbnail_url" :src="item.thumbnail_url" alt="" class="h-full w-full object-cover">
                      <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'" class="h-4 w-4" />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate">{{ item.name }}</span>
                      <span class="block text-xs font-medium text-slate-400">{{ item.kindLabel }}</span>
                    </span>
                  </button>
                </div>
                <button type="button" role="menuitem" class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50" @click="openClassroom('/home')">
                  <LearnIcon name="classroom" class="h-4 w-4" />
                  ดูห้องเรียนทั้งหมด
                </button>
              </div>
            </div>
            <div class="relative" v-click-outside="closeAccount">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pe-2 ps-1 text-sm font-semibold transition"
                :class="accountOpen || isActive('/profile') ? 'bg-blue-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'"
                :aria-expanded="accountOpen"
                aria-haspopup="menu"
                @click="accountOpen = !accountOpen; if (accountOpen) classroomOpen = false"
              >
                <span class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-violet-600">
                  <img v-if="user?.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
                  <LearnIcon v-else name="profile" class="h-4 w-4" />
                </span>
                โปรไฟล์
                <svg viewBox="0 0 20 20" class="h-4 w-4 transition" :class="accountOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path d="m5 8 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <div v-if="accountOpen" class="absolute end-0 top-full z-40 mt-2 w-52 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-100" role="menu">
                <p v-if="user?.name" class="truncate px-3 py-2 text-xs font-semibold text-slate-400">{{ user.name }}</p>
                <button type="button" role="menuitem" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700" @click="openProfile">
                  <LearnIcon name="profile" class="h-4 w-4" />
                  โปรไฟล์
                </button>
                <button type="button" role="menuitem" class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60" :disabled="signingOut" @click="signOut">
                  <LearnIcon name="logout" class="h-4 w-4" />
                  {{ signingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/signin" class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:px-3">
              <LearnIcon name="login" class="h-4 w-4" />
              เข้าสู่ระบบ
            </NuxtLink>
            <NuxtLink to="/signup" class="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 sm:inline-flex sm:px-4">
              <LearnIcon name="signup" class="h-4 w-4" />
              สมัครสมาชิก
            </NuxtLink>
          </template>
        </div>
      </div>

      <nav class="flex gap-2 overflow-x-auto pb-3 font-google-sans [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        <NuxtLink
          v-for="item in links"
          :key="item.to"
          :to="item.to"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pe-3 ps-1 text-sm font-semibold transition"
          :class="isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
        >
          <span class="flex h-7 w-7 items-center justify-center rounded-full" :class="item.chip">
            <LearnIcon :name="item.icon" class="h-4 w-4" />
          </span>
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import vClickOutside from '@/directives/v-click-outside'

const { loggedIn, user, classroom, fetchUser, logout } = useAuth()
const { count } = useCart()
const route = useRoute()
const accountOpen = ref(false)
const classroomOpen = ref(false)
const signingOut = ref(false)

function closeAccount() {
  accountOpen.value = false
}

function closeClassroom() {
  classroomOpen.value = false
}

function toggleClassroom() {
  classroomOpen.value = !classroomOpen.value
  if (classroomOpen.value) {
    accountOpen.value = false
    fetchUser()
  }
}

async function openClassroom(path: string) {
  classroomOpen.value = false
  await navigateTo(path)
}

async function openProfile() {
  accountOpen.value = false
  await navigateTo('/profile')
}

watch(() => route.fullPath, () => {
  closeAccount()
  closeClassroom()
})

async function signOut() {
  if (signingOut.value) return
  signingOut.value = true
  try {
    await logout()
  }
  finally {
    signingOut.value = false
  }
}

const links = [
  { label: 'หน้าแรก', to: '/', icon: 'home' as const, chip: 'bg-sky-100 text-sky-600' },
  { label: 'คอร์สเรียน', to: '/courses', icon: 'course' as const, chip: 'bg-blue-100 text-blue-600' },
  { label: 'ข้อสอบ', to: '/exams', icon: 'exam' as const, chip: 'bg-amber-100 text-amber-600' },
  { label: 'หนังสือ', to: '/books', icon: 'book' as const, chip: 'bg-orange-100 text-orange-600' },
  { label: 'ติดต่อเรา', to: '/contact', icon: 'contact' as const, chip: 'bg-emerald-100 text-emerald-600' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>
