import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { Select } from '../components/Select'
import { FloorPlan, type Plan } from '../components/FloorPlan'
import { LinkButton, PrimaryButton } from '../components/Button'
import { BackLink, PageShell, StatusTag } from '../components/Page'
import { DATA_UPDATED_AT, deadlineText, findProject, formatDate, statusLabel } from '../data/projects'
import { useFollows } from '../lib/store'
import { routes, withParams } from '../routes'
import { dossierHref } from '../lib/dossiers'
import { AiMark, AiTag, AskRow, MatchBlock, MatchPeek, StuckCards, useMyCase, type MyCase } from './DetailAi'
import p1 from '../assets/project-1.jpg'
import p2 from '../assets/project-2.jpg'
import p3 from '../assets/project-3.jpg'
import p4 from '../assets/project-4.jpg'
import p5 from '../assets/project-5.jpg'
import p6 from '../assets/project-6.jpg'
import p7 from '../assets/project-7.jpg'
import news1 from '../assets/news-1.jpg'
import news2 from '../assets/news-2.jpg'
import mapImage from '../assets/detail/map-bat-trang.webp'
import tooltipAnchor from '../assets/detail/tooltip-anchor.svg'
import divider from '../assets/detail/divider.svg'
import dividerCard from '../assets/detail/divider-card.svg'

/* ── Content: NOXH Bát Khối – Bát Tràng (sample data) ───────────────────── */

const PROJECT_ID = 'bat-khoi-bat-trang'

// Placeholder photos until the investor publishes real renders and site photos.
const gallery = [p1, p2, p3, p4, p5, p6, p7, news1, news2]

// Headline facts under the title, as in the design
const keyFacts = [
  {
    icon: 'building-user',
    label: 'Chủ đầu tư',
    value: 'Liên danh VIDIFI — Đông Đô — Vidifi Urban',
  },
  { icon: 'buildings', label: 'Quy mô', value: '10 tòa căn hộ' },
  { icon: 'door-open', label: 'Tổng căn hộ', value: '2.000+ căn hộ' },
  { icon: 'users', label: 'Quy mô dân số', value: 'Khoảng 6.800 người' },
]

const technical: [string, string][] = [
  ['Tổng diện tích khu đất', '11,2 ha (112.121 m²)'],
  ['Mật độ xây dựng', 'Khoảng 26,5%'],
  ['Tầng cao', '5 – 20 tầng, 1–2 tầng hầm'],
  ['Thời gian xây dựng', 'Quý I/2026 – Quý II/2030'],
  ['Tổng vốn đầu tư', '6.704 tỷ đồng'],
  ['Ký hiệu quy hoạch', 'Ô C3, phân khu đô thị N11'],
]

const connections = [
  { icon: 'school', place: 'Trường học trong khu', time: 'Đi bộ' },
  { icon: 'hospital', place: 'Trạm y tế trong khu', time: 'Đi bộ' },
  { icon: 'bridge', place: 'Cầu Long Biên', time: '20 phút' },
  { icon: 'tree', place: 'Bãi đá sông Hồng', time: '20 phút' },
  { icon: 'landmark', place: 'Hồ Hoàn Kiếm', time: '30 phút' },
  { icon: 'tree-city', place: 'Vinhomes Ecopark', time: '30 phút' },
]

const nearbyRoutes = ['Cầu Thanh Trì', 'Vành đai 3', 'Quốc lộ 5', 'Cao tốc Hà Nội – Hải Phòng', 'Long Biên', 'Vinhomes Ocean Park']

