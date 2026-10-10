export function apiErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } }).data
  const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
  return first || data?.message || fallback
}

export function apiStatus(error: unknown) {
  const record = error as { statusCode?: number, status?: number }
  return record.statusCode ?? record.status
}
