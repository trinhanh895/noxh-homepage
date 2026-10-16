import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { usePersistentState } from '../lib/usePersistentState'
import { daysLeft, formatDate } from '../data/projects'
import { askHints, baseDocs, docGroups, guides, idFields, qrRoutes, questions, type Doc, type Option } from '../data/qr'
import {
  addSlug,
  allProjects,
  daysText,
  deadlineShort,
  docsFor,
  dossierHref,
  dossierKey,
  dossierProject,
  followed,
  freshDossier,
  listSlugs,
  optionOf,
  progressOf,
  readDossier,
  removeDossier,
  shortDate,
  unsureOf,
  type DocState,
  type DossierProject,
  type Saved,
} from '../lib/dossiers'
import { maskLong, maskShort, signIn, useAccount } from '../lib/account'
import { routes, withParams } from '../routes'
import './dossier.css'
import './dossier-panes.css'
import './dossier-embed.css'

/* "Bìa hồ sơ" — one dossier per project, the single place to prepare papers. Shown standalone after a QR scan,
 * and inside the site as Hồ sơ của tôi (embedded: the cabinet lists every folder you have).
 * A port of two prototypes (C1 phone, C2 web desk) extended with the flows of the NOXH wireframe: review the three
 * answers, open a paper and say Đã có / Chưa có / Chưa rõ, save with a phone number + OTP before the first upload,
 * upload or scan, the three upload errors, the result of the check, how to get a missing paper (with a waiting date),
 * asking about an unclear paper, and the ⋯ menu with stopping / reopening. Everything is simulated sample data. */

type QrProject = DossierProject
type Pane =
  | { k: 'doc' | 'save' | 'upload' | 'cam' | 'read' | 'result' | 'manual' | 'plan' | 'ask'; id: string }
  | { k: 'otp'; id: string; phone: string }
  | { k: 'menu' | 'stop' | 'wipe' | 'add' }

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const D = (ms: number) => (reduced() ? 1 : ms)
const today = () => new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const isoToday = (plus = 0) => new Date(Date.now() + plus * 86_400_000).toISOString().slice(0, 10)
const short = shortDate