// Schematic layouts (balcony on top, wet rooms shaded) until the investor publishes real plan drawings.
const PLAN_1PN: Plan = {
  width: 400,
  height: 320,
  rooms: [
    { x: 0, y: 0, w: 240, h: 40, label: 'Ban công', kind: 'balcony' },
    { x: 0, y: 40, w: 240, h: 170, label: 'Phòng khách' },
    { x: 0, y: 210, w: 140, h: 110, label: 'Bếp' },
    { x: 140, y: 210, w: 100, h: 110, label: 'Sảnh' },
    { x: 240, y: 40, w: 160, h: 170, label: 'Phòng ngủ' },
    { x: 240, y: 210, w: 160, h: 110, label: 'WC', kind: 'wet' },
  ],
}
const PLAN_2PN: Plan = {
  width: 520,
  height: 320,
  rooms: [
    { x: 0, y: 0, w: 260, h: 40, label: 'Ban công', kind: 'balcony' },
    { x: 0, y: 40, w: 260, h: 170, label: 'Phòng khách' },
    { x: 0, y: 210, w: 150, h: 110, label: 'Bếp' },
    { x: 150, y: 210, w: 110, h: 110, label: 'WC', kind: 'wet' },
    { x: 260, y: 40, w: 140, h: 160, label: 'Ngủ 1' },
    { x: 400, y: 40, w: 120, h: 160, label: 'Ngủ 2' },
    { x: 260, y: 200, w: 110, h: 120, label: 'WC', kind: 'wet' },
    { x: 370, y: 200, w: 150, h: 120, label: 'Sảnh' },
  ],
}
const PLAN_3PN: Plan = {
  width: 600,
  height: 320,
  rooms: [
    { x: 0, y: 0, w: 260, h: 40, label: 'Ban công', kind: 'balcony' },
    { x: 460, y: 0, w: 140, h: 40, label: 'Ban công', kind: 'balcony' },
    { x: 0, y: 40, w: 260, h: 170, label: 'Phòng khách' },
    { x: 0, y: 210, w: 150, h: 110, label: 'Bếp' },
    { x: 150, y: 210, w: 110, h: 110, label: 'WC', kind: 'wet' },
    { x: 260, y: 40, w: 200, h: 150, label: 'Ngủ 1' },
    { x: 460, y: 40, w: 140, h: 150, label: 'Ngủ 2' },
    { x: 260, y: 190, w: 120, h: 130, label: 'WC', kind: 'wet' },
    { x: 380, y: 190, w: 220, h: 130, label: 'Ngủ 3' },
  ],
}

type Unit = {
  name: string
  area: number
  plan: Plan
  mirror?: boolean
  features: string[]
}

const F1 = ['1 phòng ngủ, 1 phòng vệ sinh', 'Phòng khách liền bếp', 'Ban công thoáng', 'Bếp gọn, nhiều chỗ để đồ']
const F2 = ['2 phòng ngủ, 2 phòng vệ sinh', 'Phòng khách liền bếp, có ánh sáng tự nhiên', 'Ban công nhìn ra cây xanh', 'Bếp rộng']
const F3 = ['3 phòng ngủ, 2 phòng vệ sinh', 'Phòng khách hai mặt thoáng', 'Hai ban công', 'Có chỗ giặt phơi riêng']

// Each building has its own designs; names besides RUBY and all areas except RUBY · 2PN are placeholders.
const buildings: { name: string; units: Unit[] }[] = [
  {
    name: 'Tòa RUBY',
    units: [
      { name: 'Căn 1 phòng ngủ', area: 45, plan: PLAN_1PN, features: F1 },
      { name: 'Căn 2 phòng ngủ', area: 66, plan: PLAN_2PN, features: F2 },
      { name: 'Căn 3 phòng ngủ', area: 77, plan: PLAN_3PN, features: F3 },
    ],
  },
  {
    name: 'Tòa SAPPHIRE',
    units: [
      {
        name: 'Căn 2 phòng ngủ',
        area: 60,
        plan: PLAN_2PN,
        mirror: true,
        features: F2,
      },
      {
        name: 'Căn 3 phòng ngủ',
        area: 72,
        plan: PLAN_3PN,
        mirror: true,
        features: F3,
      },
    ],
  },
  {
    name: 'Tòa EMERALD',
    units: [
      {
        name: 'Căn 1 phòng ngủ',
        area: 42,
        plan: PLAN_1PN,
        mirror: true,
        features: F1,
      },
      { name: 'Căn 2 phòng ngủ', area: 62, plan: PLAN_2PN, features: F2 },
    ],
  },
]

// Amenities belong to the project (each project has its own list, any length). Sample data for Bát Tràng.
const amenities = [
  {
    icon: 'shield-check',
    title: 'Bảo vệ 24/7',
    body: 'Kiểm soát người ra vào suốt ngày đêm.',
  },
  {
    icon: 'fire-extinguisher',
    title: 'Phòng cháy chữa cháy',
    body: 'Báo cháy và chữa cháy tự động.',
  },
  {
    icon: 'camera-cctv',
    title: 'Camera giám sát',
    body: 'Lắp khắp khu, lưu hình liên tục.',
  },
  {
    icon: 'screwdriver-wrench',
    title: 'Sửa chữa, bảo trì',
    body: 'Có người xử lý sự cố điện nước.',
  },
  {
    icon: 'children',
    title: 'Sân chơi trẻ em',
    body: 'Khu vui chơi an toàn cho các bé.',
  },
  {
    icon: 'seedling',
    title: 'Vườn và lối đi dạo',
    body: 'Cây xanh giữa các tòa nhà.',
  },
  {
    icon: 'dumbbell',
    title: 'Phòng tập',
    body: 'Thiết bị tập thể dục trong khu.',
  },
  {
    icon: 'person-swimming',
    title: 'Bể bơi',
    body: 'Bể bơi chung cho cư dân.',
  },
]

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=B%C3%A1t+Tr%C3%A0ng%2C+Gia+L%C3%A2m%2C+H%C3%A0+N%E1%BB%99i'

