import { buildChecklist, type DocItem, type DocStatus, type GuideAnswers } from '../data/checklist'
import { readStored, removeStored, usePersistentState, writeStored } from './usePersistentState'

/* Everything NOX remembers lives on this device only (localStorage / sessionStorage). */
export const KEYS = {
  drafts: 'noxh.drafts.v2',
  follows: 'noxh.follows',
  needs: 'noxh.needs',
  requests: 'noxh.requests',
  chat: 'noxh.chat', // sessionStorage
  handoff: 'noxh.handoff', // sessionStorage — summary passed from chat/draft to the advisor form
}

export type TrackedDoc = DocItem & { status: DocStatus }
export type Draft = {
  id: string
  projectId: string
  createdAt: string // ISO
  /** Present when the checklist came from the assistant's guided questions */
  answers?: GuideAnswers
  docs: TrackedDoc[]
}

export function makeDraft(projectId: string, answers?: GuideAnswers): Draft {
  return {
    id: String(Date.now()),
    projectId,
    createdAt: new Date().toISOString(),
    answers,
    docs: buildChecklist(answers).map((d) => ({ ...d, status: 'todo' })),
  }
}

/**
 * Saves a personalised draft from outside the Profile page (the assistant).
 * One draft per project: an existing one is replaced, keeping the status of documents it shares.
 */
export function saveDraftFromAnswers(projectId: string, answers: GuideAnswers) {
  const drafts = readStored<Draft[]>(KEYS.drafts, [])
  const existing = drafts.find((d) => d.projectId === projectId)
  const next = makeDraft(projectId, answers)
  if (existing) {
    next.id = existing.id
    next.createdAt = existing.createdAt
    next.docs = next.docs.map((d) => ({ ...d, status: existing.docs.find((e) => e.id === d.id)?.status ?? 'todo' }))
  }
  writeStored(KEYS.drafts, existing ? drafts.map((d) => (d.id === existing.id ? next : d)) : [...drafts, next])
  return { draft: next, replaced: Boolean(existing) }
}

export const useDrafts = () => usePersistentState<Draft[]>(KEYS.drafts, [])
export const useFollows = () => usePersistentState<string[]>(KEYS.follows, [])

export function readDrafts() {
  return readStored<Draft[]>(KEYS.drafts, [])
}

/** Text the advisor form pre-fills, so the user doesn't have to repeat themselves */
export function setHandoff(text: string) {
  writeStored(KEYS.handoff, text, 'session')
}
export function readHandoff() {
  return readStored<string>(KEYS.handoff, '', 'session')
}
export function clearHandoff() {
  removeStored(KEYS.handoff, 'session')
}

export function clearAllData() {
  for (const k of [KEYS.drafts, KEYS.follows, KEYS.needs, KEYS.requests, 'noxh.drafts', 'noxh.alerts']) removeStored(k)
  for (const k of [KEYS.chat, KEYS.handoff]) removeStored(k, 'session')
}