function useWide() {
  const q = '(min-width: 1024px)'
  const [wide, setWide] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setWide(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return wide
}

/* ── state, the answer-flies-into-the-folder moment, and the panes ─────── */

function useDossier(slug: string, embedded: boolean) {
  const [s, setS] = usePersistentState<Saved>(dossierKey(slug), freshDossier())
  useEffect(() => addSlug(slug), [slug])
  const account = useAccount()
  const [pane, setPane] = useState<Pane | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [tip, setTip] = useState<string | null>(null)
  const [landed, setLanded] = useState<{ id: string | null; n: number }>({ id: null, n: 0 })
  const [busy, setBusy] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)
  const t = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => t.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => t.current.forEach(clearTimeout), [])

  const docs = docsFor(s.answers)
  const unsure = unsureOf(s.answers)

  const say = (msg: string) => {
    setToast(msg)
    later(() => setToast((x) => (x === msg ? null : x)), 3200)
  }
  const setDoc = (id: string, st: DocState) => setS((x) => ({ ...x, docs: { ...x.docs, [id]: st } }))

  useEffect(() => {
    if (!landed.n) return
    const dock = dockRef.current
    if (!dock) return
    dock.classList.remove('bump')
    void dock.offsetWidth
    dock.classList.add('bump')
    if (landed.id && !reduced()) {
      const sh = dock.querySelector<HTMLElement>(`.sheet[data-id="${landed.id}"]`)
      sh?.animate([{ transform: 'translateY(90px)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: sh.style.transform }], {
        duration: 520,
        easing: 'cubic-bezier(.2,.9,.25,1.2)',
      })
    }
  }, [landed])

  const pick = (o: Option, i: number, btn: HTMLElement, onLeave?: () => void) => {
    if (busy) return
    setBusy(true)
    const r = btn.getBoundingClientRect()
    const dr = dockRef.current?.getBoundingClientRect() ?? r
    const fly = document.createElement('div')
    fly.className = 'dz-flyer'
    fly.textContent = o.label
    fly.style.left = `${r.left}px`
    fly.style.top = `${r.top}px`
    document.body.appendChild(fly)
    const dx = dr.left + dr.width / 2 - 40 - r.left
    const dy = dr.top + 80 - r.top
    onLeave?.()
    const a = fly.animate(
      [
        { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px,${Math.min(dy, 0) * 0.4 - 55}px) scale(.95) rotate(-6deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px,${dy}px) scale(.4) rotate(8deg)`, opacity: 0 },
      ],
      { duration: D(620), easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' },
    )
    a.onfinish = () => {
      fly.remove()
      const answers = s.answers.map((x, k) => (k === s.qi ? i : x))
      const before = docsFor(s.answers)
      const add = o.add && !before.some((d) => d.id === o.add!.id) ? o.add : null
      const last = s.editing || s.qi + 1 >= questions.length
      setS({ ...s, answers, stage: s.editing ? 'review' : 'q', editing: false, qi: s.editing ? s.qi : s.qi + 1 })
      setLanded((x) => ({ id: add?.id ?? null, n: x.n + 1 }))
      const msg = add ? `Thêm: ${add.name}` : o.unsure ? 'Trợ lý sẽ hỏi lại câu này' : 'Không cần thêm giấy'
      setTip(msg)
      later(() => setTip((x) => (x === msg ? null : x)), D(1400))
      setBusy(false)
      if (last && !s.editing) later(() => setS((x) => ({ ...x, stage: 'review' })), D(1100))
    }
  }

  const back = () => setS({ ...s, qi: Math.max(0, s.qi - 1) })
  const reset = () => {
    setS(freshDossier())
    setPane(null)
    setLanded({ id: null, n: 0 })
  }
  const openDoc = (d: Doc) => {
    if (s.stopped) return
    setPane(s.docs[d.id]?.s === 'checked' ? { k: 'result', id: d.id } : { k: 'doc', id: d.id })
  }

  return { account, slug, embedded, s, setS, docs, unsure, pane, setPane, toast, say, tip, busy, dockRef, pick, back, reset, openDoc, setDoc }
}
type Ctl = ReturnType<typeof useDossier>

export function Dossier({ slug, embedded = false }: { slug: string; embedded?: boolean }) {
  const p = dossierProject(slug)
  if (!p) return null
  return <DossierInner key={slug} p={p} embedded={embedded} />
}

function DossierInner({ p, embedded }: { p: QrProject; embedded: boolean }) {
  const wide = useWide()
  const c = useDossier(p.slug, embedded)
  return wide ? <Web p={p} c={c} /> : <Phone p={p} c={c} />
}

/* ── the kraft folder at rest ─────────────────────────────────────────── */

function Dock({ p, c, preview, wide = false }: { p: QrProject; c: Ctl; preview?: Doc | null; wide?: boolean }) {
  const { docs, unsure } = c
  const n = docs.length
  const w = wide ? 150 : 132
  const step = n > 1 ? Math.min(40, (wide ? 150 : 330 - w) / (n - 1)) : 0
  return (
    <div className="dock" ref={c.dockRef as RefObject<HTMLDivElement>} aria-live="polite">
      <div className="f-tab" />
      <div className="f-back" />
      <div className="papers">
        {docs.map((d, i) => (
          <div
            key={d.id}
            className="sheet"
            data-id={d.id}
            style={{
              left: i * step,
              transform: `translateY(${-(wide ? 8 + (i % 3) * 9 : 10 + (i % 3) * 8)}px) rotate(${(i % 2 ? 1 : -1) * (1.5 + (i % 3))}deg)`,
              borderTop: `4px solid ${d.color}`,
            }}
          >
            <b>{d.name}</b>
            <small>{d.why}</small>
            <div className="ln">
              <span />
              <span style={{ width: '70%' }} />
              <span style={{ width: '85%' }} />
            </div>
          </div>
        ))}
        {preview && (
          <div className="sheet preview" style={{ right: 0, transform: 'translateY(-46px) rotate(3deg)', animation: 'dz-preview-in 260ms cubic-bezier(.2,.9,.3,1.2)' }}>
            <b>+ {preview.name}</b>
            <small>{preview.why}</small>
          </div>
        )}
      </div>
      <div className="f-front">
        <span className="f-label">{wide ? p.name : `Hồ sơ ${p.name}`}</span>
        <span className="f-sub">{wide ? `${n} giấy cần chuẩn bị` : `${n} giấy trong bìa${unsure ? ` · ${unsure} câu hỏi trợ lý sau` : ''}`}</span>
      </div>
      {c.tip && <span className="added">{c.tip}</span>}
    </div>
  )
}

/* Status of one paper, as a clip-on note in the folder */
function DocStatus({ st, isNext, wide }: { st?: DocState; isNext: boolean; wide?: boolean }) {
  if (st?.s === 'checked') return <span className={wide ? 'mstamp' : 'mini-stamp'}>ĐÃ SOÁT</span>
  if (st?.s === 'missing') return <span className="clip">{st.expected ? `Đang chờ · ${short(st.expected)}` : 'Chưa có'}</span>
  if (st?.s === 'unsure') return <span className="clip q">Chưa rõ</span>
  if (st?.s === 'have') return <span className="clip have">{st.manual ? 'Đã có · tự nhập' : 'Đã có'}</span>
  return <span className="st">{isNext ? 'Làm ngay →' : 'Chưa làm'}</span>
}

const nextDoc = (c: Ctl) => c.docs.find((d) => !c.s.docs[d.id]) ?? c.docs.find((d) => d.id === 'cccd' && c.s.docs[d.id]?.s === 'have')
const waitingDoc = (c: Ctl) => c.docs.find((d) => c.s.docs[d.id]?.s === 'missing' && c.s.docs[d.id]?.expected)
const checkedCount = (c: Ctl) => c.docs.filter((d) => c.s.docs[d.id]?.s === 'checked').length

function StickyText({ c, wide }: { c: Ctl; wide?: boolean }) {
  const next = nextDoc(c)
  const wait = waitingDoc(c)
  if (next)
    return (
      <>
        {wide ? 'Làm trước: ' : 'Làm cái này trước: '}
        <b>{next.name}</b>
        <small>
          {next.id === 'cccd'
            ? 'Bạn có sẵn rồi, chụp 2 mặt khoảng 5 phút.'
            : wait
              ? `Trong lúc chờ ${wait.name.toLowerCase()} (${short(c.s.docs[wait.id].expected!)}), làm giấy này trước.`
              : 'Bấm vào tờ giấy để chọn Đã có, Chưa có hoặc Chưa rõ.'}
        </small>
      </>
    )
  return (
    <>
      {wait ? `Đang chờ: ${wait.name}` : 'Xong hết rồi!'}
      <small>{wait ? `Đến ${short(c.s.docs[wait.id].expected!)}, giấy này lên đầu danh sách để bạn tải lên.` : 'Mang bìa này đi nộp theo thông báo của chủ đầu tư.'}</small>
    </>
  )
}

/* Workspace header: stage, deadline, Hỗ trợ, ⋯ */
function WsBar({ p, c, wide }: { p: QrProject; c: Ctl; wide?: boolean }) {
  return (
    <div className="ws">
      <span className="stg">
        {wide
          ? `Giai đoạn 3 trên 4 · ${c.s.stopped ? 'Đã dừng' : 'Chuẩn bị & kiểm tra'} · ${p.deadline ? `Hạn nộp ${formatDate(p.deadline)}, còn ${daysLeft(p.deadline)} ngày` : 'Chưa mở đợt nhận hồ sơ'}`
          : `${p.deadline ? `Hạn ${short(p.deadline)} · ${daysText(p)}` : 'Chưa mở đợt nhận'} · ${c.s.stopped ? 'Đã dừng' : 'Giai đoạn 3/4'}`}
      </span>
      <span className="tools">
        <a className="tool" href={withParams(routes.assistant, { prj: p.slug })}>
          Hỗ trợ
        </a>
        <button type="button" className="tool more" aria-label="Thêm thao tác" onClick={() => c.setPane({ k: 'menu' })}>
          ⋯
        </button>
      </span>
    </div>
  )
}

function Stopped({ c }: { c: Ctl }) {
  const next = c.docs.find((d) => c.s.docs[d.id]?.s !== 'checked')
  return (
    <div className="stopped">
      <div className="paper">
        <span className="stopmark">TẠM DỪNG</span>
        <h3>Hồ sơ đang dừng · từ {c.s.stopped}</h3>
        <p className="sub">Giấy tờ và thông tin vẫn được giữ. Mở lại để làm tiếp đúng chỗ cũ.</p>
        <p className="sub">
          Khi mở lại, việc tiếp theo vẫn là <b>{next?.name ?? 'nộp hồ sơ'}</b>. Nếu dự án đã đổi danh sách giấy, bạn được báo trước.
        </p>
        <div className="row-acts">
          <button type="button" className="btn" onClick={() => c.setS((x) => ({ ...x, stopped: undefined }))}>
            Mở lại hồ sơ
          </button>
          <button type="button" className="link" onClick={() => c.setPane({ k: 'wipe' })}>
            Xoá dữ liệu của hồ sơ này
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ Phone — C1 "Túi hồ sơ" ═════════════ */

function Phone({ p, c }: { p: QrProject; c: Ctl }) {
  const { s } = c
  return (
    <div className={`dz dz-phone${c.embedded ? ' embedded' : ''}`}>
      {c.embedded ? (
        <button type="button" className="mswitch" onClick={() => c.setPane({ k: 'add' })} aria-haspopup="dialog">
          <span className="dico" aria-hidden />
          <span className="t">
            <b>{p.name}</b>
            <small>{progressOf(s).line}</small>
          </span>
          <em>Đổi bìa ▾</em>
        </button>
      ) : (
        <div className="top">
          <span className="logo">
            <i />
            NOX
          </span>
          <a className="pill" href={qrRoutes.landing(p.slug)}>
            ‹ {p.name}
          </a>
        </div>
      )}
      {s.stage === 'open' && <WsBar p={p} c={c} />}
      <div className="scene">
        {s.stage === 'intro' && (
          <>
            <div className="intro">
              <span className="hand">bìa còn trống…</span>
              <h1>Mỗi bộ hồ sơ bắt đầu từ một chiếc bìa.</h1>
              <p className="hint">Trả lời 3 câu, khoảng 45 giây. NOX xếp sẵn những giấy bạn cần vào bìa. Chưa cần tài khoản.</p>
              <button type="button" className="btn" onClick={() => c.setS({ ...s, stage: 'q' })}>
                Mở bìa, bắt đầu
              </button>
            </div>
            <Dock p={p} c={c} />
          </>
        )}
        {s.stage === 'q' && (
          <>
            <div className="deck">{s.qi < questions.length && <PhoneQuestion key={`${s.qi}${s.editing}`} c={c} />}</div>
            <Dock p={p} c={c} />
          </>
        )}
        {s.stage === 'review' && <Review p={p} c={c} />}
        {s.stage === 'open' && <PhoneFolder p={p} c={c} />}
        {c.toast && (
          <div className="toast" role="status">
            {c.toast}
          </div>
        )}
      </div>
      <Panes p={p} c={c} />
    </div>
  )
}

function PhoneQuestion({ c }: { c: Ctl }) {
  const { s } = c
  const q = questions[s.qi]
  const [picked, setPicked] = useState<number | null>(null)
  const [leaving, setLeaving] = useState(false)
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus({ preventScroll: true }), [])
  const behind = s.editing ? 0 : Math.min(2, questions.length - 1 - s.qi)
  return (
    <>
      {Array.from({ length: behind }, (_, k) => behind - k).map((b) => (
        <div key={b} className="qcard behind" aria-hidden style={{ transform: `translateY(${b * 10}px) scale(${1 - b * 0.04})`, opacity: 1 - b * 0.25, height: '100%' }} />
      ))}
      <div className="qcard" style={{ animation: leaving ? 'dz-q-out 420ms 120ms cubic-bezier(.5,0,.75,0) forwards' : 'dz-q-in 260ms cubic-bezier(.2,.8,.2,1)' }}>
        <div className="qmeta">
          {s.editing ? 'Sửa câu trả lời' : `Câu ${s.qi + 1} trên ${questions.length}`}
          <span className="dots">
            {questions.map((_, i) => (
              <i key={i} className={i <= s.qi ? 'on' : ''} />
            ))}
          </span>
        </div>
        <h2>{q.text}</h2>
        <p className="why">{q.why}</p>
        <div className="opts">
          {q.options.map((o, i) => (
            <button
              key={o.label}
              ref={i === 0 ? first : undefined}
              type="button"
              className={`opt${o.unsure ? ' unsure' : ''}${picked === i ? ' picked' : ''}`}
              onClick={(e) => {
                if (c.busy) return
                setPicked(i)
                c.pick(o, i, e.currentTarget, () => setLeaving(true))
              }}
            >
              {o.label}
              <small>{o.hint}</small>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function PhoneFolder({ p, c }: { p: QrProject; c: Ctl }) {
  const { s, docs } = c
  const next = nextDoc(c)
  const first = Object.keys(s.docs).length === 0
  return (
    <div className="open">
      <div className="open-in" style={first ? { animation: 'dz-open-in 520ms cubic-bezier(.2,.8,.2,1)' } : undefined}>
        <div className="open-head">
          <span className="f-label">Hồ sơ {p.name}</span>
          <span className="meter">
            {checkedCount(c)} trên {docs.length} đã soát
            <span className="bar">
              <i style={{ width: `${Math.round((checkedCount(c) / docs.length) * 100)}%` }} />
            </span>
          </span>
        </div>
        <div className="sticky" style={{ animation: 'dz-sticky-in 420ms 300ms cubic-bezier(.2,.9,.3,1.3) backwards' }}>
          <StickyText c={c} />
        </div>
        <div className="stack">
          {docs.map((d, i) => {
            const st = s.docs[d.id]
            const isNext = next?.id === d.id
            return (
              <button
                key={d.id}
                type="button"
                className={`row ${st ? 'done' : 'todo'}${isNext ? ' next' : ''}`}
                onClick={() => c.openDoc(d)}
                style={first ? { animation: `dz-row-in 320ms ${120 + i * 60}ms ease-out backwards` } : undefined}
              >
                <span className="tabdot" style={{ background: d.color }} />
                <span>
                  <b>{d.name}</b>
                  <small>{d.why}</small>
                </span>
                <DocStatus st={st} isNext={isNext} />
              </button>
            )
          })}
        </div>
        {s.stopped && <Stopped c={c} />}
      </div>
      <p className="hint" style={{ margin: '0 4px' }}>
        Số tờ đếm việc chuẩn bị, không phải khả năng được mua. {c.unsure ? `${c.unsure} câu bạn chọn "Chưa rõ" sẽ được trợ lý hỏi lại.` : ''}
      </p>
    </div>
  )
}

/* ═════════════ Web — C2 "Bàn hồ sơ" ═════════════ */

function Web({ p, c }: { p: QrProject; c: Ctl }) {
  const { s } = c
  const asking = s.stage === 'intro' || s.stage === 'q'
  return (
    <div className={`dz dz-web${c.embedded ? ' embedded' : ''}`}>
      {!c.embedded && (
        <header className="bar">
          <span className="logo">
            <i />
            NOX
          </span>
          <a className="skip" href={qrRoutes.landing(p.slug)}>
            ← Giới thiệu dự án
          </a>
        </header>
      )}
      <div className="wrap">
        <Cabinet p={p} c={c} />
        <section className="main" aria-live="polite">
          <div className="view">{asking ? <WebAsk p={p} c={c} /> : s.stage === 'review' ? <Review p={p} c={c} wide /> : <WebFolder p={p} c={c} />}</div>
          <Panes p={p} c={c} wide />
          {c.toast && (
            <div className="toast" role="status">
              {c.toast}
            </div>
          )}
        </section>
      </div>
      <div className="wfoot">
        <span>Bản thử · dữ liệu giả lập, không dùng máy ảnh thật</span>
        <span>Dấu "Đã soát" là của NOX, không phải dấu của cơ quan nhà nước</span>
      </div>
    </div>
  )
}

/* The cabinet: every folder you have (the open one live), then "+ Thêm dự án khác" */
function Cabinet({ p, c }: { p: QrProject; c: Ctl }) {
  const slugs = listSlugs().includes(p.slug) ? listSlugs() : [...listSlugs(), p.slug]
  return (
    <aside className="cabinet" aria-label="Các bìa hồ sơ">
      <p className="cab-title">BÌA HỒ SƠ CỦA BẠN</p>
      {slugs.map((slug) => {
        const on = slug === p.slug
        const q = dossierProject(slug)!
        const st = on ? c.s : (readDossier(slug) ?? freshDossier())
        const pr = progressOf(st)
        const body = (
          <>
            <span className="dico">
              <i />
            </span>
            <span className="dtxt">
              <b>{q.name}</b>
              <span className="s1">{st.stopped ? 'Đã dừng' : q.deadline ? `Đang nhận hồ sơ · ${deadlineShort(q)}` : 'Chưa mở đợt nhận'}</span>
              <span className="dbar">
                <i style={{ width: `${pr.pct}%` }} />
              </span>
              <span className="s2">
                {pr.line}
                {q.deadline ? ` · ${daysText(q)}` : ''}
              </span>
            </span>
            {on && <span className="dnow">Đang mở</span>}
          </>
        )
        return on ? (
          <div key={slug} className="dos on" aria-current="true">
            {body}
          </div>
        ) : (
          <a key={slug} className="dos" href={dossierHref(slug)} style={{ textDecoration: 'none' }}>
            {body}
          </a>
        )
      })}
      <button type="button" className="dadd" onClick={() => c.setPane({ k: 'add' })}>
        + Thêm dự án khác
      </button>
      <AccountNote c={c} />
    </aside>
  )
}

function WebAsk({ p, c }: { p: QrProject; c: Ctl }) {
  const { s } = c
  const [preview, setPreview] = useState<Doc | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const done = s.qi >= questions.length
  const q = questions[Math.min(s.qi, questions.length - 1)]
  useEffect(() => setPicked(null), [s.qi])
  const show = (o: Option) => setPreview(o.add && !c.docs.some((d) => d.id === o.add!.id) ? o.add : null)
  return (
    <div className="ask">
      <div key={`${s.qi}${s.editing}`} style={{ animation: 'dz-ask-in 280ms cubic-bezier(.2,.8,.2,1)', visibility: done ? 'hidden' : undefined }}>
        <div className="qhead">
          <span>{s.editing ? 'Sửa câu trả lời' : `Câu ${Math.min(s.qi + 1, questions.length)} trên ${questions.length}`}</span>
          <span className="bars">
            {questions.map((_, i) => (
              <i key={i} className={i <= s.qi ? 'on' : ''} />
            ))}
          </span>
        </div>
        <h2 className="qtitle">{q.text}</h2>
        <p className="qwhy">{q.why}</p>
        <div className="opts">
          {q.options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              className={`opt${o.unsure ? ' unsure' : ''}${picked === i ? ' picked' : ''}`}
              onMouseEnter={() => show(o)}
              onFocus={() => show(o)}
              onMouseLeave={() => setPreview(null)}
              onBlur={() => setPreview(null)}
              onClick={(e) => {
                if (c.busy || done) return
                setPicked(i)
                setPreview(null)
                c.pick(o, i, e.currentTarget)
              }}
            >
              <span className="rd" />
              {o.label}
              {o.add ? (
                <span className="gain">
                  <span className="pp" />
                  {o.add.name}
                </span>
              ) : (
                <span className="gain none">{o.unsure ? 'Hỏi lại sau' : 'Không thêm giấy'}</span>
              )}
            </button>
          ))}
        </div>
        {s.qi > 0 && !s.editing ? (
          <button type="button" className="link" style={{ marginTop: 14 }} onClick={c.back}>
            Quay lại câu trước
          </button>
        ) : (
          <p className="muted" style={{ marginTop: 16 }}>
            Rê chuột hoặc chạm giữ vào một lựa chọn để xem giấy nào sẽ được thêm vào bìa.
          </p>
        )}
      </div>
      <Dock p={p} c={c} preview={preview} wide />
    </div>
  )
}

function WebFolder({ p, c }: { p: QrProject; c: Ctl }) {
  const { s, docs } = c
  const next = nextDoc(c)
  const first = Object.keys(s.docs).length === 0
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()
  return (
    <div style={{ position: 'relative' }}>
      <div className="ohead">
        <div>
          <span className="chip">{s.stopped ? 'Đã dừng' : p.deadline ? `Đang nhận hồ sơ · ${deadlineShort(p)}` : 'Chưa mở đợt nhận hồ sơ'}</span>
          <h2>{p.name}</h2>
        </div>
        <div className="meter">
          {checkedCount(c)} trên {docs.length} giấy đã soát
          <span className="track">
            <i style={{ width: `${Math.round((checkedCount(c) / docs.length) * 100)}%` }} />
          </span>
        </div>
      </div>
      <WsBar p={p} c={c} wide />
      <div className="sticky" style={{ animation: `dz-sticky-in 420ms ${first ? 500 : 120}ms cubic-bezier(.2,.9,.3,1.3) backwards` }}>
        <StickyText c={c} wide />
      </div>
      <div className="sheets">
        {docs.map((d, i) => {
          const st = s.docs[d.id]
          const isNext = next?.id === d.id
          return (
            <button
              key={d.id}
              type="button"
              className={`card ${st ? 'done' : 'todo'}${isNext ? ' next' : ''}`}
              style={{ '--c': d.color, '--r': `${((i % 3) - 1) * 0.8}deg`, animation: first ? `dz-card-in 380ms ${80 + i * 70}ms cubic-bezier(.2,.8,.2,1) backwards` : undefined } as CSSProperties}
              onClick={() => c.openDoc(d)}
              onPointerMove={(e) => {
                if (!fine) return
                const b = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - b.left) / b.width - 0.5
                const y = (e.clientY - b.top) / b.height - 0.5
                e.currentTarget.style.transform = `translateY(-8px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg)`
              }}
              onPointerLeave={(e) => (e.currentTarget.style.transform = '')}
            >
              <span className="txt">
                <b>{d.name}</b>
                <small>{d.why}</small>
              </span>
              <span className="ln">
                <span />
                <span style={{ width: '76%' }} />
                <span style={{ width: '88%' }} />
                <span style={{ width: '60%' }} />
              </span>
              <DocStatus st={st} isNext={isNext} wide />
            </button>
          )
        })}
      </div>
      <div className="ofoot">
        <span className="muted">
          Đây là số giấy đã chuẩn bị, không phải khả năng được mua.
          {c.unsure ? ` Có ${c.unsure} câu "Không chắc", trợ lý sẽ hỏi lại.` : ''}
        </span>
      </div>
      {s.stopped && <Stopped c={c} />}
    </div>
  )
}

/* ═════════════ Review the three answers (Q2) ═════════════ */

function Review({ p, c, wide }: { p: QrProject; c: Ctl; wide?: boolean }) {
  const { s, docs } = c
  const why = (d: Doc) => (baseDocs.some((b) => b.id === d.id) ? 'bắt buộc' : d.why.toLowerCase())
  const body = (
    <div className="pane-in" style={{ animation: 'dz-doc-in 360ms cubic-bezier(.2,.9,.3,1.1)' }}>
      <p className="crumb" style={{ margin: 0, textAlign: 'left' }}>
        {p.name} · Định hướng hồ sơ
      </p>
      <h2>Kiểm tra câu trả lời</h2>
      {s.fromChat && (
        <p className="chat-note">
          <span aria-hidden>💬</span> Điền sẵn từ cuộc trò chuyện với trợ lý. Bạn kiểm tra lại giúp nhé.
        </p>
      )}
      <p className="lede">
        Đã lập bộ <b>{docs.length} giấy</b> theo 3 câu trả lời bên dưới. Đây là bộ để chuẩn bị, không phải kết quả xét duyệt.
      </p>
      <div className="paper" style={{ '--c': 'var(--green)' } as CSSProperties}>
        <h3>Câu trả lời của bạn</h3>
        {questions.map((q, qi) => (
          <div key={q.id} className="ans">
            <span>
              <small>{['Hôn nhân', 'Công việc', 'Nơi ở hiện tại'][qi]}</small>
              <b>{optionOf(qi, s.answers[qi])?.label ?? 'Chưa trả lời'}</b>
            </span>
            <button type="button" className="link" onClick={() => c.setS({ ...s, stage: 'q', qi, editing: true })}>
              Sửa
            </button>
          </div>
        ))}
      </div>
      <div className="paper">
        <h3>Bộ giấy tờ của bạn · {docs.length} giấy</h3>
        {docGroups.map((g) => {
          const items = docs.filter((d) => g.ids.includes(d.id))
          if (!items.length) return null
          return (
            <div key={g.title} className="grp">
              <h4>
                {g.title} · {items.length} giấy
              </h4>
              {items.map((d) => (
                <div key={d.id}>
                  <i style={{ background: d.color }} />
                  {d.name}
                  <small>{why(d)}</small>
                </div>
              ))}
            </div>
          )
        })}
        <p className="note">Giấy ghi “vì bạn…” có trong bộ do câu trả lời của bạn. Sửa câu trả lời thì bộ giấy đổi theo.</p>
      </div>
      <button type="button" className={`btn${wide ? '' : ' block'}`} onClick={() => c.setS({ ...s, stage: 'open' })}>
        Xác nhận và mở hồ sơ
      </button>
      <p className="note">Chỉ lưu trên máy này · cần tài khoản khi bắt đầu tải giấy</p>
    </div>
  )
  return wide ? body : <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 24px' }}>{body}</div>
}

/* ═════════════ Panes ═════════════ */

function Panes({ p, c, wide }: { p: QrProject; c: Ctl; wide?: boolean }) {
  const pn = c.pane
  if (!pn) return null
  const close = () => c.setPane(null)
  switch (pn.k) {
    case 'doc':
      return <DocPane p={p} c={c} id={pn.id} />
    case 'save':
      return <SavePane p={p} c={c} id={pn.id} />
    case 'otp':
      return <OtpPane c={c} id={pn.id} phone={pn.phone} />
    case 'upload':
      return <UploadPane c={c} id={pn.id} />
    case 'cam':
      return <Camera onClose={() => c.setPane({ k: 'upload', id: pn.id })} onShot={() => c.setPane({ k: 'read', id: pn.id })} />
    case 'read':
      return (
        <Read
          wide={wide}
          onDone={() => {
            c.setDoc(pn.id, { s: 'checked' })
            c.setPane({ k: 'result', id: pn.id })
          }}
        />
      )
    case 'result':
      return <ResultPane c={c} id={pn.id} />
    case 'manual':
      return <ManualPane c={c} id={pn.id} />
    case 'plan':
      return <PlanPane c={c} id={pn.id} />
    case 'ask':
      return <AskPane p={p} c={c} id={pn.id} />
    case 'menu':
      return <MenuPane c={c} />
    case 'add':
      return <AddPane p={p} c={c} wide={wide} />
    case 'stop':
      return (
        <Shell c={c} crumb="Dừng hồ sơ" onBack={() => c.setPane({ k: 'menu' })}>
          <h2>Dừng hồ sơ {p.name}?</h2>
          <div className="paper">
            <div className="reasons">
              <div>
                <i />
                <span>Giấy và thông tin đã nhập vẫn được giữ.</span>
              </div>
              <div>
                <i />
                <span>Mở lại bất cứ lúc nào, làm tiếp đúng chỗ cũ.</span>
              </div>
              <div>
                <i />
                <span>Yêu cầu tư vấn viên đang mở sẽ được đóng.</span>
              </div>
            </div>
          </div>
          <div className="row-acts">
            <button
              type="button"
              className="btn"
              onClick={() => {
                c.setS((x) => ({ ...x, stopped: today() }))
                close()
              }}
            >
              Dừng hồ sơ
            </button>
            <button type="button" className="btn ghost" onClick={close}>
              Giữ hồ sơ
            </button>
          </div>
        </Shell>
      )
    case 'wipe':
      return (
        <Shell c={c} crumb="Xoá dữ liệu" onBack={close}>
          <h2>Xoá dữ liệu của hồ sơ này?</h2>
          <p className="lede">Câu trả lời, trạng thái các giấy và ảnh đã tải của {p.name} sẽ bị xoá khỏi máy này. Không hoàn tác được.</p>
          <div className="row-acts">
            <button
              type="button"
              className="btn"
              style={{ background: '#b42318', boxShadow: '0 3px 0 #7a1710' }}
              onClick={() => {
                if (!c.embedded) return c.reset()
                removeDossier(p.slug)
                window.location.hash = routes.profile
              }}
            >
              Xoá dữ liệu
            </button>
            <button type="button" className="btn ghost" onClick={close}>
              Giữ lại
            </button>
          </div>
        </Shell>
      )
  }
}

function Shell({ c, crumb, onBack, children, back = 'Bìa hồ sơ' }: { c: Ctl; crumb: string; onBack?: () => void; children: ReactNode; back?: string }) {
  return (
    <div className="pane" role="dialog" aria-label={crumb}>
      <div className="pane-in">
        <div className="pane-top">
          <button type="button" className="back" onClick={onBack ?? (() => c.setPane(null))}>
            ‹ {back}
          </button>
          <span className="crumb">{crumb}</span>
          {back !== 'Bìa hồ sơ' && (
            <button type="button" className="back" aria-label="Đóng, về bìa hồ sơ" onClick={() => c.setPane(null)}>
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

const docById = (c: Ctl, id: string) => c.docs.find((d) => d.id === id) ?? baseDocs[0]

/* G1 — "Bạn đã có giấy này chưa?" */
function DocPane({ p, c, id }: { p: QrProject; c: Ctl; id: string }) {
  const d = docById(c, id)
  const cur = c.s.docs[id]?.s
  const [pick, setPick] = useState<'have' | 'missing' | 'unsure' | null>(cur === 'checked' ? 'have' : (cur ?? null))
  const go = () => {
    if (pick === 'have') {
      if (id === 'cccd') {
        c.setDoc(id, { s: 'have' })
        c.setPane(c.account ? { k: 'upload', id } : { k: 'save', id })
      } else {
        c.setDoc(id, { s: 'have' })
        c.setPane(null)
        c.say('Đã đánh dấu Đã có. Bản mẫu mới làm phần tải ảnh và máy đọc cho Căn cước.')
      }
    } else if (pick === 'missing') c.setPane({ k: 'plan', id })
    else if (pick === 'unsure') {
      c.setDoc(id, { s: 'unsure' })
      c.setPane({ k: 'ask', id })
    }
  }
  const opts = [
    { v: 'have' as const, t: 'Đã có', h: id === 'cccd' ? 'Chụp hoặc tải ảnh 2 mặt. Khoảng 5 phút.' : 'Đánh dấu là đã có trong tay.' },
    { v: 'missing' as const, t: 'Chưa có', h: 'Xem cách xin và ghi ngày dự kiến có giấy.' },
    { v: 'unsure' as const, t: 'Chưa rõ', h: 'Hỏi trợ lý hoặc nhờ tư vấn viên.' },
  ]
  return (
    <Shell c={c} crumb={p.name}>
      <div className="paper" style={{ '--c': d.color } as CSSProperties}>
        <h3>{d.name}</h3>
        <p className="sub">{baseDocs.some((b) => b.id === id) ? 'Bắt buộc với mọi hồ sơ. Bản gốc, còn giá trị.' : `Cần ${d.why.toLowerCase()}.`}</p>
      </div>
      <p className="q-label">Bạn đã có giấy này chưa?</p>
      {opts.map((o) => (
        <button key={o.v} type="button" className={`choice${pick === o.v ? ' on' : ''}`} aria-pressed={pick === o.v} onClick={() => setPick(o.v)}>
          <span className="rd" />
          <span>
            <b>{o.t}</b>
            <small>{o.h}</small>
          </span>
        </button>
      ))}
      <button type="button" className="btn block" disabled={!pick} onClick={go}>
        Tiếp tục
      </button>
      {id === 'cccd' && !c.account && <p className="note">Lần đầu tải ảnh, bạn lưu hồ sơ bằng số điện thoại.</p>}
      {id === 'cccd' && c.account && <p className="note">Hồ sơ đã lưu vào tài khoản {maskShort(c.account.phone)}.</p>}
    </Shell>
  )
}

/* A1 — save the dossier with a phone number before the first upload */
function SavePane({ p, c, id }: { p: QrProject; c: Ctl; id: string }) {
  const [phone, setPhone] = useState('')
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<{ phone?: string; ok?: string }>({})
  const send = () => {
    const digits = phone.replace(/\D/g, '')
    const e: typeof err = {}
    if (!/^0\d{9}$/.test(digits)) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.'
    if (!ok) e.ok = 'Bạn cần đồng ý để NOX lưu ảnh giấy tờ.'
    setErr(e)
    if (!e.phone && !e.ok) c.setPane({ k: 'otp', id, phone: digits })
  }
  return (
    <Shell c={c} crumb={`${p.name} · Căn cước · Đã có`} onBack={() => c.setPane({ k: 'doc', id })} back="Căn cước">
      <h2>Lưu hồ sơ trước khi tải giấy tờ</h2>
      <p className="lede">Chỉ cần số điện thoại. Khoảng 1 phút.</p>
      <div className="paper">
        <label className="fld-in">
          <span>Số điện thoại</span>
          <input inputMode="tel" autoComplete="tel" placeholder="Ví dụ: 0901 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!err.phone} />
          {err.phone ? <em className="err">{err.phone}</em> : <em>Mã xác nhận 6 số gửi qua tin nhắn. Không dùng để quảng cáo.</em>}
        </label>
        <label className="check">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>
            Tôi đồng ý NOX lưu và xử lý ảnh giấy tờ, thông tin cá nhân để giúp tôi chuẩn bị hồ sơ.{' '}
            <a href={routes.privacy} style={{ color: 'var(--green)' }}>
              Dữ liệu và quyền riêng tư
            </a>
          </span>
        </label>
        {err.ok && <em className="note" style={{ color: '#b42318', fontWeight: 600 }}>{err.ok}</em>}
        <button type="button" className="btn block" onClick={send}>
          Gửi mã xác nhận
        </button>
        <button type="button" className="link" onClick={() => c.setPane({ k: 'manual', id })}>
          Tự nhập thông tin, không tải ảnh
        </button>
        <p className="note">Bạn vẫn làm được danh sách giấy, nhưng không có máy đọc giấy và đối chiếu. Thông tin lưu trên máy này.</p>
      </div>
      <div className="paper" style={{ '--c': 'var(--stamp)' } as CSSProperties}>
        <h3>Vì sao cần ở bước này</h3>
        <div className="reasons">
          <div>
            <i />
            <span>
              <b>Giấy tờ được bảo vệ</b>Ảnh căn cước, bảng lương gắn với tài khoản của bạn.
            </span>
          </div>
          <div>
            <i />
            <span>
              <b>Mở được trên máy khác</b>Không lo mất hồ sơ khi đổi điện thoại hoặc trình duyệt.
            </span>
          </div>
          <div>
            <i />
            <span>
              <b>Chuyển vào tài khoản</b>3 câu trả lời và danh sách {c.docs.length} giấy. Bạn không phải làm lại.
            </span>
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* A2 — the 6-digit code */
function OtpPane({ c, id, phone }: { c: Ctl; id: string; phone: string }) {
  const [code, setCode] = useState('')
  const [left, setLeft] = useState(45)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((x) => x - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])
  const masked = maskLong(phone)
  const confirm = () => {
    if (code.length < 6) return setErr('Nhập đủ 6 số trong tin nhắn.')
    signIn(phone)
    c.setPane({ k: 'upload', id })
    c.say('Đã lưu hồ sơ vào tài khoản. Bạn quay lại đúng bước tải ảnh Căn cước.')
  }
  return (
    <Shell c={c} crumb="Nhập mã xác nhận" onBack={() => c.setPane({ k: 'save', id })} back="Đổi số điện thoại">
      <h2>Nhập mã xác nhận</h2>
      <p className="lede">Mã 6 số vừa gửi tới số {masked}. Bản mẫu: nhập 6 số bất kỳ.</p>
      <div className="paper">
        <div className="otp" onClick={() => input.current?.focus()}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={i === Math.min(code.length, 5) ? 'cur' : ''}>
              {code[i] ?? ''}
            </span>
          ))}
          <input
            ref={input}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Mã xác nhận 6 số"
            value={code}
            onChange={(e) => {
              setErr('')
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }}
          />
        </div>
        {err && <em className="note" style={{ color: '#b42318', fontWeight: 600 }}>{err}</em>}
        <p className="note">
          Chưa nhận được?{' '}
          {left > 0 ? (
            `Gửi lại mã sau 0:${String(left).padStart(2, '0')}`
          ) : (
            <button type="button" className="link" style={{ minHeight: 0, padding: 0, fontSize: 'inherit' }} onClick={() => setLeft(45)}>
              Gửi lại mã
            </button>
          )}
        </p>
        <button type="button" className="btn block" onClick={confirm}>
          Xác nhận
        </button>
        <p className="note">Sau khi xác nhận, bạn quay lại đúng bước tải ảnh Căn cước.</p>
      </div>
    </Shell>
  )
}

function Steps({ at }: { at: 1 | 2 | 3 }) {
  return (
    <div className="steps">
      {['1. Tải ảnh', '2. Kiểm tra thông tin', '3. Kết quả'].map((t, i) => (
        <span key={t} className={i + 1 === at ? 'on' : i + 1 < at ? 'done' : ''}>
          {t}
        </span>
      ))}
    </div>
  )
}

/* G4 upload + G7 (network) + G8 (glare) + G9 (missing back) */
type Slot = 'empty' | 'loading' | 'up' | 'err'
function UploadPane({ c, id }: { c: Ctl; id: string }) {
  const [front, setFront] = useState<Slot>('empty')
  const [back, setBack] = useState<Slot>('empty')
  const [demo, setDemo] = useState<'ok' | 'net' | 'glare'>('ok')
  const [problem, setProblem] = useState<null | 'back' | 'glare'>(null)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const load = (side: 'front' | 'back', fail = false) => {
    const set = side === 'front' ? setFront : setBack
    set('loading')
    setProblem(null)
    timers.current.push(window.setTimeout(() => set(fail ? 'err' : 'up'), D(900)))
  }
  const read = () => {
    if (front === 'up' && back !== 'up') return setProblem('back')
    if (demo === 'glare') return setProblem('glare')
    c.setPane({ k: 'read', id })
  }
  const slot = (side: 'front' | 'back', st: Slot) => {
    const name = side === 'front' ? 'Mặt trước' : 'Mặt sau'
    const file = side === 'front' ? 'mat-truoc.jpg · 2,1 MB' : 'mat-sau.jpg · 1,8 MB'
    if (st === 'err')
      return (
        <div className="slot err">
          <b>{name}</b>
          <span className="bad">Mạng yếu nên ảnh chưa gửi được</span>
          <span>Ảnh {file.split(' ·')[0]} vẫn còn trong máy. Bấm thử lại khi có sóng.</span>
          <button
            type="button"
            className="btn ghost"
            style={{ minHeight: 40 }}
            onClick={() => {
              setDemo('ok')
              load(side)
            }}
          >
            Thử lại
          </button>
        </div>
      )
    if (st === 'up' || st === 'loading')
      return (
        <div className="slot up">
          <b>{name}</b>
          <span className="thumb2" />
          <span>{file}</span>
          {st === 'loading' ? (
            <span className="pbar">
              <i />
            </span>
          ) : (
            <span className="ok">✓ Đã tải lên{problem === 'back' && side === 'front' ? ' · được giữ lại' : ''}</span>
          )}
        </div>
      )
    return (
      <button type="button" className="slot" onClick={() => load(side, side === 'front' && demo === 'net')} style={problem === 'back' && side === 'back' ? { borderColor: '#b42318' } : undefined}>
        <b>{name}</b>
        <span>Chọn ảnh hoặc PDF</span>
        <span className="note">JPG, PNG hoặc PDF, tối đa 10 MB</span>
      </button>
    )
  }
  return (
    <Shell c={c} crumb="Căn cước · Đã có" onBack={() => c.setPane({ k: 'doc', id })} back="Căn cước">
      <Steps at={1} />
      <h2>Tải ảnh 2 mặt căn cước</h2>
      <p className="lede">Đặt giấy trên nền tối, thấy đủ 4 góc, không loá đèn.</p>
      {problem === 'back' && (
        <div className="warn-note">
          <b>Thiếu mặt sau.</b>
          <p>Căn cước cần đủ 2 mặt để kiểm tra ngày cấp và nơi thường trú. Mặt trước đã tải được giữ lại, bạn chỉ cần tải thêm mặt sau.</p>
        </div>
      )}
      {problem === 'glare' && (
        <div className="warn-note">
          <b>Ảnh bị loá đèn, bạn chụp lại nhé</b>
          <p>Góc phải mặt trước bị loá nên chưa đọc được họ tên và số căn cước.</p>
          <ul>
            <li>Tắt đèn flash, nghiêng giấy tránh ánh đèn</li>
            <li>Để giấy nằm phẳng, thấy đủ 4 góc</li>
          </ul>
          <div className="row-acts" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn"
              style={{ minHeight: 44 }}
              onClick={() => {
                setDemo('ok')
                setFront('empty')
                setProblem(null)
              }}
            >
              Tải ảnh khác cho mặt trước
            </button>
            <button type="button" className="link" onClick={() => c.setPane({ k: 'manual', id })}>
              Tự nhập thông tin
            </button>
          </div>
        </div>
      )}
      <div className="slots">
        {slot('front', front)}
        {slot('back', back)}
      </div>
      <div className="row-acts">
        <button type="button" className="btn" disabled={front !== 'up'} onClick={read}>
          Đọc thông tin
        </button>
        <button type="button" className="btn ghost" onClick={() => c.setPane({ k: 'cam', id })}>
          Chụp bằng máy ảnh
        </button>
      </div>
      <p className="note">Ảnh đã tải lên vẫn được giữ. Nếu lỗi, kiểm tra kết nối mạng hoặc chọn ảnh nhỏ hơn 10 MB.</p>
      <div className="demo">
        Bản mẫu · thử tình huống:
        {(
          [
            ['ok', 'Bình thường'],
            ['net', 'Mạng yếu'],
            ['glare', 'Ảnh loá'],
          ] as const
        ).map(([v, t]) => (
          <button
            key={v}
            type="button"
            className={demo === v ? 'on' : ''}
            onClick={() => {
              setDemo(v)
              setFront('empty')
              setBack('empty')
              setProblem(null)
            }}
          >
            {t}
          </button>
        ))}
        <span>· Thiếu mặt sau: chỉ tải mặt trước rồi bấm Đọc thông tin</span>
      </div>
    </Shell>
  )
}

/* G6 — result of the check, and what was prefilled elsewhere */
function ResultPane({ c, id }: { c: Ctl; id: string }) {
  const next = nextDoc(c)
  return (
    <Shell c={c} crumb="Căn cước · Đã kiểm tra">
      <Steps at={3} />
      <h2>Kết quả kiểm tra</h2>
      <div className="paper" style={{ '--c': 'var(--stamp)' } as CSSProperties}>
        <ul className="rules">
          <li>
            <span className="ic">✓</span>Còn giá trị đến 12/03/2030, sau hạn nộp hồ sơ
          </li>
          <li>
            <span className="ic">✓</span>Đủ 2 mặt, ảnh đọc được
          </li>
          <li>
            <span className="ic">✓</span>Họ tên, ngày sinh khớp với thông tin bạn đã xác nhận
          </li>
          <li>
            <span className="ic wait">…</span>Nơi thường trú sẽ đối chiếu khi có Giấy cư trú
          </li>
        </ul>
        <p className="note">Kiểm tra tự động theo quy tắc của dự án, dữ liệu mẫu. Đây là rà soát sơ bộ, không phải kết quả xét duyệt.</p>
      </div>
      <div className="paper">
        <h3>Đã điền sẵn sang giấy khác</h3>
        <div>
          <div className="prefill">
            <span>
              Giấy cư trú<small>họ tên, nơi thường trú</small>
            </span>
            <span className="tag">Chờ bạn xác nhận</span>
          </div>
          <div className="prefill">
            <span>
              Đơn theo mẫu dự án<small>họ tên, số căn cước, ngày sinh</small>
            </span>
            <span className="tag">Chờ bạn xác nhận</span>
          </div>
        </div>
      </div>
      <div className="row-acts">
        {next && next.id !== id && (
          <button type="button" className="btn" onClick={() => c.setPane({ k: 'doc', id: next.id })}>
            Sang giấy tiếp theo: {next.name}
          </button>
        )}
        <button type="button" className="btn ghost" onClick={() => c.setPane(null)}>
          Về bìa hồ sơ
        </button>
      </div>
    </Shell>
  )
}

/* "Tự nhập thông tin" — no upload, no machine reading */
function ManualPane({ c, id }: { c: Ctl; id: string }) {
  const [v, setV] = useState({ name: '', no: '', dob: '', addr: '' })
  const fields = [
    ['name', 'Họ và tên', 'NGUYỄN VĂN AN'],
    ['no', 'Số căn cước', '079 090 000 123'],
    ['dob', 'Ngày sinh', '12/03/1990'],
    ['addr', 'Nơi thường trú', 'Số 12 đường số 7, P. An Bình'],
  ] as const
  return (
    <Shell c={c} crumb="Căn cước · tự nhập" onBack={() => c.setPane({ k: 'doc', id })} back="Căn cước">
      <h2>Tự nhập thông tin căn cước</h2>
      <p className="lede">Không tải ảnh, nên không có máy đọc và đối chiếu. Thông tin lưu trên máy này.</p>
      <div className="paper">
        {fields.map(([k, l, ph]) => (
          <label key={k} className="fld-in">
            <span>{l}</span>
            <input placeholder={ph} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
          </label>
        ))}
        <button
          type="button"
          className="btn block"
          disabled={!v.name || !v.no}
          onClick={() => {
            c.setDoc(id, { s: 'have', manual: true })
            c.setPane(null)
            c.say('Đã lưu. Giấy này chưa được máy đọc và đối chiếu, bạn kiểm tra kỹ khi đi nộp.')
          }}
        >
          Lưu thông tin
        </button>
      </div>
    </Shell>
  )
}

/* G2 — "Chưa có": how to get it, and the waiting date */
function PlanPane({ c, id }: { c: Ctl; id: string }) {
  const d = docById(c, id)
  const g = guides[id] ?? guides.cutru
  const [applied, setApplied] = useState(c.s.docs[id]?.applied ?? isoToday())
  const [expected, setExpected] = useState(c.s.docs[id]?.expected ?? isoToday(g.days))
  return (
    <Shell c={c} crumb={`${d.name} · Chưa có`} onBack={() => c.setPane({ k: 'doc', id })} back={d.name}>
      <h2>Kế hoạch xin giấy</h2>
      <p className="src">
        Nguồn: <b>Thông báo tiếp nhận</b> của dự án · dữ liệu mẫu
      </p>
      <div className="paper" style={{ '--c': d.color } as CSSProperties}>
        <h3>{d.name}</h3>
        <div className="plan">
          <div>
            <span className="n">1</span>
            <span>
              <small>Đến đâu</small>
              <b>{g.where}</b>
            </span>
          </div>
          <div>
            <span className="n">2</span>
            <span>
              <small>Cầm theo gì</small>
              <ul>
                {g.bring.map((b) => (
                  <li key={b}>{b}</li>
                ))}
                {g.form && <li>{g.form}</li>}
              </ul>
              {g.form && (
                <button type="button" className="link" style={{ minHeight: 36, paddingLeft: 0 }} onClick={() => c.say('Bản mẫu: mẫu đơn sẽ tải từ trang của dự án.')}>
                  Tải mẫu đơn
                </button>
              )}
            </span>
          </div>
          <div>
            <span className="n">3</span>
            <span>
              <small>Mất bao lâu</small>
              <b>{g.time}</b>
            </span>
          </div>
        </div>
        <button type="button" className="link" style={{ alignSelf: 'flex-start', paddingLeft: 0 }} onClick={() => c.say('Bản mẫu: hướng dẫn sẽ được lưu thành ảnh để xem cả khi không có mạng.')}>
          Lưu hướng dẫn về máy
        </button>
      </div>
      <div className="paper" style={{ '--c': 'var(--note)' } as CSSProperties}>
        <h3>Ghi ngày chờ</h3>
        <div className="dates">
          <label className="fld-in">
            <span>Ngày bạn nộp đơn</span>
            <input type="date" value={applied} onChange={(e) => setApplied(e.target.value)} />
          </label>
          <label className="fld-in">
            <span>Ngày dự kiến có giấy</span>
            <input type="date" value={expected} min={applied} onChange={(e) => setExpected(e.target.value)} />
          </label>
        </div>
        <p className="note">Đến ngày, giấy này hiện ở đầu danh sách để bạn tải lên. Trong lúc chờ, bạn vẫn làm được giấy khác.</p>
        <button
          type="button"
          className="btn block"
          onClick={() => {
            c.setDoc(id, { s: 'missing', applied, expected })
            c.setPane(null)
            c.say(`Đã lưu lịch chờ giấy. Ngày ${short(expected)}, giấy này sẽ lên đầu danh sách.`)
          }}
        >
          Lưu ngày chờ
        </button>
      </div>
    </Shell>
  )
}

/* G3 — "Chưa rõ": ask the assistant, or a person */
function AskPane({ p, c, id }: { p: QrProject; c: Ctl; id: string }) {
  const d = docById(c, id)
  const [q, setQ] = useState('')
  const ask = (text: string) => withParams(routes.assistant, { prj: p.slug, q: `${d.name}: ${text}` })
  return (
    <Shell c={c} crumb={`${d.name} · Chưa rõ`} onBack={() => c.setPane({ k: 'doc', id })} back={d.name}>
      <h2>Hỏi trợ lý về giấy này</h2>
      <p className="lede">Trợ lý trả lời theo thông báo của dự án, có trích nguồn.</p>
      <div className="paper" style={{ '--c': d.color } as CSSProperties}>
        <h3>{d.name}</h3>
        <div className="chips">
          {askHints.map((h) => (
            <a key={h} href={ask(h)}>
              {h} <span aria-hidden>→</span>
            </a>
          ))}
        </div>
        <label className="fld-in">
          <span>Hoặc tự gõ câu hỏi</span>
        </label>
        <div className="ask-row">
          <input placeholder="Ví dụ: Tôi là công nhân…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Câu hỏi của bạn" />
          <a className="btn" href={q.trim() ? ask(q.trim()) : undefined} aria-disabled={!q.trim()} style={q.trim() ? undefined : { opacity: 0.4, pointerEvents: 'none' }}>
            Hỏi
          </a>
        </div>
      </div>
      <div className="paper" style={{ '--c': 'var(--stamp)' } as CSSProperties}>
        <h3>Muốn có người xem giúp?</h3>
        <p className="sub">Tư vấn viên trả lời trong hồ sơ của bạn. Cần lưu hồ sơ bằng số điện thoại.</p>
        <a className="btn ghost" href={withParams(routes.advisor, { prj: p.slug })} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
          Nhờ tư vấn viên
        </a>
      </div>
    </Shell>
  )
}

/* X1 — the ⋯ menu */
function MenuPane({ c }: { c: Ctl }) {
  const { s } = c
  return (
    <Shell c={c} crumb="Thêm thao tác">
      <h2>Hồ sơ này</h2>
      <div className="paper menu">
        <button type="button" onClick={() => c.say('Bản mẫu: dự án chưa đổi danh sách giấy.')}>
          <span>
            Cập nhật danh sách giấy<small>Khi dự án đổi danh sách, bạn được báo ở đây</small>
          </span>
          <span aria-hidden>›</span>
        </button>
        <button
          type="button"
          onClick={() => {
            c.setPane(null)
            c.setS({ ...s, stage: 'review' })
          }}
        >
          <span>
            Xem lại 3 câu trả lời<small>Sửa câu trả lời thì bộ giấy đổi theo</small>
          </span>
          <span aria-hidden>›</span>
        </button>
        <button type="button" onClick={() => c.say('Bản mẫu: phần thành viên trong hộ chưa làm.')}>
          <span>
            Thành viên trong hộ<small>Giấy của vợ hoặc chồng, người cùng hộ</small>
          </span>
          <span aria-hidden>›</span>
        </button>
        <button type="button" onClick={() => c.say('Bản mẫu: chọn dự án khác từ mã QR, giấy đã soát sẽ được dùng lại.')}>
          <span>
            Chuẩn bị cho dự án khác<small>Dùng lại giấy đã có</small>
          </span>
          <span aria-hidden>›</span>
        </button>
        {s.stopped ? (
          <button
            type="button"
            onClick={() => {
              c.setS({ ...s, stopped: undefined })
              c.setPane(null)
            }}
          >
            <span>
              Mở lại hồ sơ<small>Làm tiếp đúng chỗ cũ</small>
            </span>
            <span aria-hidden>›</span>
          </button>
        ) : (
          <button type="button" className="danger" onClick={() => c.setPane({ k: 'stop' })}>
            <span>
              Dừng hồ sơ này<small>Có bước xác nhận · mở lại được</small>
            </span>
            <span aria-hidden>›</span>
          </button>
        )}
      </div>
    </Shell>
  )
}

/* ═════════════ Camera + reading + stamp ═════════════ */

function Camera({ onClose, onShot }: { onClose: () => void; onShot: () => void }) {
  const [ok, setOk] = useState(false)
  const [flash, setFlash] = useState(false)
  const taken = useRef(false)
  const shoot = () => {
    if (taken.current) return
    taken.current = true
    setFlash(true)
    window.setTimeout(onShot, D(380))
  }
  useEffect(() => {
    const t1 = window.setTimeout(() => setOk(true), D(1400))
    const t2 = window.setTimeout(shoot, D(2500))
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="cam" role="dialog" aria-label="Chụp căn cước">
      <div className="cam-top">
        <button
          type="button"
          aria-label="Đóng máy ảnh"
          onClick={() => {
            taken.current = true
            onClose()
          }}
        >
          ✕
        </button>
        <b>Căn cước · mặt trước</b>
        <span style={{ width: 44 }} />
      </div>
      <div className="view-f">
        <div className={`guide${ok ? ' ok' : ''}`}>
          <i />
          <i />
          <i />
          <i />
          <div className="idcard" style={{ animation: 'dz-idc-in 1300ms cubic-bezier(.3,.7,.3,1)' }}>
            <span className="em">CĂN CƯỚC · MẪU</span>
            <span className="ph" />
            <p className="nm">NGUYỄN VĂN AN</p>
            <p>Số: 079 090 •••• 123</p>
            <p>Ngày sinh: 12/03/1990</p>
            <p>Nơi thường trú: Số 12 đường số 7, P. An Bình</p>
          </div>
        </div>
        <div className="cam-msg">
          <span>
            {ok ? (
              <>
                <svg className="ring" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.25)" />
                  <circle cx="12" cy="12" r="9" stroke="#7FE0B4" strokeDasharray="57" strokeDashoffset="57" transform="rotate(-90 12 12)" style={{ animation: 'dz-arc 1s forwards' }} />
                </svg>
                Đủ 4 góc, đủ nét · giữ yên
              </>
            ) : (
              'Đưa căn cước vào khung'
            )}
          </span>
        </div>
      </div>
      <div className="cam-bot">
        <span>Chọn ảnh có sẵn</span>
        <button type="button" className="shutter" aria-label="Chụp ngay" onClick={shoot}>
          <i />
        </button>
        <span style={{ textAlign: 'right' }}>Tự chụp: bật</span>
      </div>
      <div className="flash" style={flash ? { animation: `dz-flash ${D(420)}ms` } : undefined} />
    </div>
  )
}

function Read({ wide = false, onDone }: { wide?: boolean; onDone: () => void }) {
  const [line, setLine] = useState(0)
  const [chars, setChars] = useState(0)
  const [choice, setChoice] = useState<null | 'fix' | 'keep'>(null)
  const [val, setVal] = useState(0)
  const [stamped, setStamped] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const typing = line < idFields.length

  useEffect(() => {
    if (!typing) return
    const f = idFields[line]
    if (reduced()) {
      setLine(idFields.length)
      return
    }
    if (chars >= f.value.length) {
      const t = window.setTimeout(() => {
        setLine((l) => l + 1)
        setChars(0)
      }, 160)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setChars((k) => k + 2), 28)
    return () => window.clearTimeout(t)
  }, [line, chars, typing])

  useEffect(() => {
    if (!stamped) return
    try {
      navigator.vibrate?.(30)
    } catch {
      /* not supported */
    }
    const t1 = window.setTimeout(() => setLeaving(true), D(1700))
    const t2 = window.setTimeout(onDone, D(1700 + 520))
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [stamped, onDone])

  const L = wide
    ? { title: 'Xem lại thông tin', fix: 'Số 12', keep: 'Để nguyên', clear: '✓ Rõ', fixed: 'Bạn sửa', kept: 'Bạn chọn', slide: 'Kéo sang phải để đóng dấu' }
    : { title: 'Kiểm tra từng dòng', fix: 'Sửa thành 12', keep: 'Đúng', clear: '✓ Đọc rõ', fixed: 'Bạn sửa', kept: 'Bạn xác nhận', slide: 'Kéo để đóng dấu soát' }
  const hint = stamped
    ? 'Đã soát Căn cước. Họ tên, ngày sinh, nơi thường trú sẽ tự điền sang các tờ khác.'
    : choice
      ? 'Đủ 4 dòng. Kéo thanh bên dưới để đóng dấu soát.'
      : typing
        ? 'Đang đọc…'
        : 'Dòng tô vàng: máy đọc chưa chắc số nhà. Bạn so với ảnh rồi chọn.'

  return (
    <div className="read" role="dialog" aria-label="Kiểm tra căn cước" style={leaving ? { animation: 'dz-read-out 520ms cubic-bezier(.5,0,.75,0) forwards' } : undefined}>
      <div className="read-in">
        <Steps at={2} />
        <h2>{L.title}</h2>
        <div className={`doc${stamped ? ' shake' : ''}`} style={{ animation: stamped ? undefined : 'dz-doc-in 420ms cubic-bezier(.2,.9,.3,1.1)' }}>
          <div className="thumb">
            <span className="mini" />
            <span>
              <b style={{ fontSize: 14 }}>Căn cước · mặt trước</b>
              <br />
              <small>Máy đọc theo quy tắc mẫu, có thể đọc sai</small>
            </span>
          </div>
          {idFields.map((f, i) => {
            const shown = i < line ? f.value : i === line ? f.value.slice(0, chars) : ''
            const unsure = f.unsure && i < line && !choice
            const value = f.unsure && choice === 'fix' ? f.fixed : f.unsure && choice === 'keep' ? f.value.replace('?', '') : shown
            return (
              <div key={f.label} className={`field${unsure ? ' unsure' : ''}`}>
                <label>{f.label}</label>
                <span className="v">
                  {value}
                  {i === line && <span className="car" />}
                </span>
                <span className="tg">
                  {i < line &&
                    (unsure ? (
                      <>
                        <button type="button" className="yes" onClick={() => setChoice('fix')}>
                          {L.fix}
                        </button>
                        <button type="button" onClick={() => setChoice('keep')}>
                          {L.keep}
                        </button>
                      </>
                    ) : f.unsure ? (
                      `✓ ${choice === 'fix' ? L.fixed : L.kept}`
                    ) : (
                      L.clear
                    ))}
                </span>
              </div>
            )
          })}
          {stamped && (
            <div className="stampmark" style={{ animation: 'dz-stamp 360ms cubic-bezier(.6,0,.4,1) forwards' }}>
              <b>ĐÃ SOÁT</b>
              <small>NOX · {today()}</small>
            </div>
          )}
        </div>
        <p className="muted">{hint}</p>
        <div className={`slider${choice ? '' : ' off'}`}>
          <label htmlFor="dz-stamp">{L.slide}</label>
          <input
            id="dz-stamp"
            type="range"
            min={0}
            max={100}
            value={val}
            disabled={!choice || stamped}
            aria-label="Kéo hết để đóng dấu soát"
            onChange={(e) => {
              const v = +e.target.value
              setVal(v)
              if (v >= 96) setStamped(true)
            }}
            onPointerUp={() => !stamped && val < 96 && setVal(0)}
          />
        </div>
        <p className="stamp-note">Dấu soát của NOX: đã đối chiếu theo quy tắc mẫu. Không phải dấu cơ quan nhà nước, không phải kết quả xét duyệt.</p>
      </div>
    </div>
  )
}

/* ═════════════ Switch folder / add a project ═════════════ */

function ProjectList({ current, onPick }: { current?: string; onPick: (slug: string) => void }) {
  const mine = listSlugs()
  const follows = followed()
  const others = allProjects()
    .filter((x) => !mine.includes(x.slug))
    .sort((a, b) => Number(follows.includes(b.slug)) - Number(follows.includes(a.slug)) || Number(Boolean(b.deadline)) - Number(Boolean(a.deadline)))
  return (
    <>
      {mine.length > 0 && (
        <div className="paper">
          <h3>Bìa hồ sơ của bạn</h3>
          <div className="plist">
            {mine.map((slug) => {
              const q = dossierProject(slug)!
              const st = readDossier(slug) ?? freshDossier()
              return (
                <button key={slug} type="button" onClick={() => onPick(slug)}>
                  <span className="fold-ic" aria-hidden />
                  <span className="t">
                    <b>{q.name}</b>
                    <small>{progressOf(st).line}</small>
                  </span>
                  {slug === current ? <span className="on-tag">Đang mở</span> : <span className="go">Mở →</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div className="paper" style={{ '--c': 'var(--stamp)' } as CSSProperties}>
          <h3>Thêm dự án</h3>
          <p className="sub">Mỗi dự án một bìa. Giấy đã soát sẽ được dùng lại.</p>
          <div className="plist">
            {others.map((q) => (
              <button key={q.slug} type="button" onClick={() => onPick(q.slug)}>
                <span className="fold-ic empty" aria-hidden />
                <span className="t">
                  <b>{q.name}</b>
                  <small>
                    {q.deadline ? `Đang nhận hồ sơ · ${deadlineShort(q)}` : 'Chưa mở đợt nhận'}
                    {follows.includes(q.slug) ? ' · đang theo dõi' : ''}
                  </small>
                </span>
                <span className="go">Mở bìa +</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function AddPane({ p, c, wide }: { p: QrProject; c: Ctl; wide?: boolean }) {
  return (
    <Shell c={c} crumb={wide ? 'Thêm dự án' : 'Đổi bìa hồ sơ'}>
      <h2>{wide ? 'Thêm dự án khác' : 'Bìa hồ sơ của bạn'}</h2>
      <AccountNote c={c} light />
      <ProjectList
        current={p.slug}
        onPick={(slug) => {
          c.setPane(null)
          if (slug === p.slug) return
          addSlug(slug)
          window.location.hash = dossierHref(slug)
        }}
      />
    </Shell>
  )
}

/* Hồ sơ của tôi with no folder yet */
export function EmptyDossiers() {
  return (
    <div className="dz dz-empty">
      <div className="pane-in" style={{ width: '100%', maxWidth: 620 }}>
        <div className="paper" style={{ '--c': 'var(--kraft-2)' } as CSSProperties}>
          <span className="hand">chưa có bìa nào…</span>
          <h1>Hồ sơ của tôi</h1>
          <p className="sub">Mỗi dự án bạn muốn mua có một bìa hồ sơ riêng. Chọn một dự án để mở bìa: trả lời 3 câu, NOX xếp sẵn những giấy bạn cần.</p>
          <p className="note">
            Đã có tài khoản? <a href={routes.login}>Đăng nhập</a> để mở các bìa đã lưu.
          </p>
        </div>
        <ProjectList
          onPick={(slug) => {
            addSlug(slug)
            window.location.hash = dossierHref(slug)
          }}
        />
      </div>
    </div>
  )
}

/* Where the folders live: this device, or the account. The way in for folders saved on another device. */
function AccountNote({ c, light = false }: { c: Ctl; light?: boolean }) {
  const cls = light ? 'note' : 'acct'
  if (c.account)
    return (
      <p className={cls}>
        Đã lưu vào tài khoản <b>{maskShort(c.account.phone)}</b>. Mở được trên máy khác.
      </p>
    )
  return (
    <p className={cls}>
      Hồ sơ đang lưu trên máy này. Đã có hồ sơ trên máy khác? <a href={routes.login}>Đăng nhập</a>
    </p>
  )
}
