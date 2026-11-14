import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui-sdk/react/accordion'
import { motion } from 'motion/react'
import { useRef, type KeyboardEvent } from 'react'
import lineDay from '../assets/line-day.jpg'
import lineNight from '../assets/line-night.jpg'
import { BANDS, CURRENT, END, H, PART_COPY, STATIONS, W, pctX, pctY, stationsInBand, type StationView } from '../lib/data'
import { cn } from '../lib/cn'
import { SoonStamp } from './Soon'

const LINE_ALT =
  'The notebook page continues as one long crayon drawing. The pencil line from the top of the page becomes a railway that winds down past 30 stations. Between groups of stations, cut-paper scenes stand up off the page: a small station with a clock, hills with a tunnel and seven houses, a city of chips with telephone poles, an observatory under wired stars, a river crossed by a red bridge with paper planes overhead, and at the bottom a hilltop town where the line ends. Each station has its own small drawing: a signpost, a punch card, a logic gate, a house for each language, a gear, two tin cans on a string, a chip, a database drum, a lighthouse, a neural network, a maze, a stack of blocks, a graphics card, an easel and a radio mast.'

const CARD_W = 400
const TILTS = [-0.6, 0.5, -0.3, 0.7, -0.5, 0.4]

type LineProps = {
  open: string | null
  onOpenChange: (key: string | null) => void
}

export function Line({ open, onOpenChange }: LineProps) {
  const items: { y: number; node: React.ReactNode }[] = []

  BANDS.forEach((b, i) => {
    const first = i === 0
    const count = stationsInBand(i).length
    items.push({
      y: b.top,
      node: (
        <div
          key={`part-${i}`}
          className="line-item line-head absolute z-[1] flex flex-col gap-2.5"
          style={{ left: '6%', top: pctY(b.top + (first ? 40 : 70)), width: '38%' }}
        >
          {/* The top band sits on the lamp-lit part of the night drawing, so it keeps dark ink in both schemes. */}
          <p className={cn('m-0 font-mono text-[13px]', first ? 'text-[#2E2A22] max-[899px]:text-ink2' : 'text-ink2')}>
            Part {i + 1} of 5 · {count} stations
          </p>
          <h2
            id={first ? 'line-h' : `part-${i + 1}-h`}
            className={cn('m-0 font-display font-bold', first ? 'text-[40px] text-[#1E1B15] max-[899px]:text-ink' : 'text-[36px] text-ink')}
            style={{ lineHeight: 1.05 }}
          >
            {PART_COPY[i].title}
          </h2>
          <p className={cn('m-0 max-w-[44ch] font-reading text-lg leading-normal', first ? 'text-[#2E2A22] max-[899px]:text-ink2' : 'text-ink2')}>
            {PART_COPY[i].body}
          </p>
        </div>
      ),
    })
  })

  STATIONS.forEach((s) => {
    items.push({ y: s.y, node: <StationItem key={s.key} s={s} open={open === s.key} onClose={() => onOpenChange(null)} /> })
  })

  items.push({
    y: END.top,
    node: (
      <div key="end" className="line-item line-head absolute z-[1] flex flex-col gap-2.5" style={{ left: '5%', top: pctY(END.top + 190), width: '28%' }}>
        <h2 id="end-h" className="m-0 font-display text-[32px] font-bold text-ink" style={{ lineHeight: 1.1 }}>
          At the end of the line, look up
        </h2>
        <p className="m-0 font-reading text-lg leading-normal text-ink2">
          The stars over the town are wired like a small network. By the last station you will have built one, from the same gates and adders you drew at the first.
        </p>
      </div>
    ),
  })

  items.sort((a, b) => a.y - b.y)

  return (
    <section id="line" aria-labelledby="line-h" className="line-stage relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
      <img className="line-img day-only absolute inset-0 block h-full w-full" src={lineDay} alt={LINE_ALT} />
      <img className="line-img night-only absolute inset-0 block h-full w-full" src={lineNight} alt={LINE_ALT} />
      {STATIONS.map((s) => (
        <span
          key={`dot-${s.key}`}
          aria-hidden="true"
          className={cn('line-dot absolute z-[1] box-border h-[18px] w-[18px] rounded-full border-2 border-ink', s.index === CURRENT ? 'bg-now' : 'bg-sheet')}
          style={{ left: `calc(${pctX(s.x)} - 9px)`, top: `calc(${pctY(s.y)} - 9px)` }}
        />
      ))}
      <Accordion
        aria-label="Stations on the line"
        value={open ? [open] : []}
        onValueChange={(v) => onOpenChange(v.length ? (v[v.length - 1] as string) : null)}
        hiddenUntilFound
        className="contents"
      >
        {items.map((it) => it.node)}
      </Accordion>
    </section>
  )
}

