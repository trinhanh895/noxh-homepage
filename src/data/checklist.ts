/*
 * One source of truth for the document checklist — the assistant's guided questions
 * produce it, "Hồ sơ của tôi" stores and tracks it.
 * Reference only: the exact forms come from each project's official announcement.
 */

export type DocGroup = 'basic' | 'subject' | 'housing' | 'income' | 'family'
export type DocStatus = 'todo' | 'doing' | 'done' | 'later'
export type DocItem = { id: string; group: DocGroup; title: string; where: string }

export const GROUP_LABEL: Record<DocGroup, string> = {
  basic: 'Đơn và giấy tờ tuỳ thân',
  subject: 'Chứng minh đối tượng',
  housing: 'Chứng minh điều kiện nhà ở',
  income: 'Chứng minh thu nhập',
  family: 'Tình trạng hôn nhân',
}

export const STATUS_LABEL: Record<DocStatus, string> = {
  todo: 'Chưa có',
  doing: 'Đang xin',
  done: 'Đã có',
  later: 'Để sau',
}

export const UNSURE = 'Không chắc'

export const GUIDE = [
  {
    key: 'home',
    question: 'Hiện bạn có nhà ở thuộc sở hữu của mình tại Hà Nội (nơi có dự án) không?',
    hint: 'Nhà ở quê, tỉnh khác thường không tính.',
    options: ['Chưa có nhà', 'Có nhà nhưng rất chật', 'Đã có nhà', UNSURE],
  },
  {
    key: 'work',
    question: 'Bạn đang làm việc theo hình thức nào?',
    options: ['Có hợp đồng lao động', 'Lao động tự do', 'Cán bộ, công chức, viên chức', UNSURE],
  },
  {
    key: 'family',
    question: 'Bạn đăng ký một mình hay cùng vợ/chồng?',
    options: ['Một mình', 'Cùng vợ/chồng'],
  },
] as const

export type GuideKey = (typeof GUIDE)[number]['key']
export type GuideAnswers = Partial<Record<GuideKey, string>>

const WORKPLACE = 'Cơ quan, doanh nghiệp nơi bạn đang làm việc xác nhận.'
const COMMUNE = 'UBND xã/phường nơi bạn đang cư trú xác nhận.'
const ANNOUNCED = 'Nơi xác nhận ghi trong thông báo của dự án — tư vấn viên có thể chỉ giúp bạn.'

/** Builds the checklist for a set of guide answers. No answers → the general list. */
export function buildChecklist(a: GuideAnswers = {}): DocItem[] {
  const free = a.work === 'Lao động tự do'
  const unsureWork = !a.work || a.work === UNSURE
  const docs: DocItem[] = [
    { id: 'don', group: 'basic', title: 'Đơn đăng ký mua nhà ở xã hội', where: 'Theo mẫu trong thông báo của dự án (chủ đầu tư phát hành).' },
    { id: 'cccd', group: 'basic', title: 'Căn cước công dân (bản sao)', where: 'Chứng thực bản sao tại UBND xã/phường hoặc phòng công chứng.' },
    {
      id: 'doi-tuong',
      group: 'subject',
      title: 'Giấy xác nhận thuộc đối tượng được mua nhà ở xã hội',
      where: unsureWork ? ANNOUNCED : free ? COMMUNE : WORKPLACE,
    },
    { id: 'nha-o', group: 'housing', title: 'Giấy xác nhận về điều kiện nhà ở', where: ANNOUNCED },
  ]
  if (a.home === 'Có nhà nhưng rất chật') {
    docs.push({ id: 'dien-tich', group: 'housing', title: 'Xác nhận diện tích nhà ở bình quân đầu người', where: 'UBND xã/phường nơi có nhà xác nhận.' })
  }
  docs.push({
    id: 'thu-nhap',
    group: 'income',
    title: free ? 'Giấy xác nhận thu nhập (người không có hợp đồng lao động)' : 'Giấy xác nhận thu nhập',
    where: unsureWork ? ANNOUNCED : free ? COMMUNE : WORKPLACE,
  })
  if (a.family === 'Cùng vợ/chồng') {
    docs.push({ id: 'ket-hon', group: 'family', title: 'Giấy chứng nhận đăng ký kết hôn (bản sao)', where: 'Bản gốc bạn đang giữ; chứng thực bản sao như căn cước.' })
    docs.push({ id: 'cccd-vo-chong', group: 'family', title: 'Căn cước công dân của vợ/chồng (bản sao)', where: 'Chứng thực bản sao tại UBND xã/phường hoặc phòng công chứng.' })
  } else {
    docs.push({ id: 'hon-nhan', group: 'family', title: 'Giấy xác nhận tình trạng hôn nhân', where: COMMUNE })
  }
  return docs
}

/** Groups docs in display order, skipping empty groups */
export function groupDocs<T extends DocItem>(docs: T[]) {
  return (Object.keys(GROUP_LABEL) as DocGroup[])
    .map((g) => ({ group: g, label: GROUP_LABEL[g], docs: docs.filter((d) => d.group === g) }))
    .filter((g) => g.docs.length > 0)
}
