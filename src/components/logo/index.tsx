import type { ElementType } from 'react'

import { Link } from '@tanstack/react-router'

interface LogoProps {
  as?: ElementType | null
}

export function Logo({ as: Component = null }: LogoProps) {
  const link = (
    <Link
      to="/about"
      title="关于 Hertz.md"
      aria-label="关于 Hertz.md"
      className={`
        doto-font text-2xl font-bold tracking-tight text-foreground
        transition-colors
        hover:text-primary
      `}
    >
      Hertz
      <span className="relative -top-1">.</span>
      md
    </Link>
  )

  if (Component === null) {
    return link
  }

  return <Component>{link}</Component>
}