/* ── Page ───────────────────────────────────────────────────────────────── */

const project = findProject(PROJECT_ID)!
const startHref = dossierHref(PROJECT_ID)
const guideHref = withParams(routes.assistant, { prj: PROJECT_ID, guide: '1' })
const askHref = withParams(routes.assistant, { prj: PROJECT_ID })
const advisorHref = withParams(routes.advisor, { prj: PROJECT_ID })

export function ProjectDetail() {
  const me = useMyCase(PROJECT_ID)
  return (
    <>
      <PageShell>
        <BackLink href={routes.projects}>Danh sách dự án</BackLink>
        <Intro />
        {/* Under the intro: content on the left, status pinned on the right. Phones: status first, then content */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <aside aria-label="Tình trạng nhận hồ sơ" className="lg:col-start-2 lg:row-start-1">
            <StatusCard me={me} />
          </aside>
          <div className="flex min-w-0 flex-col lg:col-start-1 lg:row-start-1">
            <div className="flex flex-col gap-16 lg:gap-20">
              <Overview />
              <Location />
              <Units me={me} />
              <Amenities />
              <Eligibility me={me} />
            </div>
          </div>
        </div>
      </PageShell>
      <MobileActionBar me={me} />
    </>
  )
}

function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-2">
      <h2 className="headline text-xl capitalize">{title}</h2>
      {children && <p className="text-m text-text-neutral-secondary">{children}</p>}
    </div>
  )
}

function FollowButton() {
  const [follows, setFollows] = useFollows()
  const following = follows.includes(PROJECT_ID)
  return (
    <PrimaryButton
      variant="outlined"
      block
      icon="bookmark"
      iconVariant={following ? 'solid' : 'regular'}
      onClick={() => setFollows((f) => (following ? f.filter((x) => x !== PROJECT_ID) : [...f, PROJECT_ID]))}
    >
      <span aria-live="polite">{following ? 'Đang theo dõi' : 'Theo dõi dự án'}</span>
    </PrimaryButton>
  )
}

function Intro() {
  return (
    <header className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <p className="flex items-center gap-2 text-m font-medium text-text-neutral-secondary">
          <Icon name="location-dot" className="text-primary-500" />
          Xã Bát Tràng, huyện Gia Lâm, Hà Nội
        </p>
        <h1 className="headline text-headline-m capitalize lg:text-headline-l">NOXH tập trung Bát Khối - Bát Tràng</h1>
        <p className="max-w-[720px] text-m text-text-neutral-secondary">
          Khu nhà ở xã hội phía Đông Hà Nội, hơn 2.000 căn ở giai đoạn 1. Có trường học và trạm y tế ngay trong khu.
        </p>
      </div>

      <img src={divider} alt="" className="h-px w-full" />

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {keyFacts.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="flex shrink-0 items-center justify-center rounded-pill border border-border-neutral p-3.5" aria-hidden>
              <Icon name={f.icon} variant="regular" className="text-primary-500" />
            </span>
            <div className="flex flex-col gap-1">
              <dt className="text-s font-medium text-text-neutral-secondary">{f.label}</dt>
              <dd className="text-m font-semibold">{f.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </header>
  )
}

/* What an applicant needs first: can I still apply, by when, how much — stays in view while reading on desktop */
function StatusCard({ me }: { me: MyCase }) {
  return (
    <div className="flex flex-col gap-5 rounded-24 border border-border-neutral p-5 lg:sticky lg:top-6">
      <dl className="flex flex-col">
        <div className="flex flex-col gap-1 border-b border-border-divider pb-4">
          <dt className="flex items-center justify-between gap-3 text-s text-text-neutral-secondary">
            Hạn nộp hồ sơ
            <StatusTag tone={project.status} size="s">
              {statusLabel[project.status]}
            </StatusTag>
          </dt>
          <dd className="headline text-l">{project.deadline ? formatDate(project.deadline) : 'Chưa có lịch'}</dd>
          <dd className="text-s font-medium text-warning-700">{deadlineText(project).split(' · ')[1]}</dd>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-border-divider py-4">
          <dt className="text-s text-text-neutral-secondary">Giá bán</dt>
          <dd className="text-m font-semibold">{project.price}</dd>
          <dd className="text-s text-text-neutral-secondary">Theo thông báo của chủ đầu tư</dd>
        </div>
        <div className="flex flex-col gap-0.5 pt-4">
          <dt className="text-s text-text-neutral-secondary">Ai được mua?</dt>
          {/* the link sits on the same line as the answer it explains */}
          <dd className="flex items-baseline justify-between gap-3 text-s">
            <span className="font-medium">Cần đủ 3 nhóm điều kiện</span>
            <ScrollLink id="dieu-kien" className="-my-3 py-3 font-semibold whitespace-nowrap text-primary-500 underline underline-offset-2">
              Xem điều kiện
            </ScrollLink>
          </dd>
        </div>
      </dl>

      <MatchPeek p={project} c={me} href={startHref} />

      {me.open && (
        <div className="flex flex-col gap-2 rounded-16 bg-primary-25 p-3">
          <p className="flex items-center justify-between gap-2 text-s font-semibold">
            Bìa hồ sơ của bạn
            <span className="text-[12px] font-medium text-text-neutral-secondary">
              {me.open.checked}/{me.open.docs.length} đã soát
            </span>
          </p>
          <span className="h-1.5 overflow-hidden rounded-pill bg-white">
            <span className="block h-full rounded-pill bg-primary-500" style={{ width: `${me.open.pct}%` }} />
          </span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <PrimaryButton icon="list-check" block href={startHref}>
          {me.open ? 'Tiếp tục hồ sơ' : me.has ? 'Mở bìa hồ sơ' : 'Bắt đầu chuẩn bị hồ sơ'}
        </PrimaryButton>
        <FollowButton />
        <a href={askHref} className="inline-flex min-h-11 items-center justify-center gap-2 px-2 text-s font-semibold text-primary-500 hover:underline">
          <Icon name="sparkles" />
          Hỏi trợ lý về dự án này
        </a>
      </div>

      <p className="border-t border-border-divider pt-4 text-[12px] leading-relaxed text-text-neutral-secondary">
        Cập nhật {formatDate(DATA_UPDATED_AT)} · Dữ liệu mẫu, hãy đối chiếu với thông báo chính thức của chủ đầu tư.
      </p>
    </div>
  )
}

/* Scrolls within the page without touching the hash (the hash is the router) */
function ScrollLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        document.getElementById(id)?.focus({ preventScroll: true })
      }}
      className={className}
    >
      {children}
    </a>
  )
}

