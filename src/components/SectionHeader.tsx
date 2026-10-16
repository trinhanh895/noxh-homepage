import type { CSSProperties, ReactNode } from 'react'
import { Words } from './Words'

/* Section title: eyebrow fades in, headline words rise one by one, description follows */
export function SectionHeader({
  eyebrow,
  lines,
  size = 'xl',
  description,
  className = '',
}: {
  eyebrow: string
  lines: string[]
  size?: 'xl' | 'l'
  description?: ReactNode
  className?: string
}) {
  let offset = 0
  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <p data-reveal className="text-s text-warning-500 uppercase">
        {eyebrow}
      </p>
      <h2
        data-reveal="words"
        style={{ '--reveal-delay': '80ms' } as CSSProperties}
        className={`headline text-balance uppercase ${size === 'xl' ? 'text-headline-m sm:text-headline-l lg:text-headline-xl' : 'text-headline-m lg:text-headline-l'}`}
      >
        {lines.map((line, i) => {
          const start = offset
          offset += line.split(' ').length
          return (
            <span key={line} className="block">
              <Words text={line} start={start} />
              {i < lines.length - 1 && <span className="sr-only"> </span>}
            </span>
          )
        })}
      </h2>
      {description && (
        <p data-reveal style={{ '--reveal-delay': '260ms' } as CSSProperties} className="max-w-[640px] text-m text-primary-50">
          {description}
        </p>
      )}
    </div>
  )
}
