export interface StudentUser {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar_url?: string | null
  status?: string
  status_label?: string
  learning?: {
    courses: { id: number, name: string, slug: string }[]
    curriculums: { id: number, name: string, slug: string }[]
  }
}

interface AuthResponse {
  token: string
  token_type: string
  user: StudentUser
}

export function useAuth() {
  const token = useCookie<string | null>('student_token', {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  const user = useState<StudentUser | null>('auth-user', () => null)
  const loggedIn = computed(() => Boolean(token.value))

  async function fetchUser() {
    if (!token.value) {
      user.value = null
      return
    }

    const { api } = useApi()
    try {
      const response = await api<{ data: StudentUser }>('/profile')
      user.value = response.data
    }
    catch (error: unknown) {
      const status = (error as { statusCode?: number, status?: number }).statusCode
        ?? (error as { status?: number }).status
      if (status === 401 || status === 403) {
        token.value = null
        user.value = null
      }
    }
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
    const response = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: {
        ...payload,
        password_confirmation: payload.password,
      },
    })
    token.value = response.token
    user.value = response.user
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
    await navigateTo('/')
  }

  return { token, user, loggedIn, fetchUser, login, register, logout }
}