/* ── Tổng quan: gallery + description + key numbers ─────────────────────── */

function Overview() {
  const [open, setOpen] = useState<number | null>(null)
  const shown = gallery.slice(0, 8)

  return (
    <section id="tong-quan" tabIndex={-1} className="flex scroll-mt-20 flex-col gap-10 outline-none">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[852.8fr_419.2fr]">
          <GalleryTile src={shown[0]} index={0} onClick={() => setOpen(0)} />
          <div className="hidden grid-rows-[1fr_1fr] gap-2 md:grid">
            <GalleryTile src={shown[1]} index={1} onClick={() => setOpen(1)} fill />
            <GalleryTile src={shown[2]} index={2} onClick={() => setOpen(2)} fill />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
          {shown.slice(3, 8).map((src, i) => {
            const index = i + 3
            const isLast = index === shown.length - 1
            return (
              <GalleryTile
                key={index}
                src={src}
                index={index}
                onClick={() => setOpen(isLast ? 0 : index)}
                className={i >= 2 && !isLast ? 'hidden md:block' : ''}
                overlay={isLast ? `Xem cả ${gallery.length} ảnh` : undefined}
              />
            )
          })}
        </div>
        <p className="flex items-center gap-2 text-s text-text-neutral-secondary">
          <Icon name="image" variant="regular" />
          Ảnh minh hoạ, chưa phải phối cảnh chính thức của dự án.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SectionTitle title="Tổng quan" />
        <div className="flex max-w-[720px] flex-col gap-4 text-m">
          <p>
            Khu nhà ở xã hội tập trung Bát Khối – Bát Tràng nằm ở xã Bát Tràng, Hà Nội. Đây là dự án nhà ở xã hội tập trung đầu tiên của Hà Nội, gồm 10 tòa căn
            hộ, có trường học và trạm y tế ngay trong khu.
          </p>
          <p>
            Giai đoạn 1 có hơn 2.000 căn hộ, dành cho người dân đủ điều kiện mua nhà ở xã hội theo quy định. Dự án được UBND thành phố Hà Nội chỉ đạo đẩy nhanh
            tiến độ.
          </p>
        </div>

        <section aria-labelledby="thong-so" className="flex flex-col gap-3 rounded-24 bg-primary-50 p-5 md:p-6">
          <h3 id="thong-so" className="text-l font-semibold">
            Thông số dự án
          </h3>
          <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {technical.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 border-t border-primary-500/15 py-3.5">
                <dt className="text-s text-text-neutral-secondary">{k}</dt>
                <dd className="text-m font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <Lightbox images={gallery} index={open} onChange={setOpen} />
    </section>
  )
}

function GalleryTile({
  src,
  index,
  onClick,
  overlay,
  fill = false,
  className = '',
}: {
  src: string
  index: number
  onClick: () => void
  overlay?: string
  fill?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={overlay ?? `Xem ảnh ${index + 1} trên ${gallery.length}`}
      className={`group relative cursor-zoom-in overflow-hidden rounded-24 bg-placeholder md:rounded-32 ${fill ? 'h-full' : 'aspect-video'} ${className}`}
    >
      <img src={src} alt="" className="absolute inset-0 size-full object-cover transition-[filter] duration-200 group-hover:brightness-90" />
      {overlay && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 px-2 text-center text-s font-semibold text-white md:text-m">
          <Icon name="images" variant="regular" />
          {overlay}
        </span>
      )}
    </button>
  )
}

