import { createSearchController } from './lib/search'
import { Preferences } from '@ui-sdk/react/preferences'
import { MotionConfig } from 'motion/react'
import { useState } from 'react'
import { Bench } from './components/Bench'
import { Hero } from './components/Hero'
import { Line, type Highlight } from './components/Line'
import { SearchPalette, type SearchPick } from './components/SearchPalette'
import { colorScheme } from './lib/theme'

export function App() {
  const [search] = useState(createSearchController)
  const [searchOpen, setSearchOpen] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<Highlight>(null)
  const [picked, setPicked] = useState<string | null>(null)

  const pick = ({ key, rowIndex }: SearchPick) => {
    setPicked(key)
    setOpen(key)
    setHighlight({ key, rowIndex: rowIndex ?? -1, nonce: Date.now() })
  }

  return (
    <Preferences preferences={[colorScheme]}>
      <MotionConfig reducedMotion="user">
        <div id="top" className="min-h-screen bg-bg font-display text-ink">
          <Hero search={search} />
          <main>
            <Line open={open} onOpenChange={setOpen} highlight={highlight} />
            <Bench />
          </main>
          <footer className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-8 pb-12 text-[15px] text-ink2">
            <p className="m-0">Every picture on this page was drawn in JavaScript, stroke by stroke, for this site.</p>
            <p className="m-0">Every program here was run. Each lesson says with what, and when.</p>
          </footer>
          <SearchPalette
            controller={search}
            open={searchOpen}
            focusAfterClose={picked}
            onOpenChange={(o) => {
              if (o) setPicked(null)
              setSearchOpen(o)
            }}
            onPick={pick}
          />
        </div>
      </MotionConfig>
    </Preferences>
  )
}
