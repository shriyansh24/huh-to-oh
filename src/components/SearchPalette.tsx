import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
} from '@ui-sdk/react/command'
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogTitle } from '@ui-sdk/react/dialog'
import type { SearchController } from '../lib/search'
import { STATIONS } from '../lib/data'

export type SearchPick = { key: string; rowIndex: number | null }

type Props = {
  controller: SearchController
  open: boolean
  focusAfterClose: string | null
  onOpenChange: (open: boolean) => void
  onPick: (pick: SearchPick) => void
}

export function parseValue(value: string): SearchPick {
  const [key, row] = value.split('|')
  return { key, rowIndex: row === undefined ? null : Number(row) }
}

export function SearchPalette({ controller, open, focusAfterClose, onOpenChange, onPick }: Props) {
  return (
    <Dialog controller={controller} open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent
        keepMounted
        initialFocus='[data-slot="command-input"]'
        finalFocus={focusAfterClose ? `[data-station="${focusAfterClose}"]` : undefined}
        className="fixed left-1/2 top-[10vh] z-50 flex max-h-[76vh] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 flex-col overflow-hidden rounded-card border-[1.5px] border-ink bg-sheet text-ink"
        style={{ boxShadow: '6px 8px 0 var(--shadow)' }}
      >
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
          <DialogTitle className="m-0 font-display text-lg font-bold">Find a station or module</DialogTitle>
          <DialogClose aria-label="Close search" className="h-9 cursor-pointer rounded-button border-0 bg-transparent px-2.5 font-mono text-[13px] text-ink2 hover:bg-bg">
            Esc
          </DialogClose>
        </div>
        <Command
          onAction={(value) => {
            onPick(parseValue(value))
            onOpenChange(false)
          }}
          className="flex min-h-0 flex-col"
        >
          <div className="mx-4 mb-2 mt-3 flex items-center gap-2 rounded-button border-[1.5px] border-ink bg-bg px-3 focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-focus">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <CommandInput
              aria-label="Search stations and modules"
              placeholder="TypeScript, ownership, KV cache…"
              className="h-11 w-full border-0 bg-transparent font-display text-base text-ink placeholder:text-ink2 focus-visible:outline-none"
            />
          </div>
          <CommandEmpty className="font-reading text-ink2 data-[empty]:px-4 data-[empty]:py-6">Nothing on the line matches that yet.</CommandEmpty>
          <CommandList className="min-h-0 overflow-y-auto px-2 pb-3">
            {STATIONS.map((s) => (
              <CommandGroup key={s.key} className="pt-2">
                <CommandGroupLabel className="px-2 pb-1 font-mono text-[12px] text-ink2">
                  Station {s.order + 1}
                </CommandGroupLabel>
                <CommandItem value={s.key} label={s.name} keywords={[s.about]} className="flex cursor-pointer flex-col rounded-button px-2 py-2">
                  <CommandItemText className="font-display text-[16px] font-bold" />
                  <span className="font-reading text-[14px] text-ink2">{s.about}</span>
                </CommandItem>
                {s.mods.map((m, i) => (
                  <CommandItem
                    key={`${s.key}-${m.id}-${i}`}
                    value={`${s.key}|${i}`}
                    label={`${m.title}`}
                    keywords={[m.id, m.about, s.name]}
                    className="flex cursor-pointer items-baseline gap-2.5 rounded-button px-2 py-1.5"
                  >
                    <span className="w-[46px] shrink-0 font-mono text-[12.5px] text-ink2">{m.id}</span>
                    <span className="flex min-w-0 flex-col">
                      <CommandItemText className="text-[14.5px] font-medium" />
                      <span className="truncate text-[12.5px] text-ink2">{s.name}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
