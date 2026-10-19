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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api/v1',
      apiKey: process.env.NUXT_PUBLIC_API_KEY || '',
      bankName: process.env.NUXT_PUBLIC_BANK_NAME || '',
      bankAccountName: process.env.NUXT_PUBLIC_BANK_ACCOUNT_NAME || '',
      bankAccountNumber: process.env.NUXT_PUBLIC_BANK_ACCOUNT_NUMBER || '',
    },
  },
})
