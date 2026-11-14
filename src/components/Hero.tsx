import heroDay from '../assets/page-day.jpg'
import heroNight from '../assets/page-night.jpg'
import { Soon, soonButton } from './Soon'
import { ThemeToggle } from './ThemeToggle'
import { buttonVariants } from './ui/button'
import { cn } from '../lib/cn'

const HERO_ALT =
  'A crayon drawing of an open notebook at dusk: a pencil diagram of one bit, a gate, a register and an adder turns into railway track, and a small train climbs off the page into hills toward a hilltop town, under stars wired like a small network'

// Hero text sits on the drawing, not on a token surface: dark ink on the day sky, pale ink on the night sky.
const heroInk = 'text-[#26231B] dark:text-[#F4EEE3] [text-shadow:0_0_8px_rgb(253_249_233/0.9),0_0_2px_rgb(253_249_233/0.9)] dark:[text-shadow:0_0_8px_rgb(20_18_30/0.9),0_0_2px_rgb(20_18_30/0.95)]'

export function Hero() {
  return (
    <section aria-label="Welcome" className="relative aspect-[16/9] w-full overflow-hidden max-[899px]:flex max-[899px]:aspect-auto max-[899px]:flex-col max-[899px]:gap-6 max-[899px]:pb-10">
      <img src={heroDay} alt={HERO_ALT} className="day-only absolute inset-0 block h-full w-full object-cover" />
      <img src={heroNight} alt={HERO_ALT} className="night-only absolute inset-0 block h-full w-full object-cover" />
      <header className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-3 px-[4%] py-[22px] max-[899px]:relative">
        <a href="#top" className={cn('font-hand text-[26px] font-bold no-underline', heroInk)}>
          Huh → Oh
        </a>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1.5">
          {['The line', 'Papers lab', 'Glossary'].map((label) => (
            <Soon key={label} stampClassName="max-[1279px]:hidden" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), heroInk, 'hover:bg-transparent')}>
              {label}
            </Soon>
          ))}
          <Soon stampClassName="max-[1279px]:hidden" className={cn(buttonVariants({ variant: 'pill', size: 'pill' }), 'hover:bg-sheet')}>
            Search
          </Soon>
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
        <div className="flex flex-wrap gap-x-6 gap-y-5 pt-1">
          <Soon stamp="corner" className={soonButton('solid')}>
            Start at the bit
          </Soon>
          <Soon stamp="corner" className={cn(soonButton('outline'), 'border-ink bg-sheet text-ink hover:bg-sheet')}>
            Find your station
          </Soon>
        </div>
        <p className="m-0 self-start rounded-[3px] bg-sheet/90 px-2 py-0.5 font-hand text-[clamp(14px,1.15vw,17px)] font-bold text-ink">Being written now. Every station opens when its lessons are checked.</p>
      </div>
    </section>
  )
}
