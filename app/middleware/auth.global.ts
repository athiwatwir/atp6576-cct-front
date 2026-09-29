export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('student_token')
  const layout = to.meta.layout ?? 'default'
  const isPublic = layout === 'landing' || layout === false

  if (!isPublic && !token.value) {
    return navigateTo({
      path: '/signin',
      query: { redirect: to.fullPath },
    })
  }

  if ((to.path === '/signin' || to.path === '/signup') && token.value) {
    return navigateTo('/home')
  }
})
