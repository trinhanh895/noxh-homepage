import type { ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { daysLeft, formatDate } from '../data/projects'
import { qrProjects, qrRoutes, type QrProject } from '../data/qr'

/* First screen after scanning the QR on a brochure or slide. Phone first: confirm the project,
 * say who NOX is, then two ways on — prepare the dossier now, or read about the project first. */
export function QrLanding({ slug }: { slug: string }) {
  const p = qrProjects[slug]
  if (!p) return <NotFound />
  const left = daysLeft(p.deadline)

  return (
    <div className="min-h-dvh bg-primary-600 text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
        <TopBar />

        {/* The photo the brochure showed, so people recognise the project at a glance */}
        <div className="relative mx-3 overflow-hidden rounded-32">
          <img src={p.cover} alt={`Ảnh minh hoạ ${p.name}`} className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-600/90 via-primary-600/10 to-transparent" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-pill bg-bg-success-faded px-3 py-1 text-s font-semibold text-success-700">
            <span className="size-1.5 rounded-full bg-success-700" aria-hidden />
            Đang nhận hồ sơ
          </span>
          <div className="absolute inset-x-5 bottom-5 flex flex-col gap-1">
            <p className="flex items-center gap-1.5 text-s text-primary-50">
              <Icon name="location-dot" size={14} className="text-warning-500" />
              {p.address}
            </p>
            <h1 className="headline text-headline-xs capitalize">{p.name}</h1>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-[max(24px,env(safe-area-inset-bottom))]">
          <Deadline p={p} left={left} />

          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Loại căn', p.units],
              ['Diện tích', p.area],
              ['Giá bán', p.price],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 rounded-16 bg-white/5 px-2 py-3 ring-1 ring-white/10">
                <dt className="text-[12px] text-primary-50">{k}</dt>
                <dd className="text-s font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          {/* The two entry points */}
          <div className="flex flex-col gap-3">
            <a
              href={qrRoutes.dossier(p.slug)}
              className="group flex items-center gap-4 rounded-24 bg-warning-500 p-4 text-primary-600 shadow-[0_12px_32px_rgb(0_0_0/0.25)] transition active:scale-[0.99]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-16 bg-primary-600 text-warning-500" aria-hidden>
                <Icon name="folder-open" variant="regular" size={22} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-m font-semibold">Tôi muốn chuẩn bị hồ sơ</span>
                <span className="text-s">3 câu hỏi, khoảng 1 phút · chưa cần tài khoản</span>
              </span>
              <Icon name="arrow-right" size={20} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={p.detailHref}
              className="group flex items-center gap-4 rounded-24 bg-white/5 p-4 ring-1 ring-white/15 transition hover:bg-white/10 active:scale-[0.99]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-16 bg-white/10 text-warning-500" aria-hidden>
                <Icon name="buildings" variant="regular" size={22} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-m font-semibold">Tôi muốn tìm hiểu dự án trước</span>
                <span className="text-s text-primary-50">Vị trí, loại căn, ai được mua</span>
              </span>
              <Icon name="arrow-right" size={20} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Who NOX is — people arrive from the investor's material and don't know us yet */}
          <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-5 text-s text-primary-50">
            <p className="flex items-start gap-2">
              <Icon name="shield-check" size={16} className="mt-0.5 shrink-0 text-warning-500" />
              <span>
                <strong className="font-semibold text-white">NOX là dịch vụ hỗ trợ miễn phí, không phải chủ đầu tư.</strong> Không thu tiền, không giữ suất,
                không nộp hồ sơ thay bạn.
              </span>
            </p>
            <p className="text-[12px] text-primary-50/80">{p.source}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Deadline({ p, left }: { p: QrProject; left: number }) {
  return (
    <div className="flex items-center gap-4">
      <p className="flex flex-col items-center justify-center rounded-24 bg-white px-4 py-3 text-primary-600">
        <span className="headline text-headline-m leading-none">{Math.max(left, 0)}</span>
        <span className="text-[12px] font-semibold">ngày</span>
      </p>
      <div className="flex flex-col gap-0.5">
        <p className="text-m font-semibold">{left < 0 ? 'Đã hết hạn nhận hồ sơ' : 'Còn lại để nộp hồ sơ'}</p>
        <p className="text-s text-primary-50">
          Nhận hồ sơ {formatDate(p.opened).slice(0, 5)} – {formatDate(p.deadline)}
        </p>
      </div>
    </div>
  )
}

export function TopBar({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-[max(16px,env(safe-area-inset-top))] pb-4">
      <span className="flex items-center gap-2 text-m font-semibold">
        <span className="size-6 rounded-[6px] bg-white" aria-hidden />
        NOX
      </span>
      {children ?? <span className="ml-auto rounded-pill bg-white/10 px-3 py-1 text-[12px] font-semibold text-primary-50">Hỗ trợ miễn phí</span>}
    </header>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-primary-600 p-6 text-center text-white">
      <p className="headline text-headline-xs capitalize">Không tìm thấy dự án</p>
      <p className="text-m text-primary-50">Mã QR có thể đã cũ. Bạn xem danh sách dự án trên trang NOX nhé.</p>
      <a href="#du-an" className="inline-flex h-12 items-center rounded-pill bg-warning-500 px-6 font-semibold text-primary-600">
        Xem các dự án
      </a>
    </div>
  )
}
