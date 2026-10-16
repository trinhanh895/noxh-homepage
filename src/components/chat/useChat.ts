import { useEffect, useRef, useState } from 'react'
import { docGroups, questions } from '../../data/qr'
import { docsFor, dossierHref, saveAnswersFromChat, unsureOf } from '../../lib/dossiers'
import { deadlineText, findProject, projectSummaries, statusLabel, type ProjectSummary } from '../../data/projects'
import { KEYS, setHandoff } from '../../lib/store'
import { readStored, writeStored } from '../../lib/usePersistentState'
import { routes, withParams } from '../../routes'

/*
 * Rule-based assistant, shared by the floating chat panel and the full Trợ lý NOXH page (one conversation,
 * kept in sessionStorage). Answers come from a small set of approved, pre-written guidance; every answer cites
 * its source; anything it can't answer is routed to a human advisor. Text supports **bold**.
 */

export type Action = 'start' | 'answer' | 'back' | 'restart' | 'stop' | 'save' | 'advisor' | 'ask' | 'not-local'
export type Chip = { label: string; action: Action; href?: string; primary?: boolean }
export type Message = {
  id: number
  role: 'assistant' | 'user' | 'note'
  text: string
  list?: string[]
  groups?: { label: string; items: string[] }[]
  summary?: { q: string; a: string }[]
  sources?: string[]
  chips?: Chip[]
}
/* The guided questions are the dossier's own three questions; answers are option indexes, as in the dossier */
type Guide = { step: number; answers: (number | null)[] }
const noAnswers = () => questions.map(() => null as number | null)
type ChatState = { projectId: string; messages: Message[]; guide: Guide | null; nextId: number }

/** What an entry point asks for when it opens the chat */
export type ChatOpen = { prj?: string | null; q?: string | null; guide?: boolean }

const GUIDE_SOURCE = 'Hướng dẫn chuẩn bị hồ sơ NOXH (mẫu)'
export const STARTERS: Chip[] = [
  { label: 'Bắt đầu chuẩn bị từng bước', action: 'start', primary: true },
  { label: 'Tôi cần chuẩn bị giấy tờ gì?', action: 'ask' },
  { label: 'Hạn nộp hồ sơ là khi nào?', action: 'ask' },
  { label: 'Ai được mua nhà ở xã hội?', action: 'ask' },
]

/* Suggestions for the welcome screen (icon + question) */
export const TOPICS = [
  { icon: 'list-check', title: 'Lập danh sách giấy tờ', sub: 'Trả lời 3 câu ngắn', chip: STARTERS[0] },
  { icon: 'folder-open', title: 'Tôi cần chuẩn bị giấy tờ gì?', sub: 'Các nhóm giấy thường gặp', chip: STARTERS[1] },
  { icon: 'calendar', title: 'Hạn nộp hồ sơ là khi nào?', sub: 'Theo thông báo của dự án', chip: STARTERS[2] },
  { icon: 'id-card', title: 'Ai được mua nhà ở xã hội?', sub: '3 nhóm điều kiện', chip: STARTERS[3] },
] as const

const greeting = (id: number): Message => ({
  id,
  role: 'assistant',
  text: 'Chào bạn! Mình giúp bạn tìm hiểu dự án và lập **danh sách giấy tờ cần chuẩn bị**. Bạn có thể hỏi bất kỳ điều gì, hoặc chọn một gợi ý bên dưới.',
  chips: STARTERS,
})

