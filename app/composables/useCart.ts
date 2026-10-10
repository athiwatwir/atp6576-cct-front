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

export type CartItemType = 'course' | 'curriculum' | 'book'

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
  is_featured?: boolean
  purchased?: boolean
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
}

const STORAGE_KEY = 'cct-cart'
let noticeTimer = 0

function lineLimit(stock: number | null) {
  return Math.min(stock ?? 99, 99)
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const item = value as CartLine
  return (item.type === 'book' || item.type === 'course' || item.type === 'curriculum')
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

  function addCatalog(item: CatalogItem) {
    if (item.item_type === 'exam') {
      notify('ข้อสอบยังไม่เปิดให้สั่งซื้อ')
      return
    }
    const existing = items.value.find(line => line.type === item.item_type && line.id === item.id)
    if (existing) {
      existing.unit_price = item.effective_price
      existing.name = item.name
      existing.thumbnail_url = item.thumbnail_url
      notify(`«${item.name}» อยู่ในตะกร้าแล้ว`)
      return
    }
    items.value.push({
      type: item.item_type,
      id: item.id,
      slug: item.slug,
      name: item.name,
      thumbnail_url: item.thumbnail_url,
      unit_price: item.effective_price,
      quantity: 1,
      stock: null,
    })
    notify(`ใส่ «${item.name}» ในตะกร้าแล้ว`)
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

  return { items, notice, count, subtotal, couponCode, quantityOf, canAdd, addBook, addCatalog, setQuantity, remove, clear }
}