function Lightbox({ images, index, onChange }: { images: string[]; index: number | null; onChange: (i: number | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (index !== null && !d.open) d.showModal()
    if (index === null && d.open) d.close()
  }, [index])

  const step = (delta: number) => index !== null && onChange((index + delta + images.length) % images.length)

  return (
    <dialog
      ref={ref}
      aria-label="Thư viện ảnh"
      onClose={() => onChange(null)}
      onClick={(e) => e.target === e.currentTarget && onChange(null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
      className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/85"
    >
      {index !== null && (
        <div className="relative flex w-[min(1280px,94vw)] flex-col items-center gap-4">
          <img src={images[index]} alt={`Ảnh minh hoạ ${index + 1} trên ${images.length}`} className="max-h-[78vh] w-full rounded-24 object-contain" />
          <div className="flex items-center gap-4 text-white">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Ảnh trước"
              className="glass-neutral flex size-12 cursor-pointer items-center justify-center rounded-pill text-text-neutral-primary"
            >
              <Icon name="angle-left" />
            </button>
            <span className="min-w-16 text-center text-m tabular-nums" aria-live="polite">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Ảnh sau"
              className="glass-neutral flex size-12 cursor-pointer items-center justify-center rounded-pill text-text-neutral-primary"
            >
              <Icon name="angle-right" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="glass-neutral absolute top-3 right-3 inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill px-4 text-s font-semibold text-text-neutral-primary"
          >
            <Icon name="xmark" />
            Đóng
          </button>
        </div>
      )}
    </dialog>
  )
}

/* ── Vị trí & đi lại — static map with project boundary + travel times ──── */

function Location() {
  return (
    <section id="vi-tri" tabIndex={-1} className="flex scroll-mt-20 flex-col gap-8 outline-none">
      <SectionTitle title="Vị trí & đi lại">
        Nằm ở xã Bát Tràng (giáp Đa Tốn), phía Đông Hà Nội. Có trường học, trạm y tế trong khu; đi ô tô khoảng 30 phút tới trung tâm.
      </SectionTitle>

      <div className="relative flex flex-col overflow-hidden rounded-32 bg-white xl:block xl:h-[560px] xl:rounded-40">
        {/* The map (project area already drawn on it) keeps its 16:9 shape at full height; it slides so the area sits in the
            middle of whatever the card leaves visible. translate-x is a % of the layer's own width, so 63.5% lands on the area. */}
        <div className="relative h-[340px] overflow-hidden rounded-32 sm:h-[420px] xl:absolute xl:inset-0 xl:h-auto xl:rounded-none">
          <div className="absolute top-0 left-1/2 aspect-[16/9] h-full -translate-x-[63.5%] xl:left-[calc(50%+172px)]">
            <img src={mapImage} alt="Bản đồ: khu dự án nằm giữa đường Lý Thánh Tông và đường Bát Khối, xã Bát Tràng" className="size-full max-w-none" />
            <span className="absolute top-[49.8%] left-[63.5%] flex size-6 -translate-x-1/2 -translate-y-full items-center justify-center text-danger-500" aria-hidden>
              <Icon name="location-dot" size={24} />
            </span>
            <div className="absolute top-[49.8%] left-[63.5%] flex -translate-x-1/2 -translate-y-[calc(100%+28px)] flex-col items-center" aria-hidden>
              <span className="bg-bg-neutral-solid px-4 py-1.5 text-m whitespace-nowrap text-white">NOXH Bát Tràng</span>
              <img src={tooltipAnchor} alt="" width={6} height={4} />
            </div>
          </div>
        </div>

        {/* Narrower card, fixed to the map's height; the travel list scrolls inside it */}
        <div className="relative mt-3 flex flex-col gap-5 rounded-32 bg-warning-500 p-5 xl:absolute xl:top-6 xl:bottom-6 xl:left-6 xl:mt-0 xl:w-[320px] xl:rounded-24">
          <div className="flex flex-col gap-3">
            <p className="text-l font-semibold">
              Xã Bát Tràng,
              <br />
              huyện Gia Lâm, Hà Nội
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-pill bg-primary-500 px-4 text-s font-semibold text-white transition hover:bg-primary-400"
            >
              <Icon name="map-location-dot" variant="regular" />
              Mở Google Maps
              <Icon name="arrow-up-right" variant="regular" />
            </a>
          </div>
          <img src={dividerCard} alt="" className="h-px w-full" />
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <h3 className="text-m font-semibold">Đi từ dự án</h3>
            <ul
              tabIndex={0}
              aria-label="Thời gian đi từ dự án"
              className="-mr-2 flex min-h-0 flex-1 flex-col gap-3 pr-2 outline-none scroll-slim xl:overflow-y-auto xl:pb-6 xl:[mask-image:linear-gradient(to_bottom,#000_calc(100%-32px),transparent)]"
            >
              {connections.map((c) => (
                <li key={c.place} className="flex items-center gap-3">
                  <span className="flex shrink-0 rounded-pill border border-primary-500 p-2.5" aria-hidden>
                    <Icon name={c.icon} size={18} className="text-text-neutral-primary" />
                  </span>
                  <span className="flex-1 text-s font-medium">{c.place}</span>
                  <span className="text-s font-semibold whitespace-nowrap text-primary-500">{c.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[12px] text-text-neutral-primary">Đi ô tô, ước tính lúc đường thông thoáng.</p>
        </div>
      </div>

      <AskRow prj={PROJECT_ID} q="Từ chỗ tôi làm việc đến dự án mất bao lâu?">
        Từ chỗ bạn làm việc đến đây mất bao lâu? Trợ lý ước tính theo giờ đi làm.
      </AskRow>

      <div className="flex flex-col gap-3">
        <h3 className="text-l font-semibold">Gần các tuyến đường</h3>
        <ul className="flex flex-wrap gap-2">
          {nearbyRoutes.map((r) => (
            <li key={r} className="rounded-pill border border-border-neutral px-4 py-2 text-s">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── Các loại căn — pick a type on the left, see it on the right ────────── */

function Units({ me }: { me: MyCase }) {
  const [buildingName, setBuildingName] = useState(buildings[0].name)
  const building = buildings.find((b) => b.name === buildingName) ?? buildings[0]
  const [unitName, setUnitName] = useState(me.unit ?? 'Căn 2 phòng ngủ')
  // Keep the chosen type when the new building has it, otherwise fall back to its first design
  const unit = building.units.find((u) => u.name === unitName) ?? building.units[0]

  return (
    <section id="loai-can" tabIndex={-1} className="flex scroll-mt-20 flex-col gap-8 outline-none">
      <SectionTitle title="Các loại căn">Mỗi tòa có thiết kế riêng. Diện tích để tham khảo, giá sẽ có trong thông báo chính thức.</SectionTitle>
      {me.unit && (
        <p className="-mt-4 flex items-start gap-2.5 text-s">
          <AiMark size={24} />
          <span>
            <b className="font-semibold text-warning-700">Gợi ý cho bạn: </b>
            <b className="font-semibold">{me.unit}</b> hợp với hộ của bạn, theo câu trả lời về hôn nhân. Đã chọn sẵn bên dưới.
          </span>
        </p>
      )}

      <div className="flex flex-col overflow-hidden rounded-24 border border-border-neutral">
        <div className="flex flex-col gap-3 border-b border-border-divider p-4 sm:flex-row sm:items-end md:px-6 md:py-5">
          <Select
            label="Tòa"
            showLabel
            value={building.name}
            options={buildings.map((b) => b.name)}
            onChange={setBuildingName}
            className="sm:w-[180px] sm:flex-none"
          />
          <Select
            label="Loại căn"
            showLabel
            value={unit.name}
            options={building.units.map((u) => ({
              value: u.name,
              label: u.name.replace('Căn ', ''),
            }))}
            onChange={setUnitName}
            className="sm:w-[180px] sm:flex-none"
          />
          <p className="text-s text-text-neutral-secondary sm:ml-auto sm:pb-3">
            {building.units.length} thiết kế ở {building.name.replace('Tòa', 'tòa')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <figure className="flex flex-col justify-between gap-4 border-b border-border-divider bg-primary-25 p-5 md:border-r md:border-b-0 md:p-8">
            <div className="flex flex-1 items-center">
              <FloorPlan key={building.name + unit.name} plan={unit.plan} mirror={unit.mirror} title={`Sơ đồ ${unit.name.toLowerCase()}, ${building.name}`} />
            </div>
            <figcaption className="text-s text-text-neutral-secondary">Sơ đồ minh hoạ, chưa phải bản vẽ chính thức</figcaption>
          </figure>

          <div className="flex flex-col gap-6 p-5 md:p-6" aria-live="polite">
            <h3 className="text-xl font-semibold">{unit.name}</h3>

            <div className="flex flex-col gap-4">
              <p className="flex items-baseline gap-1.5 text-primary-500">
                <span className="headline text-headline-l leading-none">{unit.area}</span>
                <span className="text-l font-semibold">m²</span>
              </p>
              <dl className="flex divide-x divide-border-divider border-y border-border-divider py-3">
                {[
                  { icon: 'bed', label: 'Phòng ngủ', n: rooms(unit).bed },
                  { icon: 'bath', label: 'Vệ sinh', n: rooms(unit).wc },
                  {
                    icon: 'door-open',
                    label: 'Ban công',
                    n: rooms(unit).balcony,
                  },
                ].map((r) => (
                  <div key={r.label} className="flex flex-1 flex-col items-center gap-1 px-2">
                    <dd className="flex items-center gap-1.5 text-l font-semibold">
                      <Icon name={r.icon} variant="regular" size={18} className="text-primary-400" />
                      {r.n}
                    </dd>
                    <dt className="text-s text-text-neutral-secondary">{r.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="flex flex-col gap-2.5">
              {unit.features.slice(1).map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-m">
                  <Icon name="check" variant="solid" size={16} className="mt-1 shrink-0 text-primary-500" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-2">
              <PrimaryButton variant="outlined" icon="sparkles" block href={askHref}>
                Hỏi trợ lý về loại căn này
              </PrimaryButton>
              <LinkButton tone="dark" href={advisorHref}>
                Nhờ tư vấn viên chọn loại căn
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Room counts read straight from the plan, so they never disagree with the drawing */
function rooms(u: Unit) {
  return {
    bed: u.plan.rooms.filter((r) => /ngủ/i.test(r.label)).length,
    wc: u.plan.rooms.filter((r) => r.label === 'WC').length,
    balcony: u.plan.rooms.filter((r) => r.kind === 'balcony').length,
  }
}

/* ── Tiện ích trong khu ─────────────────────────────────────────────────── */

function Amenities() {
  return (
    <section id="tien-ich" tabIndex={-1} className="flex scroll-mt-20 flex-col gap-8 outline-none">
      <SectionTitle title="Tiện ích trong khu">{amenities.length} tiện ích của dự án, theo quy hoạch được duyệt.</SectionTitle>
      {/* A plain list that works for any number of items — every project has its own */}
      <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        {amenities.map((a) => (
          <li key={a.title} className="flex items-center gap-4 border-t border-border-divider py-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-16 bg-primary-50 text-primary-500" aria-hidden>
              <Icon name={a.icon} variant="regular" size={20} />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-m font-semibold">{a.title}</p>
              <p className="text-s text-text-neutral-secondary">{a.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Ai được mua? — the conditions, in plain words ──────────────────────── */

const conditions = [
  {
    icon: 'id-card',
    title: 'Thuộc nhóm được mua',
    body: 'Ví dụ: người thu nhập thấp ở đô thị, công nhân, cán bộ – công chức – viên chức, người có công với cách mạng…',
  },
  {
    icon: 'house-circle-xmark',
    title: 'Chưa có nhà, hoặc nhà quá chật',
    body: 'Chưa có nhà ở thuộc sở hữu tại Hà Nội; hoặc có nhưng diện tích bình quân dưới 15 m² mỗi người.',
  },
  {
    icon: 'wallet',
    title: 'Thu nhập trong mức quy định',
    body: 'Thu nhập không vượt mức trần theo quy định hiện hành, có xác nhận của nơi làm việc hoặc UBND xã/phường.',
  },
]

function Eligibility({ me }: { me: MyCase }) {
  // "Chưa có nhà" is known from the answer about where they live; the other two stay for the person to tick
  const [met, setMet] = useState([false, me.home === 0 || me.home === 1, false])
  const count = met.filter(Boolean).length
  const all = count === conditions.length

  return (
    <section id="dieu-kien" tabIndex={-1} className="flex scroll-mt-20 flex-col gap-8 outline-none">
      <SectionTitle title="Ai được mua?">Cần đủ cả 3 nhóm điều kiện. Đánh dấu những điều bạn đáp ứng để biết nên làm gì tiếp.</SectionTitle>
      {me.has && <MatchBlock p={project} c={me} onJump={jumpTo} />}

      <div className="flex flex-col gap-3">
        <ol className="flex flex-col gap-3">
          {conditions.map((c, i) => {
            const on = met[i]
            return (
              <li key={c.title}>
                <label
                  className={`${on ? 'border-primary-500 bg-primary-25' : 'border-border-neutral hover:border-primary-400'} flex cursor-pointer items-start gap-4 rounded-24 border p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-offset-2`}
                >
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => setMet((m) => m.map((v, j) => (j === i ? !v : v)))} />
                  <span
                    className={`${on ? 'border-primary-500 bg-primary-500 text-white' : 'border-border-input bg-white text-transparent'} mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition-colors`}
                    aria-hidden
                  >
                    <Icon name="check" variant="solid" size={14} />
                  </span>
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="text-s font-medium text-text-neutral-secondary">Điều kiện {i + 1}</span>
                    <span className="text-l font-semibold">{c.title}</span>
                    <span className="text-s text-text-neutral-secondary">{c.body}</span>
                  </span>
                  <span className="hidden size-11 shrink-0 items-center justify-center rounded-pill bg-primary-50 text-primary-500 sm:flex" aria-hidden>
                    <Icon name={c.icon} variant="regular" />
                  </span>
                </label>
              </li>
            )
          })}
        </ol>

        {/* The answer to the ticks: progress plus the one next step */}
        <div
          aria-live="polite"
          className={`${all ? 'border-primary-500 bg-primary-25' : 'border-border-neutral'} flex flex-col gap-4 rounded-24 border p-5 transition-colors sm:flex-row sm:items-center sm:justify-between md:p-6`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5" aria-hidden>
              {conditions.map((_, i) => (
                <span key={i} className={`${i < count ? 'bg-primary-500' : 'bg-primary-50'} h-1.5 w-10 rounded-pill transition-colors`} />
              ))}
            </div>
            <p className="text-l font-semibold">{all ? 'Có vẻ bạn đủ điều kiện' : `Bạn đáp ứng ${count}/3 điều kiện`}</p>
            <p className="text-s text-text-neutral-secondary">
              {all
                ? 'Bước tiếp theo: chuẩn bị giấy tờ chứng minh từng điều kiện.'
                : 'Chưa chắc điều nào? Trả lời 3 câu hỏi ngắn để kiểm tra trường hợp của bạn.'}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <PrimaryButton icon="list-check" href={all ? startHref : guideHref}>
              {all ? 'Bắt đầu chuẩn bị hồ sơ' : 'Kiểm tra cùng trợ lý'}
            </PrimaryButton>
            {!all && <span className="text-center text-[12px] text-text-neutral-secondary sm:text-right">Trợ lý hỏi 3 câu ngay trong khung chat</span>}
          </div>
        </div>
        {(me.home === 0 || me.home === 1) && (
          <p className="flex items-center gap-2 text-[12px] text-text-neutral-secondary">
            <AiTag>Điền sẵn</AiTag> Điều kiện 2 được đánh dấu từ câu trả lời "{me.home === 0 ? 'Nhà thuê' : 'Ở nhờ người thân'}" của bạn.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          {
            title: 'Cần nhớ',
            icon: 'circle-info',
            cls: 'bg-primary-50',
            iconCls: 'text-primary-500',
            dot: 'bg-primary-500',
            items: [
              'Mỗi người chỉ đăng ký ở một dự án cùng lúc.',
              'Đủ điều kiện chưa chắc đã mua được căn hộ.',
              'Nhà ở xã hội bị giới hạn bán lại vài năm đầu.',
            ],
          },
          {
            title: 'Cẩn thận lừa đảo',
            icon: 'shield-exclamation',
            cls: 'bg-warning-50',
            iconCls: 'text-warning-700',
            dot: 'bg-warning-700',
            items: ['NOX không thu tiền và không làm hồ sơ hộ.', 'Ai hứa "chạy" suất mua, giữ suất là lừa đảo.', 'Chỉ nộp hồ sơ theo kênh trong thông báo.'],
          },
        ].map((b) => (
          <div key={b.title} className={`${b.cls} flex flex-col gap-4 rounded-24 p-5 md:p-6`}>
            <h3 className="flex items-center gap-2.5 text-m font-semibold">
              <Icon name={b.icon} className={b.iconCls} />
              {b.title}
            </h3>
            <ul className="flex flex-col gap-2.5 text-s">
              {b.items.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className={`${b.dot} mt-2 size-1.5 shrink-0 rounded-full`} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <StuckCards p={project} />
    </section>
  )
}

/* ── Mobile: the next step is always one thumb away ─────────────────────── */

function MobileActionBar({ me }: { me: MyCase }) {
  return (
    <div className="surface-light fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-border-neutral bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] text-text-neutral-primary shadow-[0_-8px_24px_rgb(0_0_0/0.08)] lg:hidden">
      <p className="text-s font-medium text-warning-700">{deadlineText(project)}</p>
      <div className="flex gap-2">
        <a
          href={askHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-primary-500 px-4 text-s font-semibold text-primary-500"
        >
          <Icon name="sparkles" />
          Hỏi trợ lý
        </a>
        <a
          href={startHref}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-primary-500 px-4 text-m font-semibold text-white"
        >
          {me.open ? 'Tiếp tục hồ sơ' : 'Bắt đầu chuẩn bị'}
        </a>
      </div>
    </div>
  )
}

function jumpTo(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el?.focus({ preventScroll: true })
}
