import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import buildingCutout from '../assets/building-cutout.webp'
import supportCard from '../assets/support-card.jpg'
import { Icon } from './Icon'
import { routes } from '../routes'
import { LinkButton } from './Button'
import { SectionHeader } from './SectionHeader'
import { daysLeft, formatDate, projectsByUrgency } from '../data/projects'

function CardIndex({ n, dark = false }: { n: string; dark?: boolean }) {
  return (
    <div className="relative flex w-full flex-col gap-2">
      <p className="text-m font-medium">{n}</p>
      <div className={`h-px w-full border ${dark ? 'border-text-neutral-primary' : 'border-border-divider'}`} />
    </div>
  )
}

function CardText({ title, body, className = '' }: { title: string[]; body: string; className?: string }) {
  return (
    <div className={`relative flex w-full flex-col gap-2 ${className}`}>
      <h3 className="headline text-headline-xs capitalize">
        {title.map((t, i) => (
          <span key={t} className="block">
            {t}
            {i < title.length - 1 && ' '}
          </span>
        ))}
      </h3>
      <p className="text-m">{body}</p>
    </div>
  )
}

/* Shared card shell: staggered entrance, lift on hover, and a soft light that follows the pointer (desktop only) */
function Card({ delay, className, light = 'gold', children }: { delay: number; className: string; light?: 'gold' | 'white'; children: ReactNode }) {
  const track = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  const glow = light === 'gold' ? 'rgb(246 190 94 / 0.16)' : 'rgb(255 255 255 / 0.35)'
  return (
    <article
      data-reveal
      onPointerMove={track}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={`group relative flex min-h-[460px] flex-col overflow-hidden rounded-32 p-6 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgb(0_0_0/0.28)] sm:p-10 md:min-h-[520px] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: `radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), ${glow}, transparent 45%)` }}
      />
      {children}
    </article>
  )
}

export function SupportSection() {
  const next = projectsByUrgency().find((p) => p.status === 'open' && p.deadline && daysLeft(p.deadline) >= 0)

  return (
    <section id="tro-ly" className="relative isolate flex w-full flex-col items-center gap-10 px-5 pt-[120px] pb-12 lg:px-20 lg:pt-[200px] lg:pb-16">
      <div className="w-full max-w-[1280px]">
        <SectionHeader eyebrow="Không cần tự tìm mọi câu trả lời" lines={['Có người cùng bạn,', 'từng bước']} />
      </div>

      <div className="grid w-full max-w-[1280px] grid-cols-1 gap-6 md:grid-cols-3">
        {/* 01 — the assistant, shown as a real exchange */}
        <Card delay={0} className="justify-end gap-5 bg-primary-400">
          <Icon name="sparkles" size={240} className="pointer-events-none absolute top-[72px] left-[88px] -translate-x-1/2 -translate-y-1/2 text-primary-500 opacity-20" />
          <CardIndex n="01." />
          <div className="relative flex flex-1 flex-col justify-center gap-3 py-4" aria-hidden>
            <p className="pop ml-auto max-w-[85%] rounded-24 rounded-br-[8px] bg-white px-4 py-2.5 text-s font-medium text-text-neutral-primary [--d:200ms]">
              Hạn nộp hồ sơ là khi nào?
            </p>
            <div className="pop flex max-w-[92%] items-start gap-2 [--d:520ms]">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary-500 text-warning-500">
                <Icon name="sparkles" size={14} />
              </span>
              <p className="rounded-24 rounded-tl-[8px] bg-primary-500/70 px-4 py-2.5 text-s ring-1 ring-white/10">
                {next?.deadline ? (
                  <>
                    Hạn <strong className="font-semibold text-warning-500">{formatDate(next.deadline)}</strong>, còn {daysLeft(next.deadline)} ngày.
                  </>
                ) : (
                  'Dự án chưa mở đợt nhận hồ sơ.'
                )}
                <span className="mt-1 flex items-center gap-1.5 text-[12px] text-primary-50">
                  <Icon name="book-open" size={12} /> Nguồn: thông báo tiếp nhận
                </span>
              </p>
            </div>
          </div>
          <CardText title={['Hỏi ngay', 'khi chưa rõ']} body="Trợ lý trả lời theo tài liệu hướng dẫn đã duyệt, có ghi nguồn. Không cần đăng nhập." />
          <div className="relative z-[2]">
            <LinkButton href={routes.assistant}>Trò chuyện với trợ lý</LinkButton>
          </div>
        </Card>

        {/* 02 — original layout: text on top, the building rising from the bottom */}
        <Card delay={110} light="white" className="gap-5 bg-warning-500 pb-[200px] text-text-neutral-primary sm:pb-[220px]">
          <img
            src={buildingCutout}
            alt=""
            className="pointer-events-none absolute bottom-0 left-[calc(50%+73.83px)] h-[239px] w-[357px] max-w-none -translate-x-1/2 object-cover transition-transform duration-700 ease-out group-hover:-translate-y-2"
          />
          <CardIndex n="02." dark />
          <CardText className="pt-4" title={['Biết giấy tờ', 'còn thiếu gì']} body="Trả lời 3 câu để có danh sách giấy tờ riêng: giấy nào đã có, giấy nào còn thiếu, xin ở đâu." />
          <div className="relative z-[2]">
            <LinkButton tone="dark" href={routes.profile}>
              Mở hồ sơ của tôi
            </LinkButton>
          </div>
        </Card>

        {/* 03 — original layout: the photo, text at the bottom */}
        <Card delay={220} className="justify-end gap-5">
          <img
            src={supportCard}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-600 via-primary-600/60 to-primary-600/20" />
          <div className="relative flex flex-1 flex-col">
            <CardIndex n="03." />
          </div>
          <CardText title={['Có người', 'cùng gỡ vướng']} body="Tư vấn viên NOX xem lại hồ sơ cùng bạn, miễn phí. Không thu tiền, không hứa chắc được mua." />
          <div className="relative z-[2]">
            <LinkButton href={routes.advisor}>Nhờ tư vấn viên</LinkButton>
          </div>
        </Card>
      </div>

      <p data-reveal className="flex w-full max-w-[1280px] items-start gap-2 text-m text-primary-50">
        <Icon name="circle-info" className="mt-1 shrink-0 text-warning-500" />
        Trợ lý và tư vấn viên giúp bạn chuẩn bị. Việc ai được mua do cơ quan xét duyệt và chủ đầu tư quyết định.
      </p>
    </section>
  )
}
