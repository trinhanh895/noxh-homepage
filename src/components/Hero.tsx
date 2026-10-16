import { useId, useState } from 'react'
import hero from '../assets/hero.webp'
import glowBottom from '../assets/glow-bottom.svg'
import glowRight from '../assets/glow-right.svg'
import glowLeft from '../assets/glow-left.svg'
import { Icon } from './Icon'
import { Words } from './Words'
import { DATA_UPDATED_AT, daysLeft, formatDate, projectSummaries, projectsByUrgency, statusLabel, type ProjectSummary } from '../data/projects'
import { routes, withParams } from '../routes'

const promises = ['Miễn phí', 'Không nộp hồ sơ thay bạn', 'Không thu tiền giữ suất']

// Content column inset — shared by the copy block and the status strip so their left edges line up
const INSET = 'px-5 sm:px-8 md:px-[120px]'

export function Hero() {
  const open = projectsByUrgency().filter((p) => p.status === 'open' && p.deadline && daysLeft(p.deadline) >= 0)
  const next = open[0]

  return (
    <section aria-labelledby="hero-title" className="relative flex w-full justify-center px-3 sm:px-5">
      <div className="hero-panel edge-light edge-now relative flex min-h-[640px] flex-1 flex-col rounded-32 sm:rounded-40 md:h-[829px]">
        {/* Photo + scrim are clipped to the rounded frame; the search dropdown is not */}
        <div className="absolute inset-0 overflow-hidden rounded-32 sm:rounded-40" aria-hidden>
          <img
            src={hero}
            alt=""
            className="hero-photo pointer-events-none absolute inset-x-0 bottom-0 h-full w-full object-cover object-[70%_100%] md:bottom-[-19px] md:h-[929px] md:object-right-bottom"
          />
          {/* Scrim keeps the copy ≥4.5:1 over the bright facades — top-down on phones, left-to-right on wider screens */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-600/90 via-primary-600/70 to-primary-600/20 md:bg-gradient-to-r md:from-primary-600/90 md:via-primary-600/55 md:to-transparent" />
        </div>

        <div className={`relative z-10 flex flex-1 flex-col items-start justify-center gap-5 pt-12 pb-8 md:py-16 ${INSET}`}>
          <h1 id="hero-title" className="headline hero-words w-full max-w-[820px] text-balance text-headline-m uppercase sm:text-headline-l lg:text-headline-xl">
            <span className="block">
              <Words text="Nhà ở xã hội Hà Nội" />{' '}
            </span>
            <span className="block text-warning-500">
              <Words text="Chuẩn bị hồ sơ đúng, đủ" start={5} />
            </span>
          </h1>
          <p className="hero-in w-full max-w-[520px] text-l text-primary-50 [animation-delay:700ms]">
            Tìm dự án đang nhận hồ sơ, xem hạn nộp và giấy tờ cần chuẩn bị.
          </p>

          <div className="hero-in relative z-20 w-full max-w-[680px] pt-3 [animation-delay:820ms]">
            <ProjectSearch />
          </div>
          <ul className="hero-in flex flex-wrap gap-x-6 gap-y-2 text-s font-medium [animation-delay:940ms]" aria-label="Cam kết của NOX">
            {promises.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Icon name="circle-check" className="text-warning-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* What's open now — aligned to the copy column above */}
        <div className={`hero-in relative pb-5 [animation-delay:950ms] md:pb-10 ${INSET}`}>
          <a
            href={routes.projects}
            className="glass-neutral flex flex-col gap-1 rounded-24 px-5 py-4 text-text-neutral-primary transition hover:brightness-105 sm:flex-row sm:items-center sm:gap-4 md:max-w-[880px]"
          >
            <span className="flex items-center gap-2 text-s font-semibold text-success-700">
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success-700/60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success-700" />
              </span>
              {open.length > 0 ? `${open.length} dự án đang nhận hồ sơ` : 'Chưa có dự án nhận hồ sơ'}
            </span>
            {next?.deadline && (
              <span className="flex-1 text-m">
                Gần nhất: <strong className="font-semibold">{next.name}</strong> — hạn {formatDate(next.deadline)}{' '}
                <span className="font-semibold text-warning-700">(còn {daysLeft(next.deadline)} ngày)</span>
              </span>
            )}
            <span className="flex items-center gap-2 text-s font-semibold whitespace-nowrap text-primary-500">
              Xem tất cả <Icon name="arrow-right" />
            </span>
          </a>
          <p className="sr-only">Cập nhật {formatDate(DATA_UPDATED_AT)}, dữ liệu mẫu</p>
        </div>
      </div>
      {/* Edge glows */}
      <img src={glowBottom} alt="" width={600} height={4} className="absolute bottom-[-2px] left-[calc(50%+280px)] hidden -translate-x-1/2 md:block" />
      <img src={glowRight} alt="" width={3} height={600} className="absolute top-[calc(50%+0.5px)] right-[19px] hidden -translate-y-1/2 md:block" />
      <img src={glowLeft} alt="" width={2} height={400} className="absolute top-[73px] left-[19px] hidden md:block" />
    </section>
  )
}

/* Accent-insensitive: "gia lam" finds "Gia Lâm" */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

const AREAS = [...new Set(projectSummaries.map((p) => p.area))]
const destination = (p: ProjectSummary) => p.href ?? withParams(routes.assistant, { prj: p.id })

/* Combobox: type a project or district, pick a suggestion (mouse, touch or ↑ ↓ Enter) */
function ProjectSearch() {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()

  const q = fold(query.trim())
  const results = projectsByUrgency().filter((p) => (!area || p.area === area) && (!q || fold(`${p.name} ${p.area}`).includes(q)))
  const go = (p: ProjectSummary) => {
    setOpen(false)
    window.location.hash = destination(p)
  }

  return (
    <div>
      <div className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          const pick = results[active] ?? results[0]
          if (pick) go(pick)
          else setOpen(true)
        }}
        className="flex items-center gap-2 rounded-pill bg-white p-1.5 pl-5 text-text-neutral-primary shadow-[0_12px_32px_rgb(0_0_0/0.25)] surface-light"
      >
        <Icon name="search" size={20} className="text-text-neutral-secondary" />
        <label htmlFor="tim-du-an" className="sr-only">
          Tìm dự án theo tên hoặc khu vực
        </label>
        <input
          id="tim-du-an"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={query}
          placeholder="Tìm dự án hoặc khu vực"
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((i) => Math.min(i + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className="min-h-12 w-full min-w-0 bg-transparent text-m outline-none placeholder:text-text-neutral-secondary"
        />
        {/* Area picker: narrows the suggestions; hidden on the narrowest phones where typing a district does the same */}
        <label className="relative hidden shrink-0 items-center border-l border-border-neutral sm:flex">
          <span className="sr-only">Khu vực</span>
          <Icon name="location-dot" className="pointer-events-none absolute left-4 text-primary-500" />
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value)
              setActive(0)
              setOpen(true)
            }}
            className="h-12 cursor-pointer appearance-none bg-transparent pr-9 pl-10 text-m font-medium text-text-neutral-primary outline-none"
          >
            <option value="">Tất cả khu vực</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <Icon name="angle-down" className="pointer-events-none absolute right-3 text-text-neutral-secondary" />
        </label>
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-pill bg-warning-500 px-5 text-m font-semibold text-primary-600 transition hover:brightness-105"
        >
          <span className="max-sm:sr-only">Tìm dự án</span>
          <Icon name="arrow-right" className="sm:hidden" />
        </button>
      </form>

      {open && (
        <div className="surface-light absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-24 bg-white text-text-neutral-primary shadow-[0_16px_40px_rgb(0_0_0/0.3)]">
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Gợi ý dự án" className="max-h-[320px] overflow-y-auto py-2">
              {!q && <li className="px-5 pt-1 pb-2 text-s font-semibold text-text-neutral-secondary">Dự án theo hạn nộp gần nhất</li>}
              {results.map((p, i) => (
                <li
                  key={p.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    go(p)
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`${i === active ? 'bg-primary-25' : ''} flex cursor-pointer items-center gap-4 px-5 py-3`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-primary-50 text-primary-500" aria-hidden>
                    <Icon name="buildings" size={18} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-m font-semibold">{p.name}</span>
                    <span className="text-s text-text-neutral-secondary">
                      {p.area}, Hà Nội · {statusLabel[p.status]}
                      {p.deadline && daysLeft(p.deadline) >= 0 && ` · còn ${daysLeft(p.deadline)} ngày`}
                    </span>
                  </span>
                  <Icon name="arrow-right" className="text-primary-500" />
                </li>
              ))}
            </ul>
          ) : (
            <div id={listId} role="status" className="flex flex-col gap-2 px-5 py-4">
              <p className="text-m">
                Chưa tìm thấy dự án{query ? <> “<strong className="font-semibold">{query}</strong>”</> : ''}{area ? ` ở ${area}` : ''}.
              </p>
              <a href={routes.assistant} className="text-s font-semibold text-primary-500 underline underline-offset-2">
                Hỏi trợ lý về khu vực bạn muốn ở
              </a>
            </div>
          )}
        </div>
      )}
      </div>

    </div>
  )
}
