<template>
  <div class="space-y-6">
    <p v-if="!user" class="text-sm text-slate-500">กำลังโหลดโปรไฟล์...</p>

    <template v-else>
      <section class="flex flex-col gap-4 rounded-[2rem] bg-gradient-to-r from-sky-100 to-blue-50 p-6 sm:flex-row sm:items-center">
        <span class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-extrabold text-blue-700 shadow-sm">
          <img v-if="previewUrl || user.avatar_url" :src="previewUrl || user.avatar_url || ''" alt="" class="h-full w-full object-cover">
          <span v-else>{{ initial }}</span>
        </span>
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900">{{ user.name }}</h1>
          <p class="mt-1 text-sm text-slate-600">{{ user.school_name || 'ยังไม่ได้ระบุโรงเรียน' }}</p>
          <p v-if="user.status_label" class="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">{{ user.status_label }}</p>
          <NuxtLink to="/orders" class="mt-3 inline-flex text-sm font-bold text-blue-700">ประวัติการสั่งซื้อ</NuxtLink>
        </div>
      </section>

      <form class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6" @submit.prevent="saveProfile">
        <h2 class="text-xl font-extrabold text-slate-900">แก้ไขโปรไฟล์</h2>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">
            รูปโปรไฟล์
            <input type="file" accept="image/jpeg,image/png,image/webp" class="mt-1 block w-full text-sm font-normal" @change="onAvatar">
            <span class="mt-1 block text-xs font-normal text-slate-400">jpg, png หรือ webp ไม่เกิน 4 MB</span>
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ชื่อ-นามสกุล
            <input v-model="form.name" required maxlength="150" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            อีเมล
            <input v-model="form.email" type="email" required class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            เบอร์โทร
            <input v-model="form.phone" type="tel" maxlength="30" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            โรงเรียน
            <input v-model="form.school_name" maxlength="255" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">
            ที่อยู่
            <input v-model="form.address_line1" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ตำบล/แขวง
            <input v-model="form.subdistrict" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            อำเภอ/เขต
            <input v-model="form.district" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            จังหวัด
            <input v-model="form.province" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            รหัสไปรษณีย์
            <input v-model="form.postal_code" inputmode="numeric" maxlength="5" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
        </div>
        <p v-if="profileError" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ profileError }}</p>
        <p v-if="profileSuccess" class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ profileSuccess }}</p>
        <button
          type="submit"
          class="mt-5 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300"
          :disabled="profilePending"
        >
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
                <NuxtLink :to="item.to" class="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{{ item.name }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-500">หลักสูตร</h3>
            <p v-if="!classroom.curriculums.length" class="mt-2 text-sm text-slate-400">ยังไม่มีหลักสูตรที่เปิดสิทธิ์</p>
            <ul v-else class="mt-2 space-y-2">
              <li v-for="item in classroom.curriculums" :key="item.id">
                <NuxtLink :to="item.to" class="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{{ item.name }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div class="md:col-span-2">
            <h3 class="text-sm font-bold text-slate-500">ข้อสอบ</h3>
            <p v-if="!classroom.exams.length" class="mt-2 text-sm text-slate-400">ยังไม่มีข้อสอบที่เปิดสิทธิ์</p>
            <ul v-else class="mt-2 space-y-2">
              <li v-for="item in classroom.exams" :key="item.id">
                <NuxtLink :to="item.to" class="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{{ item.name }}</NuxtLink>
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
            <input v-model="passwordForm.current" type="password" required autocomplete="current-password" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            รหัสผ่านใหม่
            <input v-model="passwordForm.next" type="password" required minlength="8" autocomplete="new-password" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            ยืนยันรหัสผ่านใหม่
            <input v-model="passwordForm.confirm" type="password" required minlength="8" autocomplete="new-password" class="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
          </label>
        </div>
        <p v-if="passwordError" class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ passwordSuccess }}</p>
        <button
          type="submit"
          class="mt-5 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
          :disabled="passwordPending"
        >
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
  email: '',
  phone: '',
  school_name: '',
  address_line1: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
})
const avatar = ref<File | null>(null)
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

watch(user, (value) => {
  if (!value || filled.value) return
  form.name = value.name
  form.email = value.email
  form.phone = value.phone ?? ''
  form.school_name = value.school_name ?? ''
  form.address_line1 = value.address?.address_line1 ?? ''
  form.subdistrict = value.address?.subdistrict ?? ''
  form.district = value.address?.district ?? ''
  form.province = value.address?.province ?? ''
  form.postal_code = value.address?.postal_code ?? ''
  filled.value = true
}, { immediate: true })

function onAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  avatar.value = file
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file ? URL.createObjectURL(file) : ''
}

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  if (form.postal_code.trim() && !/^\d{5}$/.test(form.postal_code.trim())) {
    profileError.value = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
    return
  }
  if (avatar.value && avatar.value.size > 4 * 1024 * 1024) {
    profileError.value = 'รูปโปรไฟล์ต้องไม่เกิน 4 MB'
    return
  }

  profilePending.value = true
  try {
    await updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      school_name: form.school_name.trim() || null,
      address_line1: form.address_line1.trim() || null,
      subdistrict: form.subdistrict.trim() || null,
      district: form.district.trim() || null,
      province: form.province.trim() || null,
      postal_code: form.postal_code.trim() || null,
      avatar: avatar.value,
    })
    avatar.value = null
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
