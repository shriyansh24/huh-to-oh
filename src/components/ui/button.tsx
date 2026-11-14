import { Button as SdkButton } from '@ui-sdk/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

// shadcn-style variants over the UI SDK Button: the SDK owns press, focus and disabled behaviour; this file only styles it.
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-display font-bold no-underline transition-[background,color,box-shadow] duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        solid: 'bg-accent text-on-accent hover:brightness-110',
        outline: 'border-[1.5px] border-current bg-transparent hover:bg-[color-mix(in_srgb,currentColor_8%,transparent)]',
        ghost: 'bg-transparent font-medium hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)]',
        pill: 'border-[1.5px] border-ink bg-sheet text-ink font-medium hover:bg-bg',
      },
      size: {
        md: 'h-[46px] px-5 rounded-button text-base',
        sm: 'h-11 px-3.5 rounded-button text-base',
        pill: 'h-11 px-4 rounded-pill text-base',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
)

type Props = ComponentProps<typeof SdkButton> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: Props) {
  return <SdkButton className={cn(buttonVariants({ variant, size }), className as string)} {...props} />
}
