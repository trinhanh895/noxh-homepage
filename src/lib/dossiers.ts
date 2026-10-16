import { readStored, removeStored, writeStored } from './usePersistentState'
import { KEYS } from './store'
import { baseDocs, qrProjects, questions, type Doc, type QrProject } from '../data/qr'
import { daysLeft, formatDate, projectSummaries } from '../data/projects'
import { routes, withParams } from '../routes'

/* One dossier ("bìa hồ sơ") per project — the single place where a person prepares their papers.
 * Opened from a QR code, from the assistant ("Lưu vào bìa hồ sơ"), or from Hồ sơ của tôi. Stored on this device. */

export type Stage = 'intro' | 'q' | 'review' | 'open'
export type DocState = { s: 'have' | 'missing' | 'unsure' | 'checked'; applied?: string; expected?: string; manual?: boolean }
export type Saved = {
  stage: Stage
  qi: number
  answers: (number | null)[]
  editing: boolean
  docs: Record<string, DocState>
  phone?: string
  stopped?: string
  /** answers were filled in from a chat with the assistant */
  fromChat?: boolean
}

/** A project as the dossier needs it; QR projects carry more detail than the plain project list */
export type DossierProject = Omit<QrProject, 'deadline' | 'opened' | 'cover' | 'detailHref'> & {
  deadline?: string
  opened?: string
  cover?: string
  detailHref?: string
}

export const freshDossier = (): Saved => ({ stage: 'intro', qi: 0, answers: questions.map(() => null), editing: false, docs: {} })

const INDEX = 'noxh.dossiers'
export const dossierKey = (slug: string) => `noxh.dossier.${slug}`
export const dossierHref = (slug: string) => withParams(routes.profile, { prj: slug })

export const listSlugs = () => readStored<string[]>(INDEX, []).filter((s) => dossierProject(s))
export function addSlug(slug: string) {
  const all = readStored<string[]>(INDEX, [])
  if (!all.includes(slug)) writeStored(INDEX, [...all, slug])
}
export function removeDossier(slug: string) {
  writeStored(
    INDEX,
    readStored<string[]>(INDEX, []).filter((s) => s !== slug),
  )
  removeStored(dossierKey(slug))
}
export const readDossier = (slug: string) => readStored<Saved | null>(dossierKey(slug), null)

export function dossierProject(slug: string | null | undefined): DossierProject | null {
  if (!slug) return null
  if (qrProjects[slug]) return qrProjects[slug]
  const p = projectSummaries.find((x) => x.id === slug)
  if (!p) return null
  return { slug: p.id, name: p.name, address: p.area, deadline: p.deadline, units: '', area: '', price: p.price, source: 'Dữ liệu mẫu', detailHref: p.href }
}
export const allProjects = (): DossierProject[] => [...Object.values(qrProjects), ...projectSummaries.map((p) => dossierProject(p.id)!)]
export const followed = () => readStored<string[]>(KEYS.follows, [])

/* deadline helpers that cope with "no intake round yet" */
export const shortDate = (iso: string) => formatDate(iso).slice(0, 5)
export const deadlineShort = (p: DossierProject) => (p.deadline ? `hạn ${shortDate(p.deadline)}` : 'chưa mở đợt nhận')
export const daysText = (p: DossierProject) => (p.deadline ? `còn ${daysLeft(p.deadline)} ngày` : 'chưa có lịch')
export const isOpen = (p: DossierProject) => Boolean(p.deadline)

/* the papers follow from the answers */
export const optionOf = (qi: number, a: number | null) => (a === null ? null : questions[qi].options[a])
export function docsFor(answers: (number | null)[]) {
  const list: Doc[] = [...baseDocs]
  answers.forEach((a, qi) => {
    const add = optionOf(qi, a)?.add
    if (add && !list.some((d) => d.id === add.id)) list.push(add)
  })
  return list
}
export const unsureOf = (answers: (number | null)[]) => answers.filter((a, qi) => optionOf(qi, a)?.unsure).length

/* Summary for the cabinet / switcher */
export function progressOf(s: Saved) {
  const docs = docsFor(s.answers)
  const checked = docs.filter((d) => s.docs[d.id]?.s === 'checked').length
  const asking = s.stage === 'intro' || s.stage === 'q'
  return {
    docs,
    checked,
    pct: asking ? Math.round((s.answers.filter((a) => a !== null).length / questions.length) * 25) : Math.round((checked / docs.length) * 100),
    line: s.stopped
      ? 'Đã dừng'
      : asking
        ? `Còn ${questions.length - s.answers.filter((a) => a !== null).length} câu hỏi`
        : s.stage === 'review'
          ? 'Chờ bạn kiểm tra câu trả lời'
          : `${checked} trên ${docs.length} giấy đã soát`,
  }
}

/* The assistant asked the three questions in chat: file the answers into that project's dossier,
 * and land on "Kiểm tra câu trả lời" so the person confirms them. */
export function saveAnswersFromChat(slug: string, answers: (number | null)[]) {
  const cur = readDossier(slug) ?? freshDossier()
  const firstGap = answers.findIndex((a) => a === null)
  writeStored(dossierKey(slug), {
    ...cur,
    answers,
    editing: false,
    fromChat: true,
    stage: firstGap === -1 ? 'review' : 'q',
    qi: firstGap === -1 ? questions.length : firstGap,
  } satisfies Saved)
  addSlug(slug)
}
