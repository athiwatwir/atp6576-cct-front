<template>
  <a :href="contactInfo.lineUrl" target="_blank" rel="noopener"
    class="support-chat group fixed bottom-5 end-4 z-40 flex items-end gap-2 sm:bottom-6 sm:end-6"
    :aria-label="`แชทกับทีมซัพพอร์ตทาง LINE ${contactInfo.lineId}`">
    <span
      class="mb-3 hidden rounded-2xl rounded-ee-sm bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-lg ring-1 ring-slate-100 transition group-hover:-translate-y-0.5 sm:block">
      สงสัยตรงไหน แชทกับเราได้เลย

    </span>
    <span class="relative block h-16 w-16 sm:h-20 sm:w-20">
      <span class="support-chat__ring absolute inset-0 rounded-full bg-[#06C755]/40" aria-hidden="true" />
      <span
        class="support-chat__bubble relative block h-full w-full overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-[#06C755] transition group-hover:scale-105">
        <img src="/images/support.webp" alt="" class="h-full w-full object-cover" width="240" height="240"
          loading="lazy">
      </span>
      <span
        class="absolute -end-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#06C755] px-1.5 text-[10px] font-extrabold text-white shadow ring-2 ring-white"
        aria-hidden="true">
        LINE
      </span>
    </span>
  </a>
</template>

<style scoped>
.support-chat__bubble {
  animation: support-wiggle 4s ease-in-out infinite;
  transform-origin: 50% 90%;
}

.support-chat__ring {
  animation: support-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.support-chat:hover .support-chat__bubble,
.support-chat:focus-visible .support-chat__bubble {
  animation-duration: 0.9s;
}

@keyframes support-wiggle {

  0%,
  70%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  74% {
    transform: rotate(-12deg) scale(1.06);
  }

  78% {
    transform: rotate(10deg) scale(1.06);
  }

  82% {
    transform: rotate(-8deg) scale(1.04);
  }

  86% {
    transform: rotate(6deg) scale(1.02);
  }

  90% {
    transform: rotate(-3deg);
  }
}

@keyframes support-ping {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  80%,
  100% {
    transform: scale(1.45);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {

  .support-chat__bubble,
  .support-chat__ring {
    animation: none;
  }
}
</style>
