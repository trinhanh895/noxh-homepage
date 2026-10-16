import { useEffect, useState } from 'react'
import { readStored, removeStored, writeStored } from './usePersistentState'

/* One account for the whole site: a phone number confirmed by OTP (simulated).
 * Guests don't need it — it's asked for when the first paper is uploaded, or to sign in on another device.
 * Folders saved on this device are kept and count as moved into the account. */

export type Account = { phone: string; since: string }

const KEY = 'noxh.account'
const EVENT = 'noxh:account'

export const readAccount = () => readStored<Account | null>(KEY, null)

export function signIn(phone: string) {
  writeStored(KEY, { phone, since: new Date().toISOString() } satisfies Account)
  window.dispatchEvent(new Event(EVENT))
}

export function signOut() {
  removeStored(KEY)
  window.dispatchEvent(new Event(EVENT))
}

/* Every component showing the account stays in sync (header, dossier, advisor) */
export function useAccount() {
  const [acc, setAcc] = useState<Account | null>(readAccount)
  useEffect(() => {
    const on = () => setAcc(readAccount())
    window.addEventListener(EVENT, on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener(EVENT, on)
      window.removeEventListener('storage', on)
    }
  }, [])
  return acc
}

/** "•••• 4567" — what the header shows */
export const maskShort = (phone: string) => `•••• ${phone.slice(-4)}`
/** "09•• ••• 567" — what an OTP screen shows */
export const maskLong = (phone: string) => `${phone.slice(0, 2)}•• ••• ${phone.slice(-3)}`
export const validPhone = (raw: string) => /^0\d{9}$/.test(raw.replace(/[\s.-]/g, ''))
export const digitsOf = (raw: string) => raw.replace(/\D/g, '')
