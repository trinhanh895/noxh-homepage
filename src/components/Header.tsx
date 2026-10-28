import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { routes } from '../routes'
import { projectSummaries } from '../data/projects'
import { maskShort, signOut, useAccount } from '../lib/account'

const menus = [
  { label: 'Dự án', badge: String(projectSummaries.length), href: routes.projects, match: '#/du-an/', icon: 'buildings', hint: 'Xem các dự án đang và sắp nhận hồ sơ' },
  { label: 'Hành trình', href: routes.journey, match: routes.journey, icon: 'route', hint: '5 bước từ tìm hiểu đến tự nộp hồ sơ' },
  { label: 'Trợ lý NOXH', href: routes.assistant, match: routes.assistant, icon: 'comment-dots', hint: 'Hỏi đáp, xem giấy tờ cần chuẩn bị' },
  { label: 'Hồ sơ của tôi', href: routes.profile, match: routes.profile, icon: 'folder-open', hint: 'Danh sách giấy tờ và dự án đang theo dõi' },
]

export function Header({ current = '' }: { current?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex justify-center px-5 lg:px-20">
      <a
        href="#noi-dung"
        onClick={(e) => {
          // the hash is the router — focus the content instead of navigating
          e.preventDefault()
          const main = document.getElementById('noi-dung')
          main?.focus()
          main?.scrollIntoView()
        }}
        className="sr-only rounded-pill bg-white px-4 py-2 text-text-neutral-primary focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Bỏ qua, tới nội dung chính
      </a>
      <div className="flex w-full max-w-[1600px] items-center gap-6 py-4">
        <a href={routes.home} className="flex items-center gap-2" aria-label="NOX — Trang chủ">
          <span className="size-6 bg-white" aria-hidden />
          <span className="headline text-xl capitalize">NOX</span>
        </a>

        <nav aria-label="Điều hướng chính" className="hidden flex-1 items-center justify-end lg:flex">
          {menus.map((m) => {
            const active = current.startsWith(m.match)
            return (
              <a
                key={m.label}
                href={m.href}
                data-nav
                aria-current={active ? 'page' : undefined}
                className={`${active ? 'text-warning-500' : 'hover:text-warning-500'} flex items-center gap-2 p-3 text-m font-medium whitespace-nowrap`}
              >
                {m.label}
                {m.badge && <sup className="text-[10.32px] leading-6">{m.badge}</sup>}
              </a>
            )
          })}
        </nav>

        {/* Guests: Đăng nhập (neutral on solid). Signed in: the account chip. The assistant lives in the corner chat. */}
        <LoginButton />
        <AccountChip />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="ml-auto inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border border-white/30 px-4 text-m font-semibold transition hover:bg-white/10 sm:ml-0 lg:hidden"
        >
          <Icon name="bars" />
          Menu
        </button>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} current={current} />
    </header>
  )
}