function answer(question: string, project: ProjectSummary): Omit<Message, 'id' | 'role'> {
  const q = question.toLowerCase()
  if (/giấy|hồ sơ cần|chuẩn bị gì|checklist/.test(q)) {
    return {
      text: 'Hồ sơ thường gồm các nhóm giấy tờ dưới đây. **Trả lời 3 câu ngắn** để mình lập danh sách đúng với trường hợp của bạn.',
      groups: groupsFor([1, 0, 0]),
      sources: [GUIDE_SOURCE],
      chips: [{ label: 'Trả lời 3 câu ngắn', action: 'start', primary: true }],
    }
  }
  if (/hạn|khi nào|thời gian|deadline|bao giờ/.test(q)) {
    return project.deadline
      ? {
          text: `${project.name} ${statusLabel[project.status].toLowerCase()}. **${deadlineText(project)}.** Giờ nhận hồ sơ: 08:00–17:00 các ngày làm việc.`,
          sources: [`Thông báo tiếp nhận ${project.name} (mẫu)`],
          chips: [{ label: 'Bắt đầu chuẩn bị từng bước', action: 'start', primary: true }],
        }
      : {
          text: `${project.name} **chưa mở đợt nhận hồ sơ**. Bạn có thể theo dõi dự án để xem lại trạng thái trong "Hồ sơ của tôi".`,
          sources: [`Trang thông tin ${project.name} (mẫu)`],
          chips: [{ label: 'Mở Hồ sơ của tôi', action: 'ask', href: routes.profile }],
        }
  }
  if (/giá|bao nhiêu tiền|chi phí|trả góp|vay/.test(q)) {
    return {
      text: '**Giá căn hộ chưa được công bố.** Giá và số căn từng loại sẽ có trong thông báo chính thức của chủ đầu tư.',
      sources: [`Thông báo tiếp nhận ${project.name} (mẫu)`],
      chips: [{ label: 'Nhờ tư vấn viên', action: 'advisor' }],
    }
  }
  if (/điều kiện|đối tượng|ai được|có được mua|đủ điều kiện|có cần/.test(q)) {
    return {
      text: 'Bạn cần đáp ứng **đủ cả 3 nhóm điều kiện**:',
      list: [
        'Thuộc nhóm được mua nhà ở xã hội (ví dụ: người thu nhập thấp, công nhân, cán bộ – công chức…)',
        'Chưa có nhà ở thuộc sở hữu tại Hà Nội, hoặc có nhưng quá chật',
        'Thu nhập không vượt mức trần theo quy định',
      ],
      sources: [GUIDE_SOURCE],
      chips: [{ label: 'Kiểm tra trường hợp của tôi', action: 'start', primary: true }],
    }
  }
  if (/nộp ở đâu|nơi nhận|địa chỉ|nộp online|trực tuyến|vneid|xin ở đâu/.test(q)) {
    return {
      text: 'Nộp theo kênh ghi trong thông báo của dự án: **trực tiếp tại chủ đầu tư**, hoặc **trực tuyến qua Cổng Dịch vụ công** (đăng nhập VNeID) nếu dự án có hỗ trợ. NOX không nộp hồ sơ thay bạn.',
      sources: [`Thông báo tiếp nhận ${project.name} (mẫu)`],
    }
  }
  return {
    text: 'Mình **chưa có câu trả lời** cho câu hỏi này trong tài liệu đã duyệt. Bạn có thể hỏi theo cách khác, hoặc để tư vấn viên trả lời giúp.',
    chips: [
      { label: 'Nhờ tư vấn viên', action: 'advisor', primary: true },
      { label: 'Tôi cần chuẩn bị giấy tờ gì?', action: 'ask' },
    ],
  }
}

/* papers grouped as in the dossier's "Kiểm tra câu trả lời" */
function groupsFor(answers: (number | null)[]) {
  const docs = docsFor(answers)
  return docGroups
    .map((g) => ({ label: g.title, items: docs.filter((d) => g.ids.includes(d.id)).map((d) => d.name) }))
    .filter((g) => g.items.length)
}

function questionMessage(step: number): Omit<Message, 'id' | 'role'> {
  const q = questions[step]
  return {
    text: `**Câu ${step + 1}/${questions.length}.** ${q.text} ${q.why}`,
    chips: [
      ...q.options.map((o) => ({ label: o.label, action: 'answer' as const })),
      ...(step > 0 ? [{ label: 'Quay lại câu trước', action: 'back' as const }] : []),
      { label: 'Dừng hỏi', action: 'stop' as const },
    ],
  }
}

const summaryRows = (a: (number | null)[]) => questions.map((q, i) => ({ q: q.text, a: a[i] === null ? '—' : q.options[a[i]!].label }))

