import { Toggle } from '@ui-sdk/react/toggle'
import { usePreference } from '@ui-sdk/react/preferences'
import { colorScheme } from '../lib/theme'
import { buttonVariants } from './ui/button'
import { cn } from '../lib/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved } = usePreference(colorScheme)
  const dark = resolved === 'dark'
  return (
    <Toggle
      aria-label="Dark mode"
      pressed={dark}
      onPressedChange={(pressed) => colorScheme.set(pressed ? 'dark' : 'light')}
      className={cn(buttonVariants({ variant: 'pill', size: 'pill' }), 'gap-2', className)}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {dark ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
          </>
        )}
      </svg>
      <span>{dark ? 'Night' : 'Day'}</span>
    </Toggle>
  )
}
