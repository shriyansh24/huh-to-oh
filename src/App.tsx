import { Preferences } from '@ui-sdk/react/preferences'
import { MotionConfig } from 'motion/react'
import { useState } from 'react'
import { Bench } from './components/Bench'
import { Hero } from './components/Hero'
import { Line } from './components/Line'
import { colorScheme } from './lib/theme'

export function App() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <Preferences preferences={[colorScheme]}>
      <MotionConfig reducedMotion="user">
        <div id="top" className="min-h-screen bg-bg font-display text-ink">
          <Hero />
          <main>
            <Line open={open} onOpenChange={setOpen} />
            <Bench />
          </main>
          <footer className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-8 pb-12 text-[15px] text-ink2">
            <p className="m-0">Every picture on this page was drawn in JavaScript, stroke by stroke, for this site.</p>
            <p className="m-0">Every program here was run. Each lesson says with what, and when.</p>
          </footer>
        </div>
      </MotionConfig>
    </Preferences>
  )
}
