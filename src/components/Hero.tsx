import { DialogShortcut, DialogTrigger } from '@ui-sdk/react/dialog'
import type { SearchController } from '../lib/search'
import heroDay from '../assets/page-day.jpg'
import heroNight from '../assets/page-night.jpg'
import { STATIONS } from '../lib/data'
import { ThemeToggle } from './ThemeToggle'
import { Button, buttonVariants } from './ui/button'
import { cn } from '../lib/cn'

const HERO_ALT =
  'A crayon drawing of an open notebook at dusk: a pencil diagram of one bit, a gate, a register and an adder turns into railway track, and a small train climbs off the page into hills toward a hilltop town, under stars wired like a small network'

const papers = STATIONS.find((s) => s.noun === 'papers')!
const first = STATIONS[0]

// Hero text sits on the drawing, not on a token surface: dark ink on the day sky, pale ink on the night sky.
const heroInk = 'text-[#26231B] dark:text-[#F4EEE3] [text-shadow:0_0_8px_rgb(253_249_233/0.9),0_0_2px_rgb(253_249_233/0.9)] dark:[text-shadow:0_0_8px_rgb(20_18_30/0.9),0_0_2px_rgb(20_18_30/0.95)]'

export function Hero({ search }: { search: SearchController }) {
  return (
    <section aria-label="Welcome" className="relative aspect-[16/9] w-full overflow-hidden max-[899px]:flex max-[899px]:aspect-auto max-[899px]:flex-col max-[899px]:gap-6 max-[899px]:pb-10">
      <img src={heroDay} alt={HERO_ALT} className="day-only absolute inset-0 block h-full w-full object-cover" />
      <img src={heroNight} alt={HERO_ALT} className="night-only absolute inset-0 block h-full w-full object-cover" />
      <header className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-3 px-[4%] py-[22px] max-[899px]:relative">
        <a href="#top" className={cn('font-hand text-[26px] font-bold no-underline', heroInk)}>
          Huh → Oh
        </a>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1.5">
          <a href="#line" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), heroInk)}>
            The line
          </a>
          <a href={`#${papers.key}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), heroInk)}>
            Papers lab
          </a>
          <span role="link" aria-disabled="true" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), heroInk, 'cursor-not-allowed opacity-80 hover:bg-transparent')}>
            Glossary <span className="font-mono text-[11px] font-normal">coming soon</span>
          </span>
          <DialogTrigger controller={search} shortcut="mod+k" className={buttonVariants({ variant: 'pill', size: 'pill' })}>
            Search
            <DialogShortcut className="font-mono text-[12px] font-normal text-ink2" />
          </DialogTrigger>
          <ThemeToggle />
        </nav>
      </header>
      <div className="absolute left-[40%] top-[11%] flex w-[52%] flex-col gap-[18px] max-[899px]:relative max-[899px]:inset-auto max-[899px]:mx-4 max-[899px]:w-auto max-[899px]:rounded-card max-[899px]:bg-sheet/90 max-[899px]:p-5">
        <p className={cn('m-0 font-hand text-[clamp(15px,1.3vw,20px)] font-bold', heroInk)}>Huh? Wait, what? How? Why? Oh!</p>
        <h1 className={cn('m-0 font-display text-[clamp(40px,5.2vw,78px)] font-bold leading-none', heroInk)}>
          You draw it.
          <br />
          Then it runs.
        </h1>
        <p className={cn('m-0 max-w-[46ch] font-reading text-[clamp(16px,1.35vw,20px)] leading-normal', heroInk)}>
          Learn how computers work by building them, from one bit to a model in production. Seven languages, the machine underneath, and the systems that train and serve AI. Free, and from scratch.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button render={<a href={`#${first.key}`} />}>Start at the bit</Button>
          <DialogTrigger controller={search} className={cn(buttonVariants({ variant: 'outline' }), heroInk)}>
            Find your station
          </DialogTrigger>
        </div>
      </div>
    </section>
  )
}
