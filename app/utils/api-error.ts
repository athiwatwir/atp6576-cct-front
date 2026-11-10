export function apiErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } }).data
  const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
  return first || data?.message || fallback
}

/** ข้อความ error ของฟิลด์เดียวจาก 422 เช่น coupon_code ไม่มีคืนค่าว่าง */
export function apiFieldError(error: unknown, field: string) {
  const errors = (error as { data?: { errors?: Record<string, string[]> } }).data?.errors
  return errors?.[field]?.[0] ?? ''
}

export function apiStatus(error: unknown) {
  const record = error as { statusCode?: number, status?: number }
  return record.statusCode ?? record.status
}
