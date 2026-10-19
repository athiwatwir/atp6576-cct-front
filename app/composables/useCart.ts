export interface NamedRef {
  id: number
  name: string
  slug: string
}

export interface StoreBook {
  id: number
  code: string
  slug: string
  name: string
  description?: string | null
  thumbnail_url: string | null
  images?: string[]
  video_url?: string | null
  price: number
  sale_price: number | null
  effective_price: number
  stock: number | null
  in_stock: boolean
  purchased?: boolean
}

export type CartItemType = 'course' | 'curriculum' | 'exam' | 'book'

export interface VideoWatchProgress {
  status: 'unwatched' | 'in_progress' | 'completed'
  position_seconds: number
  progress_percent: number
  last_watched_at: string | null
}

export interface CourseVideo {
  id: number
  title: string
  description?: string | null
  duration_seconds?: number | null
  is_trial: boolean
  video_url: string | null
  progress?: VideoWatchProgress
}

export interface CourseDocument {
  id: number
  title: string
  description?: string | null
  file_name?: string | null
  file_size?: number | null
  is_trial: boolean
  file_url: string | null
}

export interface CourseExam {
  id: number
  name: string
  slug: string
  description?: string | null
  duration_minutes?: number | null
  question_count?: number
  chapter_id?: number | null
}

export interface CourseChapter {
  id: number
  title: string
  description?: string | null
  videos: CourseVideo[]
  documents?: CourseDocument[]
  exams?: CourseExam[]
}

export interface CatalogCourseRef {
  id: number
  name: string
  slug: string
  thumbnail_url: string | null
}

export interface PricePlan {
  id: number
  name: string
  duration_days: number | null
  price: number
  sale_price: number | null
  effective_price: number
}

export interface CatalogItem {
  item_type: 'course' | 'curriculum' | 'exam'
  id: number
  code: string | null
  slug: string
  name: string
  short_description?: string | null
  description?: string | null
  thumbnail_url: string | null
  price: number
  sale_price: number | null
  effective_price: number
  price_plans?: PricePlan[]
  is_featured?: boolean
  purchased?: boolean
  access_expires_at?: string | null
  category?: NamedRef | null
  subject?: NamedRef | null
  instructor?: NamedRef | null
  chapter_count?: number | null
  course_count?: number | null
  duration_minutes?: number | null
  question_count?: number | null
  is_trial_available?: boolean | null
  courses?: CatalogCourseRef[]
  chapters?: CourseChapter[]
  exams?: CourseExam[]
}

export interface CartLine {
  type: CartItemType
  id: number
  slug: string
  name: string
  thumbnail_url: string | null
  unit_price: number
  quantity: number
  stock: number | null
  plan_id?: number | null
  plans?: PricePlan[]
}

export interface CheckoutItemInput {
  type: CartItemType
  id: number
  quantity: number
  plan_id?: number
}

const STORAGE_KEY = 'cct-cart'
let noticeTimer = 0

export function planDurationLabel(plan: Pick<PricePlan, 'duration_days'>) {
  return plan.duration_days ? `ใช้งานได้ ${plan.duration_days} วันหลังชำระ` : 'ใช้งานได้ไม่จำกัดเวลา'
}

export function hasPlanChoice(item: Pick<CatalogItem, 'price_plans'>) {
  return (item.price_plans?.length ?? 0) > 1
}

export function canRenew(item: Pick<CatalogItem, 'purchased' | 'access_expires_at'>) {
  return Boolean(item.purchased && item.access_expires_at)
}

export function selectedPlan(line: Pick<CartLine, 'plan_id' | 'plans'>) {
  return line.plans?.find(plan => plan.id === line.plan_id) ?? null
}

function lineLimit(stock: number | null) {
  return Math.min(stock ?? 99, 99)
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const item = value as CartLine
  return (item.type === 'book' || item.type === 'course' || item.type === 'curriculum' || item.type === 'exam')
    && Number.isInteger(item.id)
    && typeof item.name === 'string'
    && typeof item.unit_price === 'number'
    && Number.isInteger(item.quantity)
    && item.quantity > 0
}

