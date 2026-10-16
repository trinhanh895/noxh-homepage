import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { daysLeft, formatDate, type ProjectSummary } from '../data/projects'
import { baseDocs, questions } from '../data/qr'
import { docsFor, dossierHref, dossierProject, listSlugs, progressOf, readDossier } from '../lib/dossiers'
import { routes, withParams } from '../routes'

/* AI touchpoints on the project page, and "Đối chiếu với trường hợp của bạn".
 * Personalisation comes from the dossier's three answers (guest or signed in), never a score:
 * each check says khớp / cần lưu ý / chưa đủ thông tin, and why. */

/* ── the person's case for this project, re-read when they come back from the dossier or the chat ── */
export function useMyCase(slug: string) {
  const [, tick] = useState(0)
  useEffect(() => {
    const f = () => tick((x) => x + 1)
    window.addEventListener('focus', f)
    window.addEventListener('storage', f)
    window.addEventListener('hashchange', f)
    return () => {
      window.removeEventListener('focus', f)
      window.removeEventListener('storage', f)
      window.removeEventListener('hashchange', f)
    }
  }, [])
  const s = readDossier(slug)
  const answers = s?.answers ?? questions.map(() => null)
  const has = answers.some((a) => a !== null)
  const open = s?.stage === 'open' ? progressOf(s) : null
  // papers already checked in another folder can be reused here
  const reuse = listSlugs()
    .filter((x) => x !== slug)
    .flatMap((x) => {
      const d = readDossier(x)
      return d ? Object.entries(d.docs).filter(([id, v]) => v.s === 'checked' && baseDocs.some((b) => b.id === id)).map(([id]) => ({ id, from: x })) : []
    })
  const [marriage, work, home] = answers
  const unit = marriage === 0 ? 'Căn 1 phòng ngủ' : marriage === 1 ? 'Căn 2 phòng ngủ' : null
  return { s, answers, has, open, reuse, marriage, work, home, unit, docs: docsFor(answers) }
}
export type MyCase = ReturnType<typeof useMyCase>

/* One marker for everything the assistant does on this page */
export function AiTag({ children = 'Trợ lý' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-warning-50 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-warning-700">
      <Icon name="sparkles" size={11} />
      {children}
    </span>
  )
}

/* The assistant's mark (same as its avatar in the chat) */
export function AiMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-pill bg-primary-500 text-warning-500 ring-4 ring-warning-500/15"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="flex motion-safe:animate-[ai-glint_4s_ease-in-out_infinite]">
        <Icon name="sparkles" size={Math.round(size * 0.45)} />
      </span>
    </span>
  )
}

const ask = (prj: string, q: string) => withParams(routes.assistant, { prj, q })

/* A quiet "ask about this" line under a section */
export function AskRow({ prj, q, children }: { prj: string; q: string; children: ReactNode }) {
  return (
    <a href={ask(prj, q)} className="group inline-flex w-fit items-center gap-2.5 text-s text-text-neutral-secondary">
      <AiMark size={26} />
      <span>{children}</span>
      <span className="font-semibold whitespace-nowrap text-primary-500 group-hover:underline">Hỏi trợ lý →</span>
    </a>
  )
}

/* "Tóm tắt nhanh" under the title — the assistant's short answer to "what is this project", with its source */
export function AiSummary({ p, lines }: { p: ProjectSummary; lines: string[] }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-3 rounded-24 bg-primary-25 p-4 ring-1 ring-primary-500/10 md:p-5">
      <p className="flex items-center gap-2 text-s font-semibold">
        Tóm tắt nhanh <AiTag />
      </p>
      <ul className="flex flex-col gap-1.5 text-s">
        {lines.map((l) => (
          <li key={l} className="flex gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
            {l}
          </li>
        ))}
      </ul>
      <p className="flex flex-wrap items-center justify-between gap-2 border-t border-primary-500/10 pt-3 text-[12px] text-text-neutral-secondary">
        <span className="flex items-center gap-1.5">
          <Icon name="book-open" size={12} className="text-primary-500" />
          Nguồn: Thông báo tiếp nhận {p.name} (mẫu)
        </span>
        <a href={ask(p.id, `Tóm tắt giúp tôi dự án ${p.name}`)} className="font-semibold text-primary-500 hover:underline">
          Hỏi thêm về dự án →
        </a>
      </p>
    </div>
  )
}

