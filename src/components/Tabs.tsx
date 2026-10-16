import type { MouseEvent } from 'react'

export type TabItem = { id: string; label: string }

/* Underlined tab bar. Used as in-page navigation, so the active item is marked with aria-current rather than role="tab" */
export function Tabs({
  items,
  active,
  onSelect,
  label,
  className = '',
}: {
  items: TabItem[]
  active: string
  onSelect: (id: string, e: MouseEvent<HTMLAnchorElement>) => void
  label: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={`border-b border-border-divider ${className}`}>
      <ul className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none] lg:gap-8">
        {items.map((t) => {
          const on = t.id === active
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                aria-current={on ? 'location' : undefined}
                onClick={(e) => onSelect(t.id, e)}
                className={`${on ? 'border-primary-500 text-primary-500' : 'border-transparent text-text-neutral-secondary hover:border-border-neutral hover:text-text-neutral-primary'} inline-flex min-h-12 items-center border-b-2 text-m font-semibold whitespace-nowrap transition-colors`}
              >
                {t.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
