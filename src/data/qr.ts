import { routes } from '../routes'
import cover from '../assets/project-3.jpg'

/* Projects reachable from a QR code on the investor's brochure or slides. Sample data, not an official notice. */

export type QrProject = {
  slug: string
  name: string
  address: string
  /** ISO date the intake round closes */
  deadline: string
  opened: string
  units: string
  area: string
  price: string
  cover: string
  source: string
  /** Where "Tìm hiểu dự án trước" goes; the detail page is still the Bát Tràng sample */
  detailHref: string
}

export const qrProjects: Record<string, QrProject> = {
  'an-binh': {
    slug: 'an-binh',
    name: 'NOXH An Bình',
    address: 'Phường An Bình',
    deadline: '2026-11-20',
    opened: '2026-10-01',
    units: '1 và 2 phòng ngủ',
    area: '45–70 m²',
    price: 'Chưa công bố',
    cover,
    source: 'Thông báo của chủ đầu tư, cập nhật 01/10/2026 · dữ liệu mẫu',
    detailHref: routes.project('bat-khoi-bat-trang'),
  },
}

export const qrRoutes = {
  landing: (slug: string) => `#/qr/${slug}`,
  dossier: (slug: string) => `#/qr/${slug}/ho-so`,
}

/* ── The dossier: everyone needs the base papers; three questions add the rest ── */

export type Doc = { id: string; name: string; why: string; color: string }

export const baseDocs: Doc[] = [
  { id: 'cccd', name: 'Căn cước', why: 'Ai cũng cần', color: '#2F55B5' },
  { id: 'cutru', name: 'Giấy cư trú', why: 'Ai cũng cần', color: '#7C3AED' },
  { id: 'don', name: 'Đơn theo mẫu dự án', why: 'Ai cũng cần', color: '#0F766E' },
]

export type Option = { label: string; hint: string; add?: Doc; unsure?: boolean }
export type Question = { id: string; text: string; why: string; options: Option[] }

export const questions: Question[] = [
  {
    id: 'honnhan',
    text: 'Bạn đã lập gia đình chưa?',
    why: 'Nếu đã kết hôn, hồ sơ cần thêm giấy của vợ hoặc chồng.',
    options: [
      { label: 'Chưa', hint: 'Không thêm giấy' },
      { label: 'Rồi', hint: '+1 giấy', add: { id: 'honnhan', name: 'Giấy kết hôn và hộ khẩu', why: 'Vì bạn đã kết hôn', color: '#BE185D' } },
      { label: 'Ly hôn hoặc goá', hint: '+1 giấy', add: { id: 'honnhan', name: 'Giấy ly hôn hoặc khai tử', why: 'Vì bạn ly hôn hoặc goá', color: '#BE185D' } },
      { label: 'Chưa rõ', hint: 'Hỏi trợ lý sau', unsure: true },
    ],
  },
  {
    id: 'congviec',
    text: 'Bạn đang đi làm thế nào?',
    why: 'Mỗi kiểu đi làm cần một loại giấy thu nhập khác nhau.',
    options: [
      { label: 'Làm công ty, có hợp đồng', hint: '+1 giấy', add: { id: 'thunhap', name: 'Bảng lương 3 tháng', why: 'Vì bạn làm công ty', color: '#B45309' } },
      { label: 'Làm tự do, buôn bán', hint: '+1 giấy', add: { id: 'thunhap', name: 'Tờ tự khai thu nhập', why: 'Vì bạn làm tự do', color: '#B45309' } },
      { label: 'Đã nghỉ hưu', hint: '+1 giấy', add: { id: 'thunhap', name: 'Giấy lương hưu', why: 'Vì bạn đã nghỉ hưu', color: '#B45309' } },
      { label: 'Chưa rõ', hint: 'Hỏi trợ lý sau', unsure: true },
    ],
  },
  {
    id: 'noio',
    text: 'Hiện bạn đang ở đâu?',
    why: 'Để biết bạn cần xin phường xác nhận điều gì.',
    options: [
      { label: 'Nhà thuê', hint: '+1 giấy', add: { id: 'nhao', name: 'Xác nhận chưa có nhà', why: 'Vì bạn ở nhà thuê', color: '#15803D' } },
      { label: 'Ở nhờ người thân', hint: '+1 giấy', add: { id: 'nhao', name: 'Xác nhận chưa có nhà', why: 'Vì bạn ở nhờ', color: '#15803D' } },
      { label: 'Nhà riêng nhưng chật', hint: '+1 giấy', add: { id: 'nhao', name: 'Xác nhận diện tích nhà', why: 'Vì nhà bạn chật', color: '#15803D' } },
      { label: 'Chưa rõ', hint: 'Hỏi trợ lý sau', unsure: true },
    ],
  },
]

/* What the (simulated) camera reads off the ID card; one line is deliberately uncertain */
export const idFields = [
  { label: 'Họ và tên', value: 'NGUYỄN VĂN AN' },
  { label: 'Số căn cước', value: '079 090 •••• 123' },
  { label: 'Ngày sinh', value: '12/03/1990' },
  { label: 'Nơi thường trú', value: 'Số 1? đường số 7, P. An Bình', fixed: 'Số 12 đường số 7, P. An Bình', unsure: true },
]

/* Groups for "Kiểm tra câu trả lời" */
export const docGroups: { title: string; ids: string[] }[] = [
  { title: 'Giấy tuỳ thân', ids: ['cccd', 'cutru', 'honnhan'] },
  { title: 'Giấy chứng minh điều kiện', ids: ['thunhap', 'nhao'] },
  { title: 'Đơn của dự án', ids: ['don'] },
]

/* "Chưa có" → how to get the paper. Sample guidance, from the project's intake notice. */
export type Guide = { where: string; bring: string[]; form?: string; time: string; days: number }
export const guides: Record<string, Guide> = {
  cccd: { where: 'Công an phường nơi bạn thường trú', bring: ['Giấy khai sinh hoặc giấy tờ tuỳ thân cũ'], time: 'Khoảng 7 ngày làm việc', days: 7 },
  cutru: { where: 'Công an phường, hoặc tra trên VNeID', bring: ['Căn cước bản gốc'], time: 'Trong ngày, nếu tra trên VNeID', days: 1 },
  don: { where: 'Văn phòng chủ đầu tư, hoặc tải trên trang của dự án', bring: ['Căn cước bản gốc'], form: 'Mẫu đơn đăng ký mua NOXH', time: 'Trong ngày', days: 1 },
  honnhan: { where: 'UBND phường nơi đăng ký kết hôn', bring: ['Căn cước của hai vợ chồng'], form: 'Tờ khai cấp bản sao trích lục', time: 'Khoảng 3 – 5 ngày làm việc', days: 5 },
  thunhap: { where: 'Phòng nhân sự nơi bạn làm việc', bring: ['Căn cước bản gốc', 'Hợp đồng lao động'], form: 'Mẫu xác nhận thu nhập', time: 'Khoảng 3 – 7 ngày làm việc', days: 7 },
  nhao: { where: 'UBND phường nơi bạn ở', bring: ['Căn cước bản gốc'], form: 'Mẫu đơn xác nhận nhà ở', time: 'Khoảng 7 – 14 ngày làm việc', days: 14 },
}

/* "Chưa rõ" → questions people usually ask about a paper */
export const askHints = ['Tôi có cần giấy này không?', 'Giấy này xin ở đâu, mất bao lâu?', 'Không có giấy này thì có sao không?']
