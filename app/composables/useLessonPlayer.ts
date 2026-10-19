import type { CourseChapter, CourseVideo, VideoWatchProgress } from '@/composables/useCart'

export type WatchStatus = VideoWatchProgress['status']

const emptyProgress: VideoWatchProgress = { status: 'unwatched', position_seconds: 0, progress_percent: 0, last_watched_at: null }

export function lessonClock(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const remain = total % 60
  if (minutes === 0) return `${remain} วินาที`
  if (remain === 0) return `${minutes} นาที`
  return `${minutes} นาที ${remain} วินาที`
}

export function watchStatusLabel(status: WatchStatus) {
  if (status === 'completed') return 'ผ่านแล้ว'
  if (status === 'in_progress') return 'ดูแล้ว'
  return 'ยังไม่ได้ดู'
}

export function watchStatusClass(status: WatchStatus) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'in_progress') return 'bg-sky-100 text-sky-700'
  return 'bg-slate-200 text-slate-500'
}

export function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function useLessonPlayer(courseSlug: () => string) {
  const { api } = useApi()
  const { loggedIn } = useAuth()
  const activeVideo = ref<CourseVideo | null>(null)
  const playerEl = ref<HTMLVideoElement | null>(null)
  const resumedLabel = ref('')
  const savedProgress = reactive<Record<number, VideoWatchProgress>>({})
  let lastSentAt = 0
  let saveChain: Promise<void> = Promise.resolve()

  function watchOf(video: CourseVideo): VideoWatchProgress {
    return savedProgress[video.id] ?? video.progress ?? emptyProgress
  }

  function chapterStatus(chapter: CourseChapter): WatchStatus {
    if (!chapter.videos.length) return 'unwatched'
    const statuses = chapter.videos.map(video => watchOf(video).status)
    if (statuses.every(status => status === 'completed')) return 'completed'
    if (statuses.every(status => status === 'unwatched')) return 'unwatched'
    return 'in_progress'
  }

  function barPercent(video: CourseVideo) {
    const progress = watchOf(video)
    if (progress.status === 'completed') return 100
    return Math.min(100, Math.max(0, progress.progress_percent))
  }

  function play(video: CourseVideo | null | undefined) {
    if (!video?.video_url) return
    flushProgress(false)
    resumedLabel.value = ''
    lastSentAt = 0
    activeVideo.value = video
  }

  function resume(event: Event) {
    const player = event.target as HTMLVideoElement
    const video = activeVideo.value
    if (!video) return
    const progress = watchOf(video)
    if (progress.status !== 'in_progress' || progress.position_seconds < 5) return
    const max = Number.isFinite(player.duration) ? Math.max(0, player.duration - 1) : progress.position_seconds
    player.currentTime = Math.min(progress.position_seconds, max)
    resumedLabel.value = `เล่นต่อจาก ${lessonClock(player.currentTime)}`
  }

  function onTimeUpdate(event: Event) {
    const player = event.target as HTMLVideoElement
    if (!player.duration) return
    const ratio = player.currentTime / player.duration
    const now = Date.now()
    if (ratio >= 0.9) {
      if (now - lastSentAt < 3000) return
      lastSentAt = now
      void persist(player.currentTime, player.duration, true)
      return
    }
    if (now - lastSentAt < 10000) return
    lastSentAt = now
    void persist(player.currentTime, player.duration, false)
  }

  function flushProgress(completed: boolean) {
    const player = playerEl.value
    if (!player || !activeVideo.value?.video_url) return
    void persist(player.currentTime, player.duration || 0, completed)
  }

  function persist(position: number, duration: number, completed: boolean) {
    const video = activeVideo.value
    const slug = courseSlug()
    if (!loggedIn.value || !video || !slug) return Promise.resolve()
    if (!completed && position < 3) return Promise.resolve()

    const body = {
      position_seconds: Math.max(0, Math.floor(position)),
      duration_seconds: Math.max(0, Math.floor(duration)),
      completed,
    }

    saveChain = saveChain.then(async () => {
      try {
        const response = await api<{ data: VideoWatchProgress }>(`/courses/${slug}/videos/${video.id}/progress`, {
          method: 'PUT',
          body,
        })
        savedProgress[video.id] = response.data
      }
      catch {
        // Keep playback going when a progress save fails.
      }
    })

    return saveChain
  }

  onUnmounted(() => {
    flushProgress(false)
  })

  return {
    activeVideo,
    playerEl,
    resumedLabel,
    watchOf,
    chapterStatus,
    barPercent,
    play,
    resume,
    onTimeUpdate,
    flushProgress,
  }
}
