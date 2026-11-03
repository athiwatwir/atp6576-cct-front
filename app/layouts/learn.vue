<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-800">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="flex h-14 items-center gap-2 px-3 md:gap-3 md:px-6">
        <HeaderLogo to="/home" image-class="h-8 w-auto" variant="light" />

        <nav class="ms-2 hidden items-center gap-1 lg:flex" aria-label="เมนูหลัก">
          <NuxtLink v-for="item in links" :key="item.to" :to="item.to"
            class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pe-3 ps-1 text-sm font-semibold transition"
            :class="isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            <span class="flex h-7 w-7 items-center justify-center rounded-full" :class="item.chip">
              <LearnIcon :name="item.icon" class="h-4 w-4" />
            </span>
            {{ item.label }}
          </NuxtLink>
          <a :href="contactInfo.lineUrl" target="_blank" rel="noopener"
            class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pe-3 ps-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#06C755] text-[9px] font-extrabold text-white">LINE</span>
            ช่วยเหลือ
          </a>
        </nav>

        <div class="ms-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div v-if="classroom.items.length" class="relative hidden sm:block" v-click-outside="closeSwitcher">
            <button type="button"
              class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
              :aria-expanded="switcherOpen" aria-haspopup="menu" @click="toggleSwitcher">
              <LearnIcon name="classroom" class="h-4 w-4" />
              สลับคอร์ส
              <LearnIcon name="chevron" class="h-4 w-4 transition" :class="{ 'rotate-180': switcherOpen }" />
            </button>
            <div v-if="switcherOpen" class="absolute end-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-100" role="menu">
              <p class="px-3 py-2 text-xs font-semibold text-slate-400">คอร์สและข้อสอบของฉัน</p>
              <div class="max-h-80 overflow-y-auto">
                <NuxtLink v-for="item in classroom.items" :key="`${item.kind}-${item.id}`" :to="item.to" role="menuitem"
                  class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition"
                  :class="isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'">
                  <span class="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                    <img v-if="item.thumbnail_url" :src="item.thumbnail_url" alt="" class="h-full w-full object-cover">
                    <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'" class="h-4 w-4" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate">{{ item.name }}</span>
                    <span class="block text-xs font-medium text-slate-400">
                      {{ item.kindLabel }}{{ item.expires_at ? ` · ถึง ${formatThaiDate(item.expires_at)}` : '' }}
                    </span>
                  </span>
                  <LearnIcon v-if="isActive(item.to)" name="check" class="h-4 w-4 shrink-0" />
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="relative hidden sm:block" v-click-outside="closeAccount">
            <button type="button"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1 pe-2 ps-1 text-sm font-semibold transition"
              :class="accountOpen ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'"
              :aria-expanded="accountOpen" aria-haspopup="menu" aria-label="บัญชีของฉัน" @click="toggleAccount">
              <span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-violet-600">
                <img v-if="user?.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
                <LearnIcon v-else name="profile" class="h-4 w-4" />
              </span>
              <span class="max-w-32 truncate">{{ user?.name || 'บัญชีของฉัน' }}</span>
              <LearnIcon name="chevron" class="h-4 w-4 transition" :class="{ 'rotate-180': accountOpen }" />
            </button>
            <div v-if="accountOpen" class="absolute end-0 top-full z-40 mt-2 w-56 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-100" role="menu">
              <p v-if="user?.email" class="truncate px-3 py-2 text-xs font-semibold text-slate-400">{{ user.email }}</p>
              <NuxtLink v-for="item in accountLinks" :key="item.to" :to="item.to" role="menuitem"
                class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700">
                <LearnIcon :name="item.icon" class="h-4 w-4" />
                {{ item.label }}
              </NuxtLink>
              <button type="button" role="menuitem"
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                :disabled="signingOut" @click="signOut">
                <LearnIcon name="logout" class="h-4 w-4" />
                {{ signingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}
              </button>
            </div>
          </div>

          <button type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 lg:hidden"
            :class="{ 'bg-slate-100': menuOpen }"
            :aria-expanded="menuOpen" aria-controls="learn-menu" aria-label="เมนู" @click="menuOpen = !menuOpen">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path v-if="menuOpen" d="M6 6l12 12M18 6 6 18" />
              <path v-else d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="menuOpen" id="learn-menu" class="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-slate-100 bg-white px-3 pb-4 pt-2 shadow-lg lg:hidden">
        <div v-if="user" class="flex items-center gap-3 rounded-2xl bg-violet-50 p-3 sm:hidden">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-violet-600">
            <img v-if="user.avatar_url" :src="user.avatar_url" alt="" class="h-full w-full object-cover">
            <LearnIcon v-else name="profile" class="h-5 w-5" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-extrabold text-slate-900">{{ user.name }}</span>
            <span class="block truncate text-xs text-slate-500">{{ user.email }}</span>
          </span>
        </div>

        <nav class="mt-2 grid grid-cols-2 gap-2" aria-label="เมนูหลัก">
          <NuxtLink v-for="item in links" :key="item.to" :to="item.to"
            class="flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition"
            :class="isActive(item.to) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" :class="item.chip">
              <LearnIcon :name="item.icon" class="h-4 w-4" />
            </span>
            {{ item.label }}
          </NuxtLink>
          <a :href="contactInfo.lineUrl" target="_blank" rel="noopener"
            class="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#06C755] text-[9px] font-extrabold text-white">LINE</span>
            ช่วยเหลือ
          </a>
        </nav>

        <div v-if="classroom.items.length" class="mt-4">
          <p class="px-1 text-xs font-bold text-slate-400">สลับคอร์ส</p>
          <div class="mt-2 space-y-1">
            <NuxtLink v-for="item in classroom.items" :key="`${item.kind}-${item.id}`" :to="item.to"
              class="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold"
              :class="isActive(item.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'">
              <span class="flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                <img v-if="item.thumbnail_url" :src="item.thumbnail_url" alt="" class="h-full w-full object-cover">
                <LearnIcon v-else :name="item.kind === 'exam' ? 'exam' : 'course'" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1 truncate">{{ item.name }}</span>
              <LearnIcon v-if="isActive(item.to)" name="check" class="h-4 w-4 shrink-0" />
            </NuxtLink>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:hidden">
          <NuxtLink to="/profile" class="flex items-center justify-center gap-2 rounded-full bg-violet-50 px-3 py-2.5 text-sm font-bold text-violet-700">
            <LearnIcon name="profile" class="h-4 w-4" />
            โปรไฟล์
          </NuxtLink>
          <button type="button" class="flex items-center justify-center gap-2 rounded-full bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-600 disabled:opacity-60" :disabled="signingOut" @click="signOut">
            <LearnIcon name="logout" class="h-4 w-4" />
            {{ signingOut ? 'กำลังออก...' : 'ออกจากระบบ' }}
          </button>
        </div>
      </div>
    </header>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import vClickOutside from '@/directives/v-click-outside'

const { user, classroom, fetchUser, logout } = useAuth()
const route = useRoute()
const menuOpen = ref(false)
const switcherOpen = ref(false)
const accountOpen = ref(false)
const signingOut = ref(false)

const links = [
  { label: 'ห้องเรียนของฉัน', to: '/home', icon: 'classroom' as const, chip: 'bg-blue-100 text-blue-600' },
  { label: 'คอร์สเรียน', to: '/courses', icon: 'course' as const, chip: 'bg-sky-100 text-sky-600' },
  { label: 'ประวัติการสั่งซื้อ', to: '/orders', icon: 'receipt' as const, chip: 'bg-emerald-100 text-emerald-600' },
]

const accountLinks = [
  { label: 'โปรไฟล์', to: '/profile', icon: 'profile' as const },
  { label: 'ประวัติการสั่งซื้อ', to: '/orders', icon: 'receipt' as const },
  { label: 'หน้าแรกของร้าน', to: '/', icon: 'home' as const },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function closeSwitcher() {
  switcherOpen.value = false
}

function closeAccount() {
  accountOpen.value = false
}

function toggleSwitcher() {
  switcherOpen.value = !switcherOpen.value
  if (switcherOpen.value) {
    accountOpen.value = false
    fetchUser()
  }
}

function toggleAccount() {
  accountOpen.value = !accountOpen.value
  if (accountOpen.value) switcherOpen.value = false
}

watch(() => route.path, () => {
  menuOpen.value = false
  closeSwitcher()
  closeAccount()
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
</script>
