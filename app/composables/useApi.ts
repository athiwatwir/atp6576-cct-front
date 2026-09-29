export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('student_token', {
    sameSite: 'lax',
    path: '/',
  })

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const headers = new Headers(options.headers)
      headers.set('Accept', 'application/json')
      if (token.value) headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    },
  })

  return { api, token }
}
