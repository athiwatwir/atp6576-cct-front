import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    vue: {
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    },
  },
  components: [
    { path: '~/components/landing', pathPrefix: false },
    { path: '~/components/layout', pathPrefix: false },
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
      apiBase: 'https://office.clickclasstutor.com/api/v1',
      apiKey: '1304ebc02370f094348c732aef05321bc520ee2d966a697215067a6c29493513',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
    },
  },
})
