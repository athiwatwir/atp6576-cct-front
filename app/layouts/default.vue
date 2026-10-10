<template>
  <div class="flex min-h-screen flex-col bg-[#f7fbff] text-slate-800">
    <LandingHeader />
    <EmailVerifyBanner />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
      <slot />
    </main>
    <LandingFooter />
    <CartNotice />
  </div>
</template>
