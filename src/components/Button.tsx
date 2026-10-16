import type { ReactNode } from 'react'
import { Icon, type IconStyle } from './Icon'

/* Button Glass — gold (warning tint) or neutral (white tint), sizes 48 / 40 */
export function GlassButton({
  tone = 'gold',
  size = 48,
  icon,
  iconVariant = 'solid',
  children,
  href,
}: {
  tone?: 'gold' | 'neutral'
  size?: 40 | 48
  icon?: string
  iconVariant?: IconStyle
  children: ReactNode
  href: string
}) {
  const color = tone === 'gold' ? 'text-primary-500' : 'text-text-neutral-primary'
  return (
    <a
      href={href}
      className={`${tone === 'gold' ? 'glass-gold' : 'glass-neutral'} ${color} ${size === 48 ? 'h-12' : 'h-10'} inline-flex min-w-12 shrink-0 items-center justify-center gap-2 rounded-pill px-5 text-m font-semibold whitespace-nowrap transition hover:brightness-105 active:scale-[0.98]`}
    >
      {icon && <Icon name={icon} variant={iconVariant} />}
      {children}
    </a>
  )
}

/* Button Common — white pill on solid surfaces. → for pages inside NOX, ↗ when `external`. */
export function SolidButton({
  size = 48,
  icon,
  iconVariant = 'regular',
  children,
  href,
  external = false,
}: {
  size?: 40 | 48
  icon?: string
  iconVariant?: IconStyle
  children: ReactNode
  href: string
  external?: boolean
}) {
  icon ??= external ? 'arrow-up-right' : 'arrow-right'
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`${size === 48 ? 'h-12 min-w-12 text-m font-semibold' : 'h-10 min-w-10 text-s font-medium'} inline-flex shrink-0 items-center justify-center gap-2 rounded-pill bg-white px-5 whitespace-nowrap text-text-neutral-primary transition hover:bg-primary-25 active:scale-[0.98]`}
    >
      {children}
      <Icon name={icon} variant={iconVariant} />
    </a>
  )
}

/* Button Common — primary (green) solid or outlined, on light surfaces.
 * Renders a link when `href` is given, otherwise a <button>. */
export function PrimaryButton({
  variant = 'solid',
  size = 48,
  icon,
  iconVariant = 'solid',
  block = false,
  children,
  href,
  onClick,
  type = 'button',
  disabled = false,
  external = false,
}: {
  variant?: 'solid' | 'outlined'
  size?: 40 | 48
  icon?: string
  iconVariant?: IconStyle
  block?: boolean
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  /** Opens another site in a new tab and shows ↗ */
  external?: boolean
}) {
  const look =
    variant === 'solid'
      ? 'bg-primary-500 text-white hover:bg-primary-400 disabled:bg-primary-400/50'
      : 'border border-primary-500 bg-white text-primary-500 hover:bg-primary-25'
  const className = `${look} ${block ? 'w-full' : ''} ${size === 48 ? 'h-12 min-w-12 text-m font-semibold' : 'h-10 min-w-10 text-s font-medium'} inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 whitespace-nowrap transition active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100`
  const content = (
    <>
      {icon && <Icon name={icon} variant={iconVariant} />}
      {children}
      {external && <Icon name="arrow-up-right" variant="regular" />}
    </>
  )
  if (href !== undefined) {
    return (
      <a href={href} onClick={onClick} className={className} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  )
}

/* Button Common — underlined text link. ↗ only for other sites; → for pages inside NOX. */
export function LinkButton({
  children,
  tone = 'light',
  href,
  external = false,
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  href: string
  external?: boolean
}) {
  const color = tone === 'light' ? 'border-white text-white' : 'border-text-neutral-primary text-text-neutral-primary'
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`${color} group inline-flex min-h-11 min-w-12 items-center gap-2 border-b text-m font-semibold whitespace-nowrap`}
    >
      {children}
      <Icon
        name={external ? 'arrow-up-right' : 'arrow-right'}
        variant="regular"
        className={`transition-transform ${external ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'group-hover:translate-x-0.5'}`}
      />
    </a>
  )
}
