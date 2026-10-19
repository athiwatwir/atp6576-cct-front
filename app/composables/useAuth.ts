export interface StudentAddress {
  address_line1?: string | null
  subdistrict?: string | null
  district?: string | null
  province?: string | null
  postal_code?: string | null
}

export interface LearningItem {
  id: number
  name: string
  slug: string
  thumbnail_url?: string | null
  expires_at?: string | null
}

export interface ClassroomItem extends LearningItem {
  kind: 'course' | 'curriculum' | 'exam'
  kindLabel: string
  to: string
}

export interface StudentUser {
  id: number
  name: string
  email: string
  phone?: string | null
  school_name?: string | null
  address?: StudentAddress | null
  avatar_url?: string | null
  status?: string
  status_label?: string
  email_verified?: boolean
  learning?: {
    courses: LearningItem[]
    curriculums: LearningItem[]
    exams?: LearningItem[]
  }
}

export interface ProfileInput {
  name: string
  email: string
  phone?: string | null
  school_name?: string | null
  address_line1?: string | null
  subdistrict?: string | null
  district?: string | null
  province?: string | null
  postal_code?: string | null
  avatar?: File | null
}

interface AuthResponse {
  token: string
  token_type: string
  user: StudentUser
}

let profileRequest: Promise<void> | null = null

export function useAuth() {
  const token = useCookie<string | null>('student_token', {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  const user = useState<StudentUser | null>('auth-user', () => null)
  const verifyNotice = useState<string | null>('email-verify-notice', () => null)
  const loggedIn = computed(() => Boolean(token.value))

  function asClassroom(items: LearningItem[] | undefined, kind: ClassroomItem['kind'], kindLabel: string, prefix: string): ClassroomItem[] {
    return (items ?? []).map(item => ({
      ...item,
      kind,
      kindLabel,
      to: `${prefix}/${item.slug}`,
    }))
  }

  const classroom = computed(() => {
    const learning = user.value?.learning
    const courses = asClassroom(learning?.courses, 'course', 'คอร์ส', '/learn')
    const curriculums = asClassroom(learning?.curriculums, 'curriculum', 'หลักสูตร', '/learn/curriculums')
    const exams = asClassroom(learning?.exams, 'exam', 'ข้อสอบ', '/exams')

    return {
      courses,
      curriculums,
      exams,
      items: [...courses, ...curriculums, ...exams],
    }
  })

  function fetchUser() {
    if (!token.value) {
      user.value = null
      return Promise.resolve()
    }
    if (profileRequest) return profileRequest

    const { api } = useApi()
    profileRequest = api<{ data: StudentUser }>('/profile')
      .then((response) => {
        user.value = response.data
      })
      .catch((error: unknown) => {
        const status = (error as { statusCode?: number, status?: number }).statusCode
          ?? (error as { status?: number }).status
        if (status === 401 || status === 403) {
          token.value = null
          user.value = null
        }
      })
      .finally(() => {
        profileRequest = null
      })

    return profileRequest
  }

  async function login(email: string, password: string) {
    const { api } = useApi()
    const response = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    token.value = response.token
    user.value = response.user
  }

  async function register(payload: {
    name: string
    email: string
    password: string
    phone?: string
  }) {
    const { api } = useApi()
    const response = await api<{ message?: string, email?: string, token?: string, user?: StudentUser }>('/auth/register', {
      method: 'POST',
      body: {
        ...payload,
        password_confirmation: payload.password,
      },
    })
    const email = response.email || payload.email
    const message = response.message || 'สมัครสมาชิกแล้ว กรุณายืนยันอีเมลจากลิงก์ที่เราส่งให้'

    if (response.token) {
      token.value = response.token
      user.value = response.user ?? null
    }
    else {
      try {
        await login(payload.email, payload.password)
      }
      catch (error: unknown) {
        if (apiStatus(error) === 403) {
          verifyNotice.value = apiErrorMessage(error, message)
          return { email, message: verifyNotice.value, loggedIn: false }
        }
        throw error
      }
    }

    if (user.value?.email_verified === false) verifyNotice.value = message
    return { email, message, loggedIn: true }
  }

  async function resendVerification(email: string) {
    const { api } = useApi()
    const response = await api<{ message: string }>('/auth/email/resend', {
      method: 'POST',
      body: { email },
    })
    return response.message
  }

  async function updateProfile(payload: ProfileInput) {
    const { api } = useApi()
    if (payload.avatar) {
      const form = new FormData()
      form.set('name', payload.name)
      form.set('email', payload.email)
      form.set('phone', payload.phone ?? '')
      form.set('school_name', payload.school_name ?? '')
      form.set('address_line1', payload.address_line1 ?? '')
      form.set('subdistrict', payload.subdistrict ?? '')
      form.set('district', payload.district ?? '')
      form.set('province', payload.province ?? '')
      form.set('postal_code', payload.postal_code ?? '')
      form.set('avatar', payload.avatar)
      await api('/profile', { method: 'POST', body: form })
    }
    else {
      await api('/profile', {
        method: 'PUT',
        body: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          school_name: payload.school_name || null,
          address_line1: payload.address_line1 || null,
          subdistrict: payload.subdistrict || null,
          district: payload.district || null,
          province: payload.province || null,
          postal_code: payload.postal_code || null,
        },
      })
    }
    await fetchUser()
  }

  async function changePassword(currentPassword: string, password: string) {
    const { api } = useApi()
    await api('/profile/password', {
      method: 'PUT',
      body: {
        current_password: currentPassword,
        password,
        password_confirmation: password,
      },
    })
  }

  async function logout() {
    const { api } = useApi()
    try {
      if (token.value) await api('/auth/logout', { method: 'POST' })
    }
    catch {
      // Clear the local session even if the server token is already gone.
    }
    token.value = null
    user.value = null
    verifyNotice.value = null
    await navigateTo('/')
  }

  return { token, user, verifyNotice, loggedIn, classroom, fetchUser, login, register, resendVerification, updateProfile, changePassword, logout }
}