function handoffText(project: ProjectSummary, a?: (number | null)[]) {
  const lines = [`Dự án: ${project.name}`]
  if (a && a.some((x) => x !== null)) {
    lines.push('Câu trả lời với trợ lý:')
    summaryRows(a).forEach((r) => lines.push(`- ${r.q} ${r.a}`))
  }
  lines.push('Tôi cần: ')
  return lines.join('\n')
}

const fresh = (projectId: string): ChatState => ({ projectId, messages: [greeting(0)], guide: null, nextId: 1 })
const load = (): ChatState => {
  const s = readStored<ChatState | null>(KEYS.chat, null, 'session')
  return s && (!s.guide || Array.isArray(s.guide.answers)) ? s : fresh(projectSummaries[0].id)
}

export function useChat() {
  const [state, setState] = useState<ChatState>(load)
  const { projectId, messages, guide } = state
  const project = findProject(projectId) ?? projectSummaries[0]
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [announce, setAnnounce] = useState('')
  const timer = useRef<number>()

  useEffect(() => writeStored(KEYS.chat, state, 'session'), [state])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const push = (...ms: Omit<Message, 'id'>[]) =>
    setState((s) => {
      let id = s.nextId
      return { ...s, messages: [...s.messages, ...ms.map((m) => ({ ...m, id: id++ }))], nextId: id }
    })

  const reply = (m: Omit<Message, 'id' | 'role'>, nextGuide?: Guide | null) => {
    setTyping(true)
    if (nextGuide !== undefined) setState((s) => ({ ...s, guide: nextGuide }))
    timer.current = window.setTimeout(() => {
      setTyping(false)
      push({ role: 'assistant', ...m })
      setAnnounce(`Trợ lý: ${m.text.replace(/\*\*/g, '')}`)
    }, 650)
  }

  const finishGuide = (answers: (number | null)[]) => {
    const unsure = unsureOf(answers) > 0
    reply(
      {
        text: `Đây là **bộ giấy tờ** cho trường hợp của bạn tại ${project.name}: ${docsFor(answers).length} giấy.${unsure ? ' Có câu bạn chưa chắc — tư vấn viên có thể xem giúp phần đó.' : ''} Lưu vào bìa hồ sơ để chuẩn bị từng giấy.`,
        summary: summaryRows(answers),
        groups: groupsFor(answers),
        sources: [GUIDE_SOURCE, `Thông báo tiếp nhận ${project.name} (mẫu)`],
        chips: [
          { label: 'Lưu vào bìa hồ sơ', action: 'save', primary: true },
          { label: 'Sửa câu trả lời', action: 'restart' },
          { label: 'Nhờ tư vấn viên xem lại', action: 'advisor' },
        ],
      },
      { step: questions.length, answers },
    )
  }

  const startGuide = () => reply(questionMessage(0), { step: 0, answers: noAnswers() })

  const runChip = (c: Chip) => {
    if (typing) return
    switch (c.action) {
      case 'start':
      case 'restart':
        push({ role: 'user', text: c.label })
        startGuide()
        return
      case 'stop':
        push({ role: 'user', text: c.label })
        reply({ text: 'Đã dừng. Bạn có thể hỏi điều khác, hoặc bắt đầu lại bất cứ lúc nào.', chips: STARTERS }, null)
        return
      case 'back': {
        if (!guide || guide.step === 0) return
        const prev = guide.step - 1
        const answers = guide.answers.map((a, i) => (i >= prev ? null : a))
        push({ role: 'user', text: c.label })
        reply(questionMessage(prev), { step: prev, answers })
        return
      }
      case 'answer': {
        if (!guide || guide.step >= questions.length) return
        const idx = questions[guide.step].options.findIndex((o) => o.label === c.label)
        if (idx < 0) return
        push({ role: 'user', text: c.label })
        const answers = guide.answers.map((a, i) => (i === guide.step ? idx : a))
        const next = guide.step + 1
        if (next < questions.length) reply(questionMessage(next), { step: next, answers })
        else finishGuide(answers)
        return
      }
      case 'not-local':
        return
      case 'save': {
        if (!guide) return
        saveAnswersFromChat(projectId, guide.answers)
        push({ role: 'user', text: c.label })
        reply(
          {
            text: `**Đã lưu** vào bìa hồ sơ ${project.name}. Mở bìa để kiểm tra lại câu trả lời, rồi chuẩn bị từng giấy.`,
            chips: [{ label: 'Mở bìa hồ sơ', action: 'ask', href: dossierHref(projectId), primary: true }],
          },
          null,
        )
        return
      }
      case 'advisor':
        setHandoff(handoffText(project, guide?.answers))
        window.location.hash = withParams(routes.advisor, { prj: projectId })
        return
      case 'ask':
        if (c.href) {
          window.location.hash = c.href
          return
        }
        send(c.label)
    }
  }

  const send = (text: string) => {
    const t = text.trim()
    if (!t || typing) return
    push({ role: 'user', text: t })
    setDraft('')
    // While a guided question is open, only its options count as answers
    if (guide && guide.step < questions.length) {
      const idx = questions[guide.step].options.findIndex((o) => o.label.toLowerCase() === t.toLowerCase())
      if (idx >= 0) {
        const answers = guide.answers.map((a, i) => (i === guide.step ? idx : a))
        const next = guide.step + 1
        if (next < questions.length) reply(questionMessage(next), { step: next, answers })
        else finishGuide(answers)
        return
      }
      reply({ ...questionMessage(guide.step), text: `Mình đang hỏi **câu ${guide.step + 1}/${questions.length}**. Bạn chọn một ý bên dưới giúp mình nhé — hoặc bấm "Dừng hỏi" để hỏi điều khác.` })
      return
    }
    if (/bắt đầu|từng bước/i.test(t)) {
      startGuide()
      return
    }
    reply(answer(t, project))
  }

  const changeProject = (id: string) => {
    const p = findProject(id)
    if (!p || id === projectId) return
    setState((s) => ({ ...s, projectId: id }))
    push({ role: 'note', text: `Đang hỏi về ${p.name}` })
  }

  const newChat = () => {
    window.clearTimeout(timer.current)
    setTyping(false)
    setState(fresh(projectId))
  }

  /* An entry point opens the chat: pick up the conversation from storage, switch project, prefill a question,
   * or start the three questions right away. No timers — StrictMode's double mount would cancel them. */
  const open = ({ prj, q, guide: startNow }: ChatOpen) => {
    const s = load()
    const p = findProject(prj)
    let next = s
    if (p && p.id !== s.projectId) {
      next = { ...s, projectId: p.id, messages: [...s.messages, { id: s.nextId, role: 'note', text: `Đang hỏi về ${p.name}` }], nextId: s.nextId + 1 }
    }
    if (startNow) {
      const name = (p ?? findProject(next.projectId) ?? projectSummaries[0]).name
      const intro: Message = { id: next.nextId, role: 'assistant', text: `Mình sẽ hỏi **3 câu ngắn** để lập danh sách giấy tờ cho ${name}. Không chắc câu nào thì cứ chọn "Chưa rõ".` }
      const first: Message = { id: next.nextId + 1, role: 'assistant', ...questionMessage(0) }
      next = { ...next, messages: [...next.messages, intro, first], nextId: next.nextId + 2, guide: { step: 0, answers: noAnswers() } }
    }
    setState(next)
    if (q) setDraft(q)
  }

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id
  const fresh1 = messages.length === 1 && messages[0].role === 'assistant'

  return { state, project, projectId, messages, typing, announce, draft, setDraft, send, runChip, changeProject, newChat, open, lastAssistantId, isNew: fresh1 }
}
export type Chat = ReturnType<typeof useChat>

/* ── open the floating panel from anywhere ─────────────────────────────── */

export const CHAT_EVENT = 'noxh:chat'
export function openChat(o: ChatOpen = {}) {
  window.dispatchEvent(new CustomEvent<ChatOpen>(CHAT_EVENT, { detail: o }))
}