/* Quick questions inside the status card */
export function AskChips({ prj, qs }: { prj: string; qs: string[] }) {
  return (
    <div className="flex flex-col gap-2 border-t border-border-divider pt-4">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-text-neutral-secondary">
        Hỏi nhanh <AiTag />
      </p>
      <div className="flex flex-col gap-1.5">
        {qs.map((q) => (
          <a
            key={q}
            href={ask(prj, q)}
            className="flex min-h-10 items-center justify-between gap-2 rounded-12 border border-border-neutral px-3 text-s transition hover:border-primary-500 hover:bg-primary-25"
          >
            {q}
            <Icon name="arrow-right" size={12} className="shrink-0 text-primary-500" />
          </a>
        ))}
      </div>
    </div>
  )
}

/* ── "Đối chiếu với trường hợp của bạn" ─────────────────────────────────── */

type Kind = 'ok' | 'warn' | 'unknown'
type Check = { kind: Kind; label: string; text: string; why?: string; to: string }

function checksFor(p: ProjectSummary, c: MyCase): Check[] {
  const out: Check[] = []
  // Điều kiện nhà ở
  out.push(
    c.home === 0 || c.home === 1
      ? { kind: 'ok', label: 'Điều kiện nhà ở', text: 'Chưa có nhà thuộc sở hữu tại Hà Nội', why: c.home === 0 ? 'Bạn đang thuê nhà.' : 'Bạn đang ở nhờ người thân.', to: '#dieu-kien' }
      : c.home === 2
        ? { kind: 'warn', label: 'Điều kiện nhà ở', text: 'Nhà chật: cần diện tích bình quân dưới 15 m² mỗi người', why: 'Cần giấy xác nhận diện tích nhà của UBND phường.', to: '#dieu-kien' }
        : { kind: 'unknown', label: 'Điều kiện nhà ở', text: 'Chưa rõ tình trạng nhà ở của bạn', why: 'Bạn chọn "Chưa rõ" ở câu nơi ở.', to: '#dieu-kien' },
  )
  // Thu nhập
  out.push(
    c.work === 0
      ? { kind: 'ok', label: 'Chứng minh thu nhập', text: 'Dùng bảng lương 3 tháng gần nhất', why: 'Bạn làm công ty, có hợp đồng. Mức thu nhập so với mức trần chưa đối chiếu được.', to: '#dieu-kien' }
      : c.work === 1
        ? { kind: 'warn', label: 'Chứng minh thu nhập', text: 'Làm tự do: tự khai thu nhập, cần UBND phường xác nhận', why: 'Thường mất thêm thời gian, nên làm sớm.', to: '#dieu-kien' }
        : c.work === 2
          ? { kind: 'ok', label: 'Chứng minh thu nhập', text: 'Dùng giấy lương hưu', why: 'Bạn đã nghỉ hưu.', to: '#dieu-kien' }
          : { kind: 'unknown', label: 'Chứng minh thu nhập', text: 'Chưa rõ loại giấy thu nhập', why: 'Bạn chọn "Chưa rõ" ở câu công việc.', to: '#dieu-kien' },
  )
  // Kịp hạn nộp
  if (p.deadline) {
    const left = daysLeft(p.deadline)
    const waiting = c.s ? Object.entries(c.s.docs).find(([, v]) => v.s === 'missing' && v.expected) : undefined
    const name = waiting ? c.docs.find((d) => d.id === waiting[0])?.name : undefined
    if (waiting && name) {
      const late = waiting[1].expected! > p.deadline
      out.push({
        kind: late ? 'warn' : 'ok',
        label: 'Kịp hạn nộp',
        text: `${name} dự kiến có ${formatDate(waiting[1].expected!).slice(0, 5)}, ${late ? 'sau' : 'trước'} hạn nộp ${formatDate(p.deadline).slice(0, 5)}`,
        why: late ? 'Có thể không kịp — nên hỏi nơi cấp có làm nhanh hơn được không.' : 'Trong lúc chờ, bạn làm các giấy khác.',
        to: dossierHref(p.id),
      })
    } else if (c.open) {
      out.push({
        kind: left >= 14 ? 'ok' : 'warn',
        label: 'Kịp hạn nộp',
        text: `${c.open.checked} trên ${c.open.docs.length} giấy đã soát, còn ${left} ngày`,
        why: left >= 14 ? 'Đủ thời gian nếu làm đều mỗi tuần vài giấy.' : 'Thời gian còn ít, ưu tiên giấy cần xin ở nơi khác.',
        to: dossierHref(p.id),
      })
    } else {
      out.push({
        kind: left >= 21 ? 'ok' : 'warn',
        label: 'Kịp hạn nộp',
        text: `Còn ${left} ngày tới hạn nộp, bộ của bạn có ${c.docs.length} giấy`,
        why: 'Xin đủ giấy thường mất 2–3 tuần.',
        to: dossierHref(p.id),
      })
    }
  }
  // Loại căn
  out.push(
    c.unit
      ? {
          kind: 'ok',
          label: 'Loại căn hợp với hộ',
          text: c.marriage === 1 ? 'Căn 2 phòng ngủ (khoảng 66 m²) hợp với hộ có vợ chồng' : 'Căn 1 phòng ngủ (khoảng 45 m²) là đủ cho một người',
          why: 'Theo câu trả lời về hôn nhân. Bạn vẫn chọn được loại khác.',
          to: '#loai-can',
        }
      : { kind: 'unknown', label: 'Loại căn hợp với hộ', text: 'Tuỳ số người ở cùng', why: 'Hỏi trợ lý để so sánh các loại căn.', to: '#loai-can' },
  )
  // Giấy dùng lại
  if (c.reuse.length) {
    const from = dossierProject(c.reuse[0].from)?.name ?? 'bìa khác'
    out.push({ kind: 'ok', label: 'Giấy dùng lại', text: `${c.reuse.length} giấy đã soát ở bìa ${from} dùng lại được`, why: 'Không cần chụp và kiểm tra lại.', to: dossierHref(p.id) })
  }
  return out
}

