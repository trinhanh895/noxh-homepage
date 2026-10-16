import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

/*
 * Heading roles on inner pages (keep them consistent):
 *  - Page title (h1):       headline uppercase, 32 → 44px
 *  - Section title (h2):    headline uppercase, 24px (app pages) or 32px (reading pages like a project)
 *  - Card / item title:     Inter semibold, 20px — never Fahkwang, never a trailing period
 */

/* White rounded content panel used by every inner page (same frame as the project detail).
 * `fill` makes it exactly one viewport tall (minus the 80px header and 20px bottom gap) for app-like pages. */
export function PageShell({ children, width = 1280, fill = false }: { children: ReactNode; width?: number; fill?: boolean }) {
  return (
    <main
      id="noi-dung"
      tabIndex={-1}
      className={`outline-none ${fill ? 'h-[calc(100dvh-100px)] min-h-[560px] py-5 lg:py-10' : 'pt-10 pb-[120px] lg:pt-16'} surface-light mx-3 mb-5 flex w-[calc(100%-24px)] justify-center rounded-32 bg-white px-4 text-text-neutral-primary sm:mx-5 sm:w-[calc(100%-40px)] sm:rounded-40 sm:px-5`}
    >
      <div className={`${fill ? 'min-h-0 gap-5' : 'gap-10'} flex w-full flex-col`} style={{ maxWidth: width }}>
        {children}
      </div>
    </main>
  )
}

export function PageHeader({
  eyebrow,
  lines,
  description,
  aside,
  compact = false,
}: {
  eyebrow?: string
  lines: string[]
  description?: ReactNode
  aside?: ReactNode
  /** Hide the description on small screens (app pages where space is precious) */
  compact?: boolean
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end">
      <div className="flex flex-1 flex-col items-start gap-3">
        {eyebrow && <p className="text-s font-semibold text-primary-400">{eyebrow}</p>}
        <h1 className="headline text-headline-m uppercase lg:text-headline-l">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        {description && (
          <p className={`${compact ? 'hidden sm:block' : ''} max-w-[640px] text-m text-text-neutral-secondary`}>{description}</p>
        )}
      </div>
      {aside}
    </header>
  )
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="inline-flex min-h-11 w-fit items-center gap-2 text-s font-semibold text-primary-500 hover:underline">
      <Icon name="arrow-left" />
      {children}
    </a>
  )
}

/* Faded note for reassurance or disclaimers. Tone "warning" is for things that can cost the user (scams, deadlines). */
export function Notice({ children, tone = 'info', icon }: { children: ReactNode; tone?: 'info' | 'warning'; icon?: string }) {
  return (
    <div
      className={`${tone === 'warning' ? 'bg-warning-50' : 'bg-primary-50'} flex items-start gap-3 rounded-24 px-5 py-4 text-s text-text-neutral-primary`}
    >
      <Icon
        name={icon ?? (tone === 'warning' ? 'triangle-exclamation' : 'circle-info')}
        variant="regular"
        className={`mt-0.5 ${tone === 'warning' ? 'text-warning-700' : 'text-primary-500'}`}
      />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

/* Status is always text + icon, never colour alone. Tags must not look like buttons. */
const TAG = {
  open: { cls: 'bg-bg-success-faded text-success-700', icon: 'circle-check' },
  upcoming: { cls: 'bg-bg-input text-text-neutral-primary', icon: 'clock' },
  todo: { cls: 'bg-info-50 text-info-700', icon: 'circle' },
  doing: { cls: 'bg-warning-50 text-warning-700', icon: 'hourglass-half' },
  done: { cls: 'bg-bg-success-faded text-success-700', icon: 'circle-check' },
  later: { cls: 'bg-bg-input text-text-neutral-secondary', icon: 'clock' },
} as const

export function StatusTag({ tone, size = 'm', children }: { tone: keyof typeof TAG; size?: 's' | 'm'; children: ReactNode }) {
  const t = TAG[tone]
  const sz = size === 's' ? 'gap-1 rounded-12 px-2 py-0.5 text-[12px]' : 'gap-1.5 rounded-12 px-2.5 py-1 text-s'
  return (
    <span className={`${t.cls} ${sz} inline-flex shrink-0 items-center font-medium whitespace-nowrap`}>
      <Icon name={t.icon} variant={tone === 'todo' ? 'regular' : 'solid'} size={size === 's' ? 11 : 12} />
      {children}
    </span>
  )
}

/* Accessible confirm dialog for destructive actions */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby="confirm-title"
      className="surface-light m-auto w-[min(440px,calc(100vw-32px))] rounded-32 bg-white p-0 text-text-neutral-primary backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <h2 id="confirm-title" className="text-xl font-semibold">
          {title}
        </h2>
        <div className="text-m text-text-neutral-secondary">{body}</div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-pill border border-primary-500 px-5 text-m font-semibold text-primary-500 hover:bg-primary-25"
          >
            Giữ lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-pill bg-danger-600 px-5 text-m font-semibold text-white hover:bg-danger-700"
          >
            <Icon name="trash-can" variant="regular" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
