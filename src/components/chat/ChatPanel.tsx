import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { projectSummaries } from '../../data/projects'
import { routes } from '../../routes'
import { Avatar, Composer, Messages, Welcome } from './ChatParts'
import { CHAT_EVENT, useChat, type ChatOpen } from './useChat'

/* The floating chat: a launcher in the bottom-right corner and a chat panel above it (full-height sheet on phones).
 * Every action that leads to the assistant opens this panel in context (project, prefilled question, or the three
 * questions) instead of leaving the page. Menu/footer links marked data-nav still go to the full page. */
export function ChatPanel({ hideLauncher = false, launcherClass = '' }: { hideLauncher?: boolean; launcherClass?: string }) {
  const chat = useChat()
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)

  const show = (o: ChatOpen) => {
    chat.open(o)
    setOpen(true)
  }

  // Programmatic opens: openChat({ prj, q, guide })
  useEffect(() => {
    const on = (e: Event) => show((e as CustomEvent<ChatOpen>).detail ?? {})
    window.addEventListener(CHAT_EVENT, on)
    return () => window.removeEventListener(CHAT_EVENT, on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Links to the assistant page that are actions (not menu navigation) open the panel instead
  useEffect(() => {
    const on = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#/tro-ly"]')
      if (!a || a.hasAttribute('data-nav')) return
      e.preventDefault()
      const params = new URLSearchParams(a.getAttribute('href')!.split('?')[1] ?? '')
      show({ prj: params.get('prj'), q: params.get('q'), guide: params.get('guide') === '1' })
    }
    document.addEventListener('click', on)
    return () => document.removeEventListener('click', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Leaving for another page (advisor, profile…) closes the panel; Esc closes it
  useEffect(() => {
    const onHash = () => setOpen(false)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) launcher.current?.focus({ preventScroll: true })
    wasOpen.current = open
  }, [open])

  return (
    <>
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Trò chuyện với Trợ lý NOXH"
          className="surface-light fixed z-50 flex flex-col overflow-hidden bg-primary-25 text-text-neutral-primary shadow-[0_24px_60px_rgb(0_0_0/0.28)] ring-1 ring-black/5 motion-safe:animate-[chat-panel_260ms_cubic-bezier(.2,.8,.2,1)] max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[92dvh] max-sm:rounded-t-24 sm:right-5 sm:bottom-5 sm:h-[min(680px,calc(100dvh-40px))] sm:w-[400px] sm:rounded-24"
        >
          {/* Header: who you're talking to, what it knows about, and the ways out */}
          <div className="flex flex-col gap-3 bg-primary-500 px-4 pt-4 pb-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-white text-primary-500" aria-hidden>
                <Icon name="sparkles" size={18} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-m leading-tight font-semibold">Trợ lý NOXH</p>
                <p className="flex items-center gap-1.5 text-[12px] text-primary-50">
                  <span className="size-1.5 rounded-full bg-[#5fd3a1]" aria-hidden />
                  Trả lời theo tài liệu đã duyệt, có nguồn
                </p>
              </div>
              <button
                type="button"
                title="Trò chuyện mới"
                aria-label="Trò chuyện mới"
                onClick={chat.newChat}
                className="flex size-9 cursor-pointer items-center justify-center rounded-pill hover:bg-white/10"
              >
                <Icon name="rotate-left" size={16} />
              </button>
              <a
                href={routes.assistant}
                data-nav
                title="Mở toàn trang"
                aria-label="Mở toàn trang"
                className="flex size-9 items-center justify-center rounded-pill hover:bg-white/10"
              >
                <Icon name="arrow-up-right" size={16} />
              </a>
              <button
                type="button"
                aria-label="Đóng trò chuyện"
                onClick={() => setOpen(false)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-pill hover:bg-white/10"
              >
                <Icon name="xmark" size={16} />
              </button>
            </div>
            <label className="flex items-center gap-2 rounded-pill bg-white/10 py-1 pr-1 pl-3 text-[12px]">
              <span className="shrink-0 text-primary-50">Đang hỏi về</span>
              <select
                value={chat.projectId}
                onChange={(e) => chat.changeProject(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer truncate rounded-pill bg-white/10 px-2 py-1 text-[12px] font-semibold text-white outline-none [&>option]:text-text-neutral-primary"
              >
                {projectSummaries.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chat.isNew ? (
            <div className="flex-1 overflow-y-auto px-4">
              <Welcome chat={chat} compact />
            </div>
          ) : (
            <Messages chat={chat} compact className="flex-1 px-3 py-4" />
          )}

          <div className="flex flex-col gap-1.5 border-t border-border-divider bg-white px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <Composer chat={chat} autoFocus />
            <p className="flex items-center justify-between gap-2 px-1 text-[11.5px] text-text-neutral-secondary">
              <span className="flex items-center gap-1.5">
                <Icon name="lock" variant="regular" size={11} />
                Đừng nhập số căn cước, số tài khoản.
              </span>
              <button type="button" onClick={() => chat.runChip({ label: '', action: 'advisor' })} className="cursor-pointer font-semibold text-primary-500 hover:underline">
                Gặp tư vấn viên
              </button>
            </p>
          </div>
        </div>
      )}

      {!hideLauncher && (
        <button
          ref={launcher}
          type="button"
          onClick={() => (open ? setOpen(false) : show({}))}
          aria-expanded={open}
          aria-label={open ? 'Đóng trò chuyện' : 'Hỏi Trợ lý NOXH'}
          className={`${open ? 'max-sm:hidden' : ''} ${launcherClass} fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 glass-gold inline-flex size-14 cursor-pointer items-center justify-center gap-2 rounded-pill text-m font-semibold text-primary-500 transition hover:brightness-105 active:scale-[0.98] sm:right-5 sm:h-12 sm:w-auto sm:px-5 ${open ? 'sm:pointer-events-none sm:opacity-0' : ''}`}
        >
          <Icon name={open ? 'xmark' : 'comment-dots'} variant="regular" size={20} />
          <span className="max-sm:sr-only">Trợ lý NOXH</span>
        </button>
      )}
    </>
  )
}