const KIND = {
  ok: { icon: 'check', cls: 'bg-bg-success-faded text-success-700', word: 'Khớp' },
  warn: { icon: 'triangle-exclamation', cls: 'bg-warning-50 text-warning-700', word: 'Cần lưu ý' },
  unknown: { icon: 'circle-info', cls: 'bg-bg-input text-text-neutral-secondary', word: 'Chưa đủ thông tin' },
} as const

/* "3 khớp · 2 cần lưu ý" for the status card */
export function matchCounts(p: ProjectSummary, c: MyCase) {
  if (!c.has) return null
  const rows = checksFor(p, c)
  return { ok: rows.filter((r) => r.kind === 'ok').length, warn: rows.filter((r) => r.kind === 'warn').length }
}

export function MatchBlock({ p, c, onJump }: { p: ProjectSummary; c: MyCase; onJump: (id: string) => void }) {
  const rows = c.has ? checksFor(p, c) : null
  const counts = rows ? (['ok', 'warn', 'unknown'] as const).map((k) => rows.filter((r) => r.kind === k).length) : null
  return (
    <section aria-labelledby="doi-chieu" className="ai-surface flex flex-col gap-4 rounded-24 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <AiMark size={40} />
        <div className="flex flex-1 flex-col gap-1">
          <h2 id="doi-chieu" className="flex flex-wrap items-center gap-2 text-l font-semibold">
            Đối chiếu với trường hợp của bạn <AiTag>AI · đối chiếu</AiTag>
          </h2>
          <p className="text-s text-text-neutral-secondary">Trợ lý so 3 câu trả lời và bìa hồ sơ của bạn với thông báo của dự án.</p>
          {counts && (
            <p className="flex flex-wrap gap-1.5 pt-1 text-[12px] font-semibold">
              <span className="rounded-pill bg-bg-success-faded px-2.5 py-1 text-success-700">{counts[0]} khớp</span>
              <span className="rounded-pill bg-warning-50 px-2.5 py-1 text-warning-700">{counts[1]} cần lưu ý</span>
              <span className="rounded-pill bg-bg-input px-2.5 py-1 text-text-neutral-secondary">{counts[2]} chưa đủ thông tin</span>
            </p>
          )}
        </div>
      </div>

      {rows ? (
        <ul className="flex flex-col">
          {rows.map((r) => (
            <li key={r.label} className="border-t border-border-divider first:border-t-0">
              <a
                href={r.to}
                onClick={(e) => {
                  if (!r.to.startsWith('#') || r.to.startsWith('#/')) return
                  e.preventDefault()
                  onJump(r.to.slice(1))
                }}
                className="group flex items-start gap-3 py-3"
              >
                <span className={`${KIND[r.kind].cls} mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-pill`} aria-hidden>
                  <Icon name={KIND[r.kind].icon} variant="solid" size={14} />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[12px] font-semibold text-text-neutral-secondary">
                    {r.label} · <span className="sr-only">{KIND[r.kind].word}: </span>
                    {KIND[r.kind].word}
                  </span>
                  <span className="text-m font-semibold">{r.text}</span>
                  {r.why && <span className="text-s text-text-neutral-secondary">{r.why}</span>}
                </span>
                <Icon name="angle-right" size={14} className="mt-2 shrink-0 text-text-neutral-secondary transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        /* no answers yet: the same checks, waiting for three answers */
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col opacity-60" aria-hidden>
            {['Điều kiện nhà ở', 'Chứng minh thu nhập', 'Kịp hạn nộp', 'Loại căn hợp với hộ'].map((l) => (
              <li key={l} className="flex items-center gap-3 border-t border-border-divider py-3 first:border-t-0">
                <span className="flex size-7 items-center justify-center rounded-pill bg-bg-input text-text-neutral-secondary">?</span>
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="text-[12px] font-semibold text-text-neutral-secondary">{l}</span>
                  <span className="h-2.5 w-2/3 rounded-pill bg-bg-input" />
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 rounded-16 bg-primary-25 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-s">
              <b className="font-semibold">Trả lời 3 câu ngắn</b> (hôn nhân, công việc, nơi ở) để trợ lý đối chiếu dự án này với trường hợp của bạn.
            </p>
            <a
              href={dossierHref(p.id)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-pill bg-primary-500 px-5 text-s font-semibold text-white hover:bg-primary-400"
            >
              <Icon name="list-check" size={16} />
              Trả lời 3 câu
            </a>
          </div>
        </div>
      )}
      <p className="text-[12px] text-text-neutral-secondary">
        Đối chiếu sơ bộ theo câu trả lời của bạn và thông báo của dự án (dữ liệu mẫu). Không phải kết quả xét duyệt, không dự đoán khả năng được mua.
      </p>
    </section>
  )
}

/* ── "Trợ lý giúp được gì": the assistant's jobs, framed as the worry they answer — one calm list ── */
export function StuckCards({ p }: { p: ProjectSummary }) {
  const rows = [
    { q: 'Chưa rõ giấy nào cần có?', a: 'Trả lời 3 câu, trợ lý lập bộ giấy cho trường hợp của bạn.', icon: 'list-check', cta: 'Lập bộ giấy', href: dossierHref(p.id) },
    { q: 'Lo thông tin bị thiếu hoặc lệch?', a: 'Chụp giấy, máy đọc và đối chiếu giữa các giấy.', icon: 'folder-open', cta: 'Kiểm tra giấy', href: dossierHref(p.id) },
    { q: 'Cần người giải thích kỹ hơn?', a: 'Hỏi trợ lý, hoặc nhờ tư vấn viên xem giúp.', icon: 'comment-dots', cta: 'Hỏi trợ lý', href: withParams(routes.assistant, { prj: p.id }) },
  ]
  return (
    <section aria-labelledby="vuong-mac" className="ai-surface flex flex-col gap-1 rounded-24 px-5 pt-5 pb-1">
      <div className="flex items-center gap-3">
        <AiMark size={36} />
        <div className="flex flex-col">
          <h3 id="vuong-mac" className="text-m font-semibold">
            Trợ lý giúp được gì
          </h3>
          <p className="text-s text-text-neutral-secondary">Miễn phí, trả lời có nguồn, khi cần có tư vấn viên.</p>
        </div>
      </div>
      <ul className="flex flex-col">
        {rows.map((r) => (
          <li key={r.q} className="border-t border-border-divider first:border-t-0">
            <a href={r.href} className="group flex items-center gap-4 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-primary-50 text-primary-500" aria-hidden>
                <Icon name={r.icon} variant="regular" size={18} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-m font-semibold">{r.q}</span>
                <span className="text-s text-text-neutral-secondary">{r.a}</span>
              </span>
              <span className="hidden text-s font-semibold whitespace-nowrap text-primary-500 group-hover:underline sm:inline">{r.cta} →</span>
              <Icon name="angle-right" size={14} className="shrink-0 text-primary-500 sm:hidden" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* The status card's "your case" line: counts when answered, an invitation when not */
export function MatchPeek({ p, c, href }: { p: ProjectSummary; c: MyCase; href: string }) {
  const n = matchCounts(p, c)
  return (
    <a
      href={n ? '#dieu-kien' : href}
      onClick={(e) => {
        if (!n) return
        e.preventDefault()
        const el = document.getElementById('dieu-kien')
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus({ preventScroll: true })
      }}
      className="ai-surface group flex items-center gap-3 rounded-16 p-3 transition hover:shadow-[0_12px_30px_rgb(246_190_94/0.24)]"
    >
      <AiMark size={32} />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-s font-semibold">{n ? 'Đối chiếu với bạn' : 'Dự án này có hợp với bạn?'}</span>
        <span className="text-[12px] text-text-neutral-secondary">
          {n ? (
            <>
              <b className="font-semibold text-success-700">{n.ok} khớp</b>
              {n.warn > 0 && (
                <>
                  {' · '}
                  <b className="font-semibold text-warning-700">{n.warn} cần lưu ý</b>
                </>
              )}
            </>
          ) : (
            'Trả lời 3 câu, trợ lý đối chiếu giúp bạn'
          )}
        </span>
      </span>
      <Icon name="angle-right" size={14} className="shrink-0 text-primary-500 transition group-hover:translate-x-0.5" />
    </a>
  )
}