function MobileMenu({ open, onClose, current }: { open: boolean; onClose: () => void; current: string }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  // Following any link inside closes the sheet
  useEffect(() => {
    if (!open) return
    const close = () => onClose()
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [open, onClose])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Menu"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-primary-600 p-0 text-white backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col gap-6 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="size-6 bg-white" aria-hidden />
            <span className="headline text-xl capitalize">NOX</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border border-white/30 px-4 text-m font-semibold hover:bg-white/10"
          >
            <Icon name="xmark" />
            Đóng
          </button>
        </div>

        <nav aria-label="Điều hướng chính" className="flex flex-col">
          {menus.map((m) => {
            const active = current.startsWith(m.match)
            return (
              <a
                key={m.label}
                href={m.href}
                data-nav
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-16 items-center gap-4 border-b border-white/10 py-4"
              >
                <span
                  className={`${active ? 'bg-warning-500 text-primary-600' : 'bg-white/10 text-warning-500'} flex size-11 shrink-0 items-center justify-center rounded-pill`}
                >
                  <Icon name={m.icon} variant="regular" size={18} />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className={`${active ? 'text-warning-500' : ''} text-l font-semibold`}>{m.label}</span>
                  <span className="text-s text-primary-50">{m.hint}</span>
                </span>
                <Icon name="angle-right" className="text-white/60" />
              </a>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <AccountRow onClose={onClose} />
          <a
            href={routes.advisor}
            onClick={onClose}
            className="glass-gold inline-flex h-12 items-center justify-center gap-2 rounded-pill text-m font-semibold text-primary-500"
          >
            <Icon name="headset" />
            Nhờ tư vấn viên
          </a>
          <a href={routes.privacy} onClick={onClose} className="inline-flex min-h-11 items-center justify-center text-s text-primary-50 underline">
            Dữ liệu và quyền riêng tư
          </a>
        </div>
      </div>
    </dialog>
  )
}

/* Signed in: "•••• 4567" with Hồ sơ của tôi / Đăng xuất. Guests see nothing here (no login button in the bar). */
function AccountChip() {
  const acc = useAccount()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', off)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', off)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  if (!acc) return null
  return (
    <div ref={ref} className="relative ml-auto hidden sm:block lg:ml-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill border border-white/30 pr-3 pl-1.5 text-s font-semibold tabular-nums hover:bg-white/10"
      >
        <span className="flex size-7 items-center justify-center rounded-pill bg-white/15" aria-hidden>
          <Icon name="user" variant="regular" size={14} />
        </span>
        {maskShort(acc.phone)}
        <Icon name="angle-down" size={12} />
      </button>
      {open && (
        <div role="menu" className="surface-light absolute top-12 right-0 z-30 flex w-60 flex-col overflow-hidden rounded-16 bg-white p-1.5 text-text-neutral-primary shadow-[0_16px_40px_rgb(0_0_0/0.2)]">
          <p className="px-3 pt-2 pb-1 text-[12px] text-text-neutral-secondary">Đăng nhập bằng số {maskShort(acc.phone)}</p>
          <a role="menuitem" href={routes.profile} data-nav onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-12 px-3 text-s font-semibold hover:bg-primary-25">
            <Icon name="folder-open" variant="regular" size={16} className="text-primary-500" />
            Hồ sơ của tôi
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              signOut()
              setOpen(false)
            }}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-12 px-3 text-left text-s font-semibold hover:bg-primary-25"
          >
            <Icon name="arrow-left" size={16} className="text-primary-500" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function AccountRow({ onClose }: { onClose: () => void }) {
  const acc = useAccount()
  if (!acc)
    return (
      <p className="text-center text-s text-primary-50">
        Đã có hồ sơ trên máy khác?{' '}
        <a href={routes.login} onClick={onClose} className="font-semibold text-warning-500 underline underline-offset-2">
          Đăng nhập
        </a>
      </p>
    )
  return (
    <div className="flex items-center justify-between gap-3 rounded-16 bg-white/10 px-4 py-3 text-s">
      <span className="flex items-center gap-2">
        <Icon name="user" variant="regular" size={16} className="text-warning-500" />
        Đăng nhập bằng số {maskShort(acc.phone)}
      </span>
      <button type="button" onClick={signOut} className="cursor-pointer font-semibold text-warning-500 underline underline-offset-2">
        Đăng xuất
      </button>
    </div>
  )
}

/* Button Common · neutral on solid: white pill on the green header */
function LoginButton() {
  const acc = useAccount()
  if (acc) return null
  return (
    <a
      href={routes.login}
      className="ml-auto hidden h-10 shrink-0 items-center justify-center gap-2 rounded-pill bg-white px-5 text-s font-semibold whitespace-nowrap text-text-neutral-primary transition hover:bg-primary-25 active:scale-[0.98] sm:inline-flex lg:ml-0"
    >
      <Icon name="user" variant="regular" size={16} />
      Đăng nhập
    </a>
  )
}
