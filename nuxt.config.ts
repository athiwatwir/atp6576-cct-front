import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  spaLoadingTemplate: true,
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
      title: 'ClickClass Tutor | เรียนออนไลน์ ติวสอบเข้า ม.1 และ ม.4 มหาลัย คอร์สบุฟเฟต์',
      htmlAttrs: { lang: 'th' },
      meta: [
        {
          name: 'description',
          content: 'เตรียมสอบเข้า ม.1 และ ม.4 มหาลัย และเรียนเนื้อหาชั้นป.1-ม.6 โรงเรียนดังทั่วประเทศกับคอร์สเรียนออนไลน์แบบบุฟเฟต์ ดูคลิปไม่จำกัด เรียนได้ทุกที่ พร้อมแนวข้อสอบเสมือนจริงและการวัดผลที่เข้มข้น!',
        },
        { property: 'og:site_name', content: 'ClickClass Tutor' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'ClickClass Tutor | เรียนออนไลน์ ติวสอบเข้า ม.1 และ ม.4 มหาลัย คอร์สบุฟเฟต์' },
        {
          property: 'og:description',
          content: 'เตรียมสอบเข้า ม.1 และ ม.4 มหาลัย และเรียนเนื้อหาชั้นป.1-ม.6 โรงเรียนดังทั่วประเทศกับคอร์สเรียนออนไลน์แบบบุฟเฟต์ ดูคลิปไม่จำกัด เรียนได้ทุกที่ พร้อมแนวข้อสอบเสมือนจริงและการวัดผลที่เข้มข้น!',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        {
          tagPosition: 'head',
          innerHTML: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });`,
        },
        { src: 'https://www.googletagmanager.com/gtm.js?id=GTM-TQ5G4PD7', async: true, tagPosition: 'head' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      //apiBase: 'https://office.clickclasstutor.com/api/v1',
      apiBase: 'http://127.0.0.1:8000/api/v1',
      apiKey: '1304ebc02370f094348c732aef05321bc520ee2d966a697215067a6c29493513',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
    },
  },
})
