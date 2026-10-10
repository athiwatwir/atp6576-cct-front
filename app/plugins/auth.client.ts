export default defineNuxtPlugin(() => {
  const { loggedIn, fetchUser } = useAuth()
  if (loggedIn.value) fetchUser()
})
