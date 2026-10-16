import { useEffect } from 'react'
import { Icon } from '../components/Icon'
import { projectSummaries } from '../data/projects'
import { hashParams, routes } from '../routes'
import { Avatar, Composer, Messages, Welcome } from '../components/chat/ChatParts'
import { STARTERS, useChat } from '../components/chat/useChat'

/* Trợ lý NOXH — a full-page chatbot. Same conversation as the floating panel (sessionStorage).
 * Desktop: a side rail (new chat, project, suggestions, the human exit) + the conversation.
 * Phones: the conversation only, with project and actions in the chat header. */
export function Assistant() {
  const chat = useChat()

  // Arriving with ?prj / ?q / ?guide=1 (e.g. "Mở toàn trang" or an old link): apply once, then clean the URL
  useEffect(() => {
    const p = hashParams()
    if (p.get('prj') || p.get('q') || p.get('guide')) {
      chat.open({ prj: p.get('prj'), q: p.get('q'), guide: p.get('guide') === '1' })
      history.replaceState(null, '', routes.assistant)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const advisor = () => chat.runChip({ label: '', action: 'advisor' })

  return (
    <main
      id="noi-dung"
      tabIndex={-1}
      className="surface-light mx-3 mb-3 flex h-[calc(100dvh-92px)] min-h-[560px] w-[calc(100%-24px)] overflow-hidden rounded-32 bg-white text-text-neutral-primary outline-none sm:mx-5 sm:mb-5 sm:w-[calc(100%-40px)] sm:rounded-40"
    >
      {/* Side rail (desktop) */}
      <aside aria-label="Trò chuyện" className="hidden w-[300px] shrink-0 flex-col gap-6 border-r border-border-divider bg-primary-25 p-5 lg:flex">
        <button
          type="button"
          onClick={chat.newChat}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-pill bg-primary-500 px-5 text-m font-semibold text-white transition hover:bg-primary-400"
        >
          <Icon name="plus" size={16} />
          Trò chuyện mới
        </button>

        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold tracking-wide text-text-neutral-secondary uppercase">Đang hỏi về</span>
          <span className="relative flex items-center">
            <select
              value={chat.projectId}
              onChange={(e) => chat.changeProject(e.target.value)}
              className="min-h-12 w-full cursor-pointer appearance-none rounded-16 border border-border-neutral bg-white py-2 pr-10 pl-4 text-s font-semibold"
            >
              {projectSummaries.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Icon name="angle-down" className="pointer-events-none absolute right-4" />
          </span>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold tracking-wide text-text-neutral-secondary uppercase">Gợi ý câu hỏi</span>
          <ul className="flex flex-col gap-1">
            {[...STARTERS, { label: 'Nộp hồ sơ ở đâu?', action: 'ask' as const }, { label: 'Giá căn hộ bao nhiêu?', action: 'ask' as const }].map((c) => (
              <li key={c.label}>
                <button
                  type="button"
                  onClick={() => chat.runChip({ ...c, primary: false })}
                  disabled={chat.typing}
                  className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-12 px-3 text-left text-s text-text-neutral-primary transition hover:bg-white disabled:cursor-wait"
                >
                  <Icon name="comment-dots" variant="regular" size={14} className="shrink-0 text-primary-400" />
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3 rounded-24 bg-white p-4 ring-1 ring-border-divider">
          <p className="flex items-center gap-2 text-s font-semibold">
            <Icon name="headset" variant="regular" className="text-primary-500" />
            Cần người thật?
          </p>
          <p className="text-[12px] text-text-neutral-secondary">Tư vấn viên xem câu hỏi và hồ sơ bạn chia sẻ, trả lời trong Hồ sơ của tôi.</p>
          <button
            type="button"
            onClick={advisor}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-pill border border-primary-500 px-4 text-s font-semibold text-primary-500 hover:bg-primary-25"
          >
            Gặp tư vấn viên
          </button>
        </div>
      </aside>

      {/* Conversation */}
      <section aria-label="Cuộc trò chuyện với Trợ lý NOXH" className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,var(--color-primary-25),#fff_40%)]">
        <header className="flex items-center gap-3 border-b border-border-divider bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <Avatar size={40} />
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-m leading-tight font-semibold">Trợ lý NOXH</h1>
            <p className="flex items-center gap-1.5 truncate text-[12px] text-text-neutral-secondary">
              <span className="size-1.5 shrink-0 rounded-full bg-success-700" aria-hidden />
              <span className="truncate">
                <span className="lg:hidden">{chat.project.name} · </span>Trả lời theo tài liệu đã duyệt, có nguồn
              </span>
            </p>
          </div>
          {/* phones: project + actions live here */}
          <label className="relative lg:hidden">
            <span className="sr-only">Đang hỏi về dự án</span>
            <select
              value={chat.projectId}
              onChange={(e) => chat.changeProject(e.target.value)}
              className="size-10 cursor-pointer appearance-none rounded-pill border border-border-neutral bg-white text-transparent"
              title="Đổi dự án"
            >
              {projectSummaries.map((p) => (
                <option key={p.id} value={p.id} className="text-text-neutral-primary">
                  {p.name}
                </option>
              ))}
            </select>
            <Icon name="buildings" variant="regular" size={18} className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 text-primary-500" />
          </label>
          <button
            type="button"
            onClick={chat.newChat}
            aria-label="Trò chuyện mới"
            title="Trò chuyện mới"
            className="flex size-10 cursor-pointer items-center justify-center rounded-pill border border-border-neutral text-primary-500 hover:bg-primary-25 lg:hidden"
          >
            <Icon name="rotate-left" size={16} />
          </button>
          <button
            type="button"
            onClick={advisor}
            aria-label="Gặp tư vấn viên"
            title="Gặp tư vấn viên"
            className="flex size-10 cursor-pointer items-center justify-center rounded-pill border border-border-neutral text-primary-500 hover:bg-primary-25 lg:hidden"
          >
            <Icon name="headset" variant="regular" size={16} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          {chat.isNew ? (
            <div className="flex-1 overflow-y-auto px-4">
              <div className="mx-auto w-full max-w-[720px]">
                <Welcome chat={chat} />
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 justify-center">
              <Messages chat={chat} className="w-full max-w-[760px] flex-1 px-4 py-6 md:px-6" />
            </div>
          )}
        </div>

        <div className="flex justify-center border-t border-border-divider bg-white px-4 pt-3 pb-3 md:px-6">
          <div className="flex w-full max-w-[760px] flex-col gap-2">
            <Composer chat={chat} big autoFocus />
            <p className="flex items-center gap-1.5 px-2 text-[12px] text-text-neutral-secondary">
              <Icon name="lock" variant="regular" size={11} />
              Trợ lý trả lời theo tài liệu đã duyệt, có thể chưa đúng với trường hợp riêng. Đừng nhập số căn cước hay số tài khoản.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
