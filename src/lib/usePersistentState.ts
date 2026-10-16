import { useEffect, useState } from 'react'

type Area = 'local' | 'session'

const store = (area: Area) => (area === 'local' ? window.localStorage : window.sessionStorage)

/* Storage can be unavailable (private mode, blocked site data), so every access is guarded. */
export function readStored<T>(key: string, fallback: T, area: Area = 'local'): T {
  try {
    const raw = store(area).getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStored(key: string, value: unknown, area: Area = 'local') {
  try {
    store(area).setItem(key, JSON.stringify(value))
  } catch {
    /* ignore — state stays in memory */
  }
}

export function removeStored(key: string, area: Area = 'local') {
  try {
    store(area).removeItem(key)
  } catch {
    /* ignore */
  }
}

/* useState backed by localStorage (or sessionStorage); the page still works without it. */
export function usePersistentState<T>(key: string, initial: T, area: Area = 'local') {
  const [value, setValue] = useState<T>(() => readStored(key, initial, area))

  useEffect(() => {
    writeStored(key, value, area)
  }, [key, value, area])

  return [value, setValue] as const
}