export function useCart() {
  const items = useState<CartLine[]>('cart-items', () => [])
  const notice = useState<string | null>('cart-notice', () => null)
  const hydrated = useState('cart-hydrated', () => false)
  const watching = useState('cart-watching', () => false)

  if (import.meta.client && !hydrated.value) {
    hydrated.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) as unknown : []
      items.value = Array.isArray(parsed)
        ? parsed.filter(isCartLine).map(item => ({
            ...item,
            quantity: item.type === 'book' ? Math.min(item.quantity, lineLimit(item.stock)) : 1,
            stock: item.type === 'book' ? item.stock : null,
          }))
        : []
    }
    catch {
      items.value = []
    }
  }

  if (import.meta.client && !watching.value) {
    watching.value = true
    watch(items, (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    }, { deep: true })
  }

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.unit_price * item.quantity, 0))
  const couponCode = useState('cart-coupon', () => '')

  function quantityOf(type: CartItemType, id: number) {
    return items.value.find(item => item.type === type && item.id === id)?.quantity ?? 0
  }

  function canAdd(book: StoreBook) {
    if (!book.in_stock) return false
    if (book.stock !== null && book.stock <= 0) return false
    return quantityOf('book', book.id) < lineLimit(book.stock)
  }

  function notify(message: string) {
    notice.value = message
    window.clearTimeout(noticeTimer)
    noticeTimer = window.setTimeout(() => {
      notice.value = null
    }, 2800)
  }

  function addBook(book: StoreBook) {
    if (!canAdd(book)) {
      notify(book.in_stock ? 'จำนวนในตะกร้าเต็มแล้ว' : 'สินค้าหมด')
      return
    }

    const existing = items.value.find(item => item.type === 'book' && item.id === book.id)
    const max = lineLimit(book.stock)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, max)
      existing.unit_price = book.effective_price
      existing.name = book.name
      existing.thumbnail_url = book.thumbnail_url
      existing.stock = book.stock
    }
    else {
      items.value.push({
        type: 'book',
        id: book.id,
        slug: book.slug,
        name: book.name,
        thumbnail_url: book.thumbnail_url,
        unit_price: book.effective_price,
        quantity: 1,
        stock: book.stock,
      })
    }
    notify(`ใส่ «${book.name}» ในตะกร้าแล้ว`)
  }

  function planOf(type: CartItemType, id: number) {
    return items.value.find(line => line.type === type && line.id === id)?.plan_id ?? null
  }

  function addCatalog(item: CatalogItem, planId?: number | null) {
    const plans = item.price_plans ?? []
    const plan = plans.find(entry => entry.id === planId) ?? (plans.length === 1 ? plans[0] : undefined)
    if (plans.length > 1 && !plan) {
      notify(`กรุณาเลือกแพ็กเกจของ «${item.name}»`)
      return false
    }

    const unitPrice = plan?.effective_price ?? item.effective_price
    const existing = items.value.find(line => line.type === item.item_type && line.id === item.id)
    if (existing) {
      const changed = (existing.plan_id ?? null) !== (plan?.id ?? null)
      existing.unit_price = unitPrice
      existing.name = item.name
      existing.thumbnail_url = item.thumbnail_url
      existing.plan_id = plan?.id ?? null
      existing.plans = plans
      notify(changed ? `เปลี่ยน «${item.name}» เป็น ${plan?.name} แล้ว` : `«${item.name}» อยู่ในตะกร้าแล้ว`)
      return true
    }
    items.value.push({
      type: item.item_type,
      id: item.id,
      slug: item.slug,
      name: item.name,
      thumbnail_url: item.thumbnail_url,
      unit_price: unitPrice,
      quantity: 1,
      stock: null,
      plan_id: plan?.id ?? null,
      plans,
    })
    notify(`ใส่ «${item.name}»${plan && plans.length > 1 ? ` (${plan.name})` : ''} ในตะกร้าแล้ว`)
    return true
  }

  function setPlan(type: CartItemType, id: number, planId: number | null) {
    const line = items.value.find(entry => entry.type === type && entry.id === id)
    if (!line) return
    line.plan_id = planId
    const plan = selectedPlan(line)
    if (plan) line.unit_price = plan.effective_price
  }

  function checkoutItems(): CheckoutItemInput[] {
    return items.value.map(item => ({
      type: item.type,
      id: item.id,
      quantity: item.quantity,
      ...(item.type !== 'book' && item.plan_id ? { plan_id: item.plan_id } : {}),
    }))
  }

  async function syncCatalogLines() {
    if (!items.value.some(item => item.type !== 'book')) return
    const { fetchAll } = useStorefront()
    const response = await fetchAll<CatalogItem>('/catalog', { type: 'course,curriculum,exam' })
    const byKey = new Map(response.data.map(entry => [`${entry.item_type}-${entry.id}`, entry]))
    for (const line of items.value) {
      if (line.type === 'book') continue
      const fresh = byKey.get(`${line.type}-${line.id}`)
      if (!fresh) continue
      const plans = fresh.price_plans ?? []
      line.name = fresh.name
      line.slug = fresh.slug
      line.thumbnail_url = fresh.thumbnail_url
      line.plans = plans
      if (line.plan_id && !plans.some(plan => plan.id === line.plan_id)) line.plan_id = null
      if (!line.plan_id && plans.length === 1) line.plan_id = plans[0]!.id
      line.unit_price = selectedPlan(line)?.effective_price ?? fresh.effective_price
    }
  }

  function setQuantity(type: CartItemType, id: number, quantity: number) {
    const item = items.value.find(line => line.type === type && line.id === id)
    if (!item) return
    if (quantity < 1) {
      remove(type, id)
      return
    }
    item.quantity = item.type === 'book' ? Math.min(quantity, lineLimit(item.stock)) : 1
  }

  function remove(type: CartItemType, id: number) {
    items.value = items.value.filter(item => !(item.type === type && item.id === id))
  }

  function clear() {
    items.value = []
    couponCode.value = ''
  }

  return { items, notice, count, subtotal, couponCode, quantityOf, planOf, canAdd, addBook, addCatalog, setPlan, checkoutItems, syncCatalogLines, setQuantity, remove, clear }
}
