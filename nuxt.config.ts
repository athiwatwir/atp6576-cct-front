import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // TailAdmin free is a client dashboard (charts, calendar, maps).
  ssr: false,
  css: [
    '~/assets/css/main.css',
    'flatpickr/dist/flatpickr.css',
    'jsvectormap/dist/jsvectormap.css',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  components: [
    { path: '~/components/common', pathPrefix: false },
    { path: '~/components/forms/FormElements', pathPrefix: false },
    { path: '~/components/layout', pathPrefix: false },
    { path: '~/components/ecommerce', pathPrefix: false },
    { path: '~/components/charts', pathPrefix: false },
    { path: '~/components/tables', pathPrefix: false },
    {
      path: '~/components/profile',
      pathPrefix: false,
      ignore: ['**/Modal.vue'],
    },
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/student', pathPrefix: false },
    { path: '~/components/landing', pathPrefix: false },
  ],
  app: {
    head: {
      title: 'ClickClass Tutor',
      htmlAttrs: { lang: 'th' },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:8000/api/v1',
    },
  },
})
