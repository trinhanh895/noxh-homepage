import { Icon } from './Icon'

/* Input / Select — light field with chevron, from the design system "Input" component */
export function Select({
  label,
  value,
  options,
  onChange,
  showLabel = false,
  labelFrom,
  className = 'md:w-[180px] md:flex-none',
}: {
  label: string
  value: string
  options: (string | { value: string; label: string; disabled?: boolean })[]
  onChange: (v: string) => void
  showLabel?: boolean
  /** Show the label only from this breakpoint up (screen readers always get it) */
  labelFrom?: 'md'
  className?: string
}) {
  return (
    <label className={`flex min-w-0 flex-1 flex-col gap-2 ${className}`}>
      <span className={showLabel ? `text-s font-medium text-text-neutral-primary ${labelFrom === 'md' ? 'max-md:sr-only' : ''}` : 'sr-only'}>{label}</span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-12 w-full cursor-pointer appearance-none truncate rounded-16 border border-border-input bg-bg-input py-3 pr-12 pl-4 text-m text-text-neutral-primary transition-colors hover:border-text-neutral-secondary"
        >
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o
            return (
              <option key={opt.value} value={opt.value} disabled={'disabled' in opt ? opt.disabled : false}>
                {opt.label}
              </option>
            )
          })}
        </select>
        <Icon name="angle-down" className="pointer-events-none absolute right-4 text-text-neutral-primary" />
      </span>
    </label>
  )
}
