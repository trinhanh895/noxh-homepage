import { useId } from 'react'
import { Icon } from './Icon'

/* Input — same light field as Select (bg-input, radius 16, min-height 48). Hint and error sit under the field. */
export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  suffix,
  hint,
  error,
  optional = false,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'email' | 'tel'
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  placeholder?: string
  suffix?: string
  hint?: string
  error?: string
  optional?: boolean
  multiline?: boolean
}) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const field = 'w-full min-w-0 bg-transparent text-m text-text-neutral-primary outline-none placeholder:text-text-neutral-secondary'

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-s font-medium text-text-neutral-primary">
        {label}
        {optional && <span className="font-normal text-text-neutral-secondary"> (không bắt buộc)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-s text-text-neutral-secondary">
          {hint}
        </p>
      )}
      <span
        className={`${error ? 'border-danger-600' : 'border-border-input hover:border-text-neutral-secondary'} flex min-h-12 items-center gap-2 rounded-16 border bg-bg-input px-4 transition-colors focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-(--focus-ring)`}
      >
        {multiline ? (
          <textarea
            id={id}
            value={value}
            rows={4}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            className={`${field} resize-y py-3`}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            inputMode={inputMode}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            className={`${field} py-3`}
          />
        )}
        {suffix && <span className="text-s whitespace-nowrap text-text-neutral-secondary">{suffix}</span>}
      </span>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-2 text-s font-medium text-danger-600">
          <Icon name="circle-exclamation" />
          {error}
        </p>
      )}
    </div>
  )
}
