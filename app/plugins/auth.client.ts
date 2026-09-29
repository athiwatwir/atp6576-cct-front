export default defineNuxtPlugin(async () => {
  const { loggedIn, fetchUser } = useAuth()
  if (loggedIn.value) await fetchUser()
})
