export interface StudentNavItem {
  label: string
  to: string
  icon: 'home' | 'course' | 'subject' | 'exam' | 'book' | 'activity' | 'reward' | 'promo'
}

export const studentNav: StudentNavItem[] = [
  { label: 'หน้าหลัก', to: '/home', icon: 'home' },
  { label: 'คอร์สเรียน', to: '/courses', icon: 'course' },
  { label: 'วิชา', to: '/subjects', icon: 'subject' },
  { label: 'ข้อสอบ', to: '/exams', icon: 'exam' },
  { label: 'หนังสือ', to: '/books', icon: 'book' },
  { label: 'กิจกรรม', to: '/activities', icon: 'activity' },
  { label: 'รางวัลของฉัน', to: '/rewards', icon: 'reward' },
  { label: 'โปรโมชัน', to: '/promotions', icon: 'promo' },
]
