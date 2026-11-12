<template>
  <div class="space-y-6">
    <PageLoading v-if="!user" message="กำลังโหลดโปรไฟล์..." />

    <template v-else>
      <section
        class="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-r from-sky-100 to-blue-50 p-6 sm:flex-row sm:items-center">
        <div class="shrink-0">
          <button type="button"
            class="group relative block h-24 w-24 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-wait"
            :disabled="avatarPending" aria-label="เปลี่ยนรูปโปรไฟล์" @click="avatarInput?.click()">
            <span
              class="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-3xl font-extrabold text-blue-700 shadow-md ring-4 ring-white">
              <img v-if="previewUrl || user.avatar_url" :src="previewUrl || user.avatar_url || ''" alt=""
                class="h-full w-full object-cover">
              <span v-else>{{ initial }}</span>
            </span>
            <span
              class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-slate-900/50 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
              :class="{ 'opacity-100': avatarPending }" aria-hidden="true">
              <span v-if="avatarPending"
                class="h-7 w-7 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
              <template v-else>
                <LearnIcon name="camera" class="h-6 w-6" />
                <span class="mt-0.5 text-[11px] font-bold">เปลี่ยนรูป</span>
              </template>
            </span>
            <span
              class="absolute -bottom-0.5 -end-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white transition group-hover:bg-blue-700"
              aria-hidden="true">
              <LearnIcon name="camera" class="h-4 w-4" />
            </span>
          </button>
          <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
            @change="onAvatar">
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900">{{ user.name }}</h1>
          <p class="mt-1 text-sm text-slate-600">
            โรงเรียน: {{ user.school_name || 'ยังไม่ได้ระบุโรงเรียน' }}<template v-if="user.school_province"> · จ.{{ user.school_province }}</template>
          </p>
          <p v-if="avatarMessage" class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold"
            :class="avatarError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'">
            {{ avatarMessage }}
          </p>
          <p v-else class="mt-2 text-xs text-slate-500">แตะที่รูปเพื่อเปลี่ยนรูปโปรไฟล์ (jpg, png หรือ webp ไม่เกิน 4
            MB)</p>

          <NuxtLink to="/orders" class="mt-3 inline-flex text-sm font-bold text-blue-700">ประวัติการสั่งซื้อ</NuxtLink>
        </div>
      </section>

      <form class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6" @submit.prevent="saveProfile">
        <h2 class="text-xl font-extrabold text-slate-900">แก้ไขโปรไฟล์</h2>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-semibold text-slate-700">
            ชื่อ-นามสกุล
            <input v-model="form.name" required maxlength="150"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ชื่อเล่น <span class="font-normal text-slate-400">(แสดงในห้องเรียนและอันดับคะแนน)</span>
            <input v-model="form.nickname" maxlength="30" placeholder="เช่น น้องเก่ง"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            อีเมล
            <input v-model="form.email" type="email" required
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            เบอร์โทร
            <input v-model="form.phone" type="tel" maxlength="30"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block scroll-mt-32 text-sm font-semibold text-slate-700"
            :class="highlightSchool ? 'rounded-2xl bg-amber-50 p-3 ring-2 ring-amber-300' : ''">
            โรงเรียน
            <input ref="schoolEl" v-model="form.school_name" maxlength="255" placeholder="เช่น โรงเรียนอนุบาลเชียงใหม่"
              class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <span v-if="highlightSchool" class="mt-1 block text-xs font-normal text-amber-700">กรอกชื่อโรงเรียน แล้วกด
              "บันทึกโปรไฟล์" ด้านล่าง</span>
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            จังหวัดที่เรียน
            <select v-model="form.school_province"
              class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              :class="form.school_province ? 'text-slate-800' : 'text-slate-400'">
              <option value="">เลือกจังหวัดที่โรงเรียนตั้งอยู่</option>
              <option v-for="province in thaiProvinces" :key="province" :value="province" class="text-slate-800">{{ province }}</option>
            </select>
          </label>

          <div class="mt-2 border-t border-slate-100 pt-4 sm:col-span-2">
            <h3 class="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <LearnIcon name="receipt" class="h-5 w-5 text-orange-500" />
              ข้อมูลที่อยู่
            </h3>
            <p class="mt-1 text-xs text-slate-500">สำหรับระบุในใบเสร็จรับเงิน และใช้เป็นที่อยู่จัดส่งหนังสือเริ่มต้น</p>
          </div>
          <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">
            ที่อยู่
            <input v-model="form.address_line1"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ตำบล/แขวง
            <input v-model="form.subdistrict"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            อำเภอ/เขต
            <input v-model="form.district"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            จังหวัด
            <input v-model="form.province"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            รหัสไปรษณีย์
            <input v-model="form.postal_code" inputmode="numeric" maxlength="5"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
        </div>
        <p v-if="profileError" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ profileError }}
        </p>
        <p v-if="profileSuccess" class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{
          profileSuccess }}</p>
        <button type="submit"
          class="mt-5 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300"
          :disabled="profilePending">
          {{ profilePending ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์' }}
        </button>
      </form>

      <section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
        <h2 class="text-xl font-extrabold text-slate-900">สิ่งที่กำลังเรียน</h2>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 class="text-sm font-bold text-slate-500">คอร์ส</h3>
            <p v-if="!classroom.courses.length" class="mt-2 text-sm text-slate-400">ยังไม่มีคอร์สที่เปิดสิทธิ์</p>
            <ul v-else class="mt-2 space-y-2">
              <li v-for="item in classroom.courses" :key="item.id">
                <NuxtLink :to="item.to"
                  class="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{{ item.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-500">หลักสูตร</h3>
            <p v-if="!classroom.curriculums.length" class="mt-2 text-sm text-slate-400">ยังไม่มีหลักสูตรที่เปิดสิทธิ์
            </p>
            <ul v-else class="mt-2 space-y-2">
              <li v-for="item in classroom.curriculums" :key="item.id">
                <NuxtLink :to="item.to"
                  class="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{{ item.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div class="md:col-span-2">
            <h3 class="text-sm font-bold text-slate-500">ข้อสอบ</h3>
            <p v-if="!classroom.exams.length" class="mt-2 text-sm text-slate-400">ยังไม่มีข้อสอบที่เปิดสิทธิ์</p>
            <ul v-else class="mt-2 space-y-2">
              <li v-for="item in classroom.exams" :key="item.id">
                <NuxtLink :to="item.to"
                  class="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{{ item.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <form class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6" @submit.prevent="savePassword">
        <h2 class="text-xl font-extrabold text-slate-900">เปลี่ยนรหัสผ่าน</h2>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">
            รหัสผ่านปัจจุบัน
            <input v-model="passwordForm.current" type="password" required autocomplete="current-password"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            รหัสผ่านใหม่
            <input v-model="passwordForm.next" type="password" required minlength="8" autocomplete="new-password"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ยืนยันรหัสผ่านใหม่
            <input v-model="passwordForm.confirm" type="password" required minlength="8" autocomplete="new-password"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
        </div>
        <p v-if="passwordError" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ passwordError }}
        </p>
        <p v-if="passwordSuccess" class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{
          passwordSuccess }}</p>
        <button type="submit"
          class="mt-5 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
          :disabled="passwordPending">
          {{ passwordPending ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน' }}
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'โปรไฟล์ | ClickClass Tutor' })

