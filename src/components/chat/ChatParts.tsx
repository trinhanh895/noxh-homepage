import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '../Icon'
import { TOPICS, type Chat, type Chip, type Message } from './useChat'

/* Pieces shared by the floating chat panel and the Trợ lý NOXH page */

export function Avatar({ size = 36 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-pill bg-primary-500 text-warning-500 ring-4 ring-primary-500/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon name="sparkles" size={Math.round(size * 0.45)} />
    </span>
  )
}

/* "**bold**" → <strong> */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((p, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold">
            {p}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

function Dot({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

/* Typing indicator: three bouncing dots in a bot bubble */
export function Typing() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="Trợ lý đang trả lời">
      <Avatar size={28} />
      <span className="flex items-center gap-1 rounded-24 rounded-bl-[6px] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-border-divider">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 rounded-full bg-primary-400 motion-safe:animate-[chat-dot_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </span>
    </div>
  )
}

export function Bubble({ m, active, onChip, compact = false }: { m: Message; active: boolean; onChip: (c: Chip) => void; compact?: boolean }) {
  if (m.role === 'note') {
    return (
      <p data-msg data-role="note" className="flex items-center gap-3 py-1 text-[12px] font-medium text-text-neutral-secondary">
        <span className="h-px flex-1 bg-border-divider" aria-hidden />
        {m.text}
        <span className="h-px flex-1 bg-border-divider" aria-hidden />
      </p>
    )
  }
  if (m.role === 'user') {
    return (
      <p
        data-msg
        data-role="user"
        className={`${compact ? 'max-w-[85%] text-s' : 'max-w-[75%] text-m'} self-end rounded-24 rounded-br-[6px] bg-primary-500 px-4 py-2.5 text-white motion-safe:animate-[chat-in_220ms_ease-out]`}
      >
        <span className="sr-only">Bạn: </span>
        {m.text}
      </p>
    )
  }
  return (
    <div
      data-msg
      data-role="assistant"
      className={`${compact ? 'max-w-[92%]' : 'max-w-[85%]'} flex flex-col gap-2 motion-safe:animate-[chat-in_260ms_ease-out]`}
    >
      {/* avatar sits at the foot of the bubble, quick replies line up under the bubble */}
      <div className="flex items-end gap-2">
        <Avatar size={28} />
        <div
          className={`${compact ? 'gap-3 text-s' : 'gap-4 text-m'} flex min-w-0 flex-1 flex-col rounded-24 rounded-bl-[6px] bg-white px-4 py-3 shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-border-divider`}
        >
          <p>
            <span className="sr-only">Trợ lý: </span>
            <Rich text={m.text} />
          </p>
          {m.summary && (
            <dl className="flex flex-col rounded-16 bg-primary-25 px-3 py-1">
              {m.summary.map((r) => (
                <div key={r.q} className="flex flex-col gap-0.5 border-t border-border-divider py-2.5 first:border-t-0">
                  <dt className="text-[12px] text-text-neutral-secondary">{r.q}</dt>
                  <dd className="font-semibold">{r.a}</dd>
                </div>
              ))}
            </dl>
          )}
          {m.list && (
            <ul className="flex flex-col gap-1.5">
              {m.list.map((item) => (
                <Dot key={item}>{item}</Dot>
              ))}
            </ul>
          )}
          {m.groups && (
            <div className="flex flex-col gap-3">
              {m.groups.map((g) => (
                <div key={g.label} className="flex flex-col gap-1.5">
                  <p className="text-[12px] font-semibold tracking-wide text-primary-400 uppercase">{g.label}</p>
                  <ul className="flex flex-col gap-1.5">
                    {g.items.map((item) => (
                      <Dot key={item}>{item}</Dot>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {m.sources && (
            <ul className="flex flex-wrap gap-1.5 border-t border-border-divider pt-2.5" aria-label="Nguồn">
              {m.sources.map((s) => (
                <li key={s} className="inline-flex items-center gap-1.5 rounded-pill bg-primary-25 px-2.5 py-1 text-[12px] text-text-neutral-secondary">
                  <Icon name="book-open" size={12} className="text-primary-500" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Quick replies: only the latest message's are live, so old ones can't re-trigger a flow */}
      {m.chips && active && (
        <div className="flex flex-wrap gap-1.5 pl-9">
          {m.chips.map((c) =>
            c.href ? (
              <a
                key={c.label}
                href={c.href}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-pill bg-primary-500 px-4 text-s font-semibold text-white hover:bg-primary-400"
              >
                {c.label}
                <Icon name="arrow-right" size={14} />
              </a>
            ) : (
              <button
                key={c.label}
                type="button"
                onClick={() => onChip(c)}
                className={`${
                  c.primary
                    ? 'border-primary-500 bg-primary-500 text-white hover:bg-primary-400'
                    : c.action === 'back' || c.action === 'stop'
                      ? 'border-transparent text-text-neutral-secondary hover:underline'
                      : 'border-primary-500/30 bg-white text-primary-500 hover:border-primary-500 hover:bg-primary-25'
                } inline-flex min-h-10 cursor-pointer items-center rounded-pill border px-3.5 text-left text-s font-semibold transition`}
              >
                {c.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

/* The message list: read a new answer from its first line, follow the user's own messages to the bottom */
export function Messages({ chat, compact = false, className = '' }: { chat: Chat; compact?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { messages, typing } = chat
  useEffect(() => {
    const list = ref.current
    if (!list) return
    const all = list.querySelectorAll<HTMLElement>('[data-msg]')
    const last = all[all.length - 1]
    if (last && last.dataset.role === 'assistant' && !typing) list.scrollTo({ top: last.offsetTop - 12, behavior: 'smooth' })
    else list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typing])
  return (
    <div ref={ref} className={`relative flex flex-col gap-3 overflow-y-auto ${className}`} aria-live="off">
      {messages.map((m) => (
        <Bubble key={m.id} m={m} compact={compact} active={m.id === chat.lastAssistantId && !typing} onChip={chat.runChip} />
      ))}
      {typing && <Typing />}
      <p className="sr-only" aria-live="polite">
        {chat.announce}
      </p>
    </div>
  )
}

/* Composer: auto-growing input with the send button inside */
export function Composer({ chat, autoFocus = false, big = false }: { chat: Chat; autoFocus?: boolean; big?: boolean }) {
  const ta = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (autoFocus) ta.current?.focus({ preventScroll: true })
  }, [autoFocus])
  useEffect(() => {
    const t = ta.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${Math.min(t.scrollHeight, 160)}px`
  }, [chat.draft])
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        chat.send(chat.draft)
      }}
      className={`${big ? 'rounded-24 p-2 pl-5' : 'rounded-24 p-1.5 pl-4'} flex items-end gap-2 border border-border-input bg-white shadow-[0_2px_8px_rgb(2_57_46/0.06)] transition focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgb(2_71_58/0.12)]`}
    >
      <label className="flex-1 self-center">
        <span className="sr-only">Câu hỏi của bạn</span>
        <textarea
          ref={ta}
          value={chat.draft}
          onChange={(e) => chat.setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              chat.send(chat.draft)
            }
          }}
          rows={1}
          placeholder="Nhắn cho trợ lý…"
          className={`${big ? 'text-m' : 'text-s'} block max-h-40 w-full resize-none bg-transparent py-2 text-text-neutral-primary outline-none placeholder:text-text-neutral-secondary`}
        />
      </label>
      <button
        type="submit"
        aria-label="Gửi"
        disabled={!chat.draft.trim() || chat.typing}
        className={`${big ? 'size-11' : 'size-10'} inline-flex shrink-0 cursor-pointer items-center justify-center rounded-pill bg-primary-500 text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-bg-input disabled:text-text-neutral-secondary`}
      >
        <Icon name="paper-plane" variant="regular" size={18} />
      </button>
    </form>
  )
}

/* Welcome: shown while the conversation is only the greeting */
export function Welcome({ chat, compact = false }: { chat: Chat; compact?: boolean }) {
  return (
    <div className={`${compact ? 'gap-4 py-4' : 'gap-6 py-10'} flex flex-col items-center text-center`}>
      <Avatar size={compact ? 52 : 72} />
      <div className="flex flex-col gap-1.5">
        <p className={`${compact ? 'text-headline-2xs' : 'headline text-headline-xs capitalize md:text-[35px]'} font-semibold`}>Chào bạn, mình giúp gì được?</p>
        <p className={`${compact ? 'text-s' : 'text-m'} mx-auto max-w-[440px] text-text-neutral-secondary`}>
          Hỏi về dự án <b className="font-semibold text-text-neutral-primary">{chat.project.name}</b>, hoặc để mình lập danh sách giấy tờ cho bạn. Câu trả lời
          luôn kèm nguồn.
        </p>
      </div>
      <div className={`${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} grid w-full gap-2 text-left`}>
        {TOPICS.map((t) => (
          <button
            key={t.title}
            type="button"
            onClick={() => chat.runChip(t.chip)}
            className="group flex cursor-pointer items-center gap-3 rounded-16 border border-border-neutral bg-white p-3 transition hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-[0_8px_20px_rgb(2_57_46/0.08)]"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-primary-50 text-primary-500 transition group-hover:bg-primary-500 group-hover:text-warning-500"
              aria-hidden
            >
              <Icon name={t.icon} variant="regular" size={18} />
            </span>
            <span className="flex flex-col">
              <span className="text-s font-semibold">{t.title}</span>
              <span className="text-[12px] text-text-neutral-secondary">{t.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
