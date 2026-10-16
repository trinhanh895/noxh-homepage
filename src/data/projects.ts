import { routes } from '../routes'

export type ProjectStatus = 'open' | 'upcoming'

export type ProjectSummary = {
  id: string
  name: string
  area: string
  status: ProjectStatus
  /** ISO date (YYYY-MM-DD) of the application deadline, when an intake round is open */
  deadline?: string
  price: string
  /** Only projects with a built detail page have one */
  href?: string
}

// Sample data — not official announcements. Keep `updatedAt` honest when editing.
export const DATA_UPDATED_AT = '2026-10-15'

export const projectSummaries: ProjectSummary[] = [
  {
    id: 'bat-khoi-bat-trang',
    name: 'NOXH Bát Khối - Bát Tràng',
    area: 'Gia Lâm',
    status: 'open',
    deadline: '2026-11-11',
    price: 'Chưa công bố',
    href: routes.project('bat-khoi-bat-trang'),
  },
  { id: 'phuc-thinh', name: 'NOXH Phúc Thịnh', area: 'Đông Anh', status: 'open', deadline: '2026-12-30', price: 'Chưa công bố' },
  { id: 'tay-co-loa', name: 'NOXH Tây Cổ Loa', area: 'Đông Anh', status: 'upcoming', price: 'Chưa công bố' },
]

export const statusLabel: Record<ProjectStatus, string> = {
  open: 'Đang nhận hồ sơ',
  upcoming: 'Chưa mở đợt nhận',
}

export function findProject(id: string | null | undefined) {
  return projectSummaries.find((p) => p.id === id)
}

/** "11/11/2026" */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** Whole days from today until the deadline (0 = today, negative = passed) */
export function daysLeft(iso: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(`${iso}T00:00:00`)
  return Math.round((end.getTime() - today.getTime()) / 86_400_000)
}

/** "Hạn nộp 11/11/2026 · còn 27 ngày" */
export function deadlineText(p: ProjectSummary) {
  if (!p.deadline) return 'Chưa có lịch nhận hồ sơ'
  const n = daysLeft(p.deadline)
  const when = n < 0 ? 'đã hết hạn' : n === 0 ? 'hạn cuối hôm nay' : `còn ${n} ngày`
  return `Hạn nộp ${formatDate(p.deadline)} · ${when}`
}

/** Projects people can act on now first (nearest deadline first), then upcoming ones */
export function projectsByUrgency() {
  return [...projectSummaries].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1
    return (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')
  })
}