const { user, classroom, updateProfile, changePassword } = useAuth()

const form = reactive({
  name: '',
  nickname: '',
  email: '',
  phone: '',
  school_name: '',
  school_province: '',
  address_line1: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
})
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPending = ref(false)
const avatarMessage = ref('')
const avatarError = ref(false)
const previewUrl = ref('')
const filled = ref(false)
const profilePending = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const passwordPending = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordForm = reactive({ current: '', next: '', confirm: '' })

const initial = computed(() => (user.value?.name || 'น').trim().charAt(0))

const route = useRoute()
const schoolEl = ref<HTMLInputElement | null>(null)
const highlightSchool = computed(() => route.query.complete === 'school' && !user.value?.school_name?.trim())

watch(schoolEl, (element) => {
  if (!element || route.query.complete !== 'school') return
  element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  element.focus({ preventScroll: true })
})

watch(user, (value) => {
  if (!value || filled.value) return
  form.name = value.name
  form.nickname = value.nickname ?? ''
  form.email = value.email
  form.phone = value.phone ?? ''
  form.school_name = value.school_name ?? ''
  form.school_province = value.school_province ?? ''
  form.address_line1 = value.address?.address_line1 ?? ''
  form.subdistrict = value.address?.subdistrict ?? ''
  form.district = value.address?.district ?? ''
  form.province = value.address?.province ?? ''
  form.postal_code = value.address?.postal_code ?? ''
  filled.value = true
}, { immediate: true })

function clearPreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

async function onAvatar(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  const current = user.value
  if (!file || !current) return

  avatarMessage.value = ''
  avatarError.value = false
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    avatarError.value = true
    avatarMessage.value = 'ใช้ได้เฉพาะไฟล์ jpg, png หรือ webp'
    return
  }
  if (file.size > 4 * 1024 * 1024) {
    avatarError.value = true
    avatarMessage.value = 'รูปโปรไฟล์ต้องไม่เกิน 4 MB'
    return
  }

  clearPreview()
  previewUrl.value = URL.createObjectURL(file)
  avatarPending.value = true
  try {
    await updateProfile({
      name: current.name,
      email: current.email,
      phone: current.phone ?? null,
      school_name: current.school_name ?? null,
      address_line1: current.address?.address_line1 ?? null,
      subdistrict: current.address?.subdistrict ?? null,
      district: current.address?.district ?? null,
      province: current.address?.province ?? null,
      postal_code: current.address?.postal_code ?? null,
      avatar: file,
    })
    clearPreview()
    avatarMessage.value = 'เปลี่ยนรูปโปรไฟล์แล้ว'
  }
  catch (error: unknown) {
    clearPreview()
    avatarError.value = true
    avatarMessage.value = apiErrorMessage(error, 'เปลี่ยนรูปโปรไฟล์ไม่สำเร็จ')
  }
  finally {
    avatarPending.value = false
  }
}

onBeforeUnmount(clearPreview)

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  if (form.postal_code.trim() && !/^\d{5}$/.test(form.postal_code.trim())) {
    profileError.value = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
    return
  }
  profilePending.value = true
  try {
    await updateProfile({
      name: form.name.trim(),
      nickname: form.nickname.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      school_name: form.school_name.trim() || null,
      school_province: form.school_province || null,
      address_line1: form.address_line1.trim() || null,
      subdistrict: form.subdistrict.trim() || null,
      district: form.district.trim() || null,
      province: form.province.trim() || null,
      postal_code: form.postal_code.trim() || null,
    })
    profileSuccess.value = 'บันทึกโปรไฟล์แล้ว'
  }
  catch (error: unknown) {
    profileError.value = apiErrorMessage(error, 'บันทึกโปรไฟล์ไม่สำเร็จ')
  }
  finally {
    profilePending.value = false
  }
}

async function savePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (passwordForm.next !== passwordForm.confirm) {
    passwordError.value = 'รหัสผ่านใหม่ไม่ตรงกัน'
    return
  }

  passwordPending.value = true
  try {
    await changePassword(passwordForm.current, passwordForm.next)
    passwordForm.current = ''
    passwordForm.next = ''
    passwordForm.confirm = ''
    passwordSuccess.value = 'เปลี่ยนรหัสผ่านแล้ว'
  }
  catch (error: unknown) {
    passwordError.value = apiErrorMessage(error, 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
  }
  finally {
    passwordPending.value = false
  }
}
</script>
