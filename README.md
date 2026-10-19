# atp6576-cct-front

Nuxt storefront for ClickClass Tutor, styled with Tailwind CSS v4.

Public pages use `app/layouts/landing.vue`. Signed-in pages such as the classroom and profile use `app/layouts/default.vue`, which adds the same header and footer.

## Setup

```bash
npm install
cp .env.example .env   # then fill in NUXT_PUBLIC_API_KEY (same value as STOREFRONT_API_KEY in the backend)
npm run dev
```

The dev server runs at `http://localhost:3000`.