function StationItem({ s, open, onClose }: { s: StationView; open: boolean; onClose: () => void }) {
  const isCurrent = s.index === CURRENT
  const left = s.side === 'left' ? s.x - 36 - CARD_W : s.x + 36
  const tilt = TILTS[s.order % TILTS.length]
  const triggerRef = useRef<HTMLButtonElement>(null)
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      onClose()
      triggerRef.current?.focus()
    }
  }

  return (
    <AccordionItem
      value={s.key}
      id={s.key}
      onKeyDown={onKeyDown}
      className={cn('line-item absolute', open ? 'z-[6]' : 'z-[2]')}
      style={{ left: pctX(left), top: pctY(s.y - 50), width: pctX(CARD_W), scrollMarginTop: '24px' }}
    >
      <AccordionHeader className="m-0">
        <AccordionTrigger ref={triggerRef} data-station={s.key} className="station-trigger block w-full cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-ink">
          <span
            className={cn('station-card flex flex-col gap-1 rounded-card bg-sheet px-4 pb-3 pt-3.5', isCurrent ? 'border-2 border-now' : 'border-[1.5px] border-ink')}
            style={{ transform: `rotate(${tilt}deg)` }}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[12.5px] font-normal text-ink2">
                Station {s.order + 1} · {s.mods.length} {s.noun}
              </span>
              {isCurrent ? <span className="font-hand text-[15px] font-bold text-now">you are here</span> : <SoonStamp />}
            </span>
            <span className="font-display text-[22px] font-bold leading-[1.15]">{s.name}</span>
            <span className="font-reading text-[15.5px] font-normal leading-[1.45] text-ink2">{s.about}</span>
            <span className="mt-1 flex items-center gap-1.5 text-[14.5px] font-bold text-accent">
              {open ? 'Hide the list' : `See every ${s.noun === 'papers' ? 'paper' : 'module'} on the way`}
              <motion.span aria-hidden="true" className="inline-block" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                ↓
              </motion.span>
            </span>
          </span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel aria-label={`${s.name} ${s.noun}`}>
        <div className="mt-1.5 max-h-[440px] overflow-y-auto rounded-card border-[1.5px] border-ink bg-sheet px-4 pb-2.5 pt-1" style={{ boxShadow: '4px 6px 0 var(--shadow)' }}>
          <ol className="m-0 list-none p-0">
            {s.mods.map((m, i) => (
              <motion.li
                key={`${m.id}-${m.title}`}
                className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-start gap-2.5 border-t border-rule py-2.5 first:border-t-0"
                initial={open ? { opacity: 0, y: -4 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i, 14) * 0.018 }}
              >
                <span className="pt-0.5 font-mono text-[13px] text-ink2">{m.id}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-bold leading-[1.3]">{m.title}</span>
                  {m.about && <span className="font-reading text-[14.5px] leading-[1.45] text-ink2">{m.about}</span>}
                </span>
                <span className="pt-0.5 font-mono text-[11.5px] text-now">soon</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </AccordionPanel>
    </AccordionItem>
  )
}
