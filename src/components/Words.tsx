import type { CSSProperties } from 'react'

/*
 * Splits a line into masked words so they can rise one after another (see .w in index.css).
 * Screen readers get the plain text once; the animated copies are hidden from them.
 */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className="w">
              <span style={{ '--i': start + i } as CSSProperties}>{w}</span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </>
  )
}
