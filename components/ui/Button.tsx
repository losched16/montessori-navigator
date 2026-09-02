'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost'
type Size = 'lg' | 'md' | 'sm'

interface ButtonProps {
  variant?: Variant
  size?: Size
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
  'aria-label'?: string
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[color:var(--mfa-navy)] text-white hover:bg-[color:var(--mfa-navy-deep)] active:opacity-90',
  secondary: 'bg-white text-[color:var(--mfa-navy)] border border-[color:var(--mfa-navy)]/30 hover:border-[color:var(--mfa-navy)] hover:bg-[color:var(--mfa-navy-soft)]',
  soft: 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)] hover:opacity-90',
  ghost: 'bg-transparent text-[color:var(--mfa-navy)] hover:bg-[color:var(--mfa-navy-soft)]',
}

const SIZES: Record<Size, string> = {
  lg: 'min-h-[56px] px-6 text-[16px] rounded-2xl',
  md: 'min-h-[48px] px-5 text-[15px] rounded-2xl',
  sm: 'min-h-[44px] px-4 text-[14px] rounded-xl',
}

export default function Button({
  variant = 'primary', size = 'md', href, onClick, children, className,
  disabled, type = 'button', 'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = cn(
    'tap-scale inline-flex items-center justify-center gap-2 font-semibold transition select-none',
    VARIANTS[variant], SIZES[size],
    disabled && 'opacity-50 pointer-events-none',
    className,
  )
  if (href) {
    return <Link href={href} className={classes} aria-label={ariaLabel}>{children}</Link>
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  )
}
