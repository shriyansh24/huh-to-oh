import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { buttonVariants } from './ui/button'

// Nothing on the line is open yet. These stand in for links and buttons whose pages are still being written:
// they look like the real control, say "coming soon" out loud, and do nothing when pressed.

/** A small rubber stamp. Sits on a token surface (sheet or bg), so its colour always has contrast. */
export function SoonStamp({ className, hidden }: { className?: string; hidden?: boolean }) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className={cn(
        'inline-flex h-[22px] -rotate-2 items-center whitespace-nowrap rounded-[3px] border-[1.5px] border-dashed border-now bg-sheet px-1.5 font-mono text-[11.5px] font-medium leading-none text-now',
        className,
      )}
    >
      coming soon
    </span>
  )
}

type SoonProps = { children: ReactNode; className?: string; stamp?: 'inline' | 'corner' }

/** A nav item or call to action that isn't live yet. Announced as "<label>, coming soon", focusable, inert. */
export function Soon({ children, className, stamp = 'inline' }: SoonProps) {
  return (
    <span
      role="link"
      aria-disabled="true"
      tabIndex={0}
      title="Coming soon"
      className={cn('relative inline-flex cursor-not-allowed items-center gap-2 select-none', className)}
    >
      <span>{children}</span>
      <span className="sr-only">, coming soon</span>
      <SoonStamp hidden className={stamp === 'corner' ? 'absolute -right-3 -top-3.5' : undefined} />
    </span>
  )
}

export const soonButton = (variant: 'solid' | 'outline') => cn(buttonVariants({ variant }), 'hover:brightness-100 hover:bg-transparent')
