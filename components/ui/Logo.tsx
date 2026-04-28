import Link from 'next/link'

interface LogoProps {
  variant?: 'dark' | 'light'
  href?: string | null
  className?: string
  imgClassName?: string
}

// Logo component for Montessori Family Alliance.
//
// variant="dark"  - colored logo for use on white/light backgrounds
// variant="light" - white logo for use on dark backgrounds (marketing heroes)
//
// Pass href={null} to render as plain element (no link wrapper).
export default function Logo({
  variant = 'dark',
  href = '/',
  className = '',
  imgClassName = 'h-8 sm:h-9 w-auto',
}: LogoProps) {
  const src = variant === 'light' ? '/branding/logo-white.png' : '/branding/logo.png'

  const img = (
    <img
      src={src}
      alt="Montessori Family Alliance"
      className={imgClassName}
    />
  )

  if (href === null) return <span className={className}>{img}</span>

  return (
    <Link href={href} className={`inline-flex items-center ${className}`}>
      {img}
    </Link>
  )
}
