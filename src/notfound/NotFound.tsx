import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import geometry from '../data/lost-geometry.json'
import lostDay from '../assets/lost-day.jpg'
import lostNight from '../assets/lost-night.jpg'
import { buttonVariants } from '../components/ui/button'
import { cn } from '../lib/cn'
import { homeHref } from './home'
import { QUOTES } from './quotes'
import { arch, judge, railPaths, toD, type Pt } from './track'

type Phase = 'idle' | 'drawing' | 'laying' | 'rolling' | 'arrived'

// The JSON is written by art/lost.js; its point arrays are always pairs.
const G = geometry as unknown as { width: number; height: number; leftTrack: Pt[]; leftEnd: Pt; rightStart: Pt; rightTrack: Pt[] }
const CAR_GAP = 36
const CARS = 4
// Where the train waits: just short of the end of the rails on the near side.
const PARKED = G.leftTrack.reduce((n, p, i) => (i ? n + Math.hypot(p[0] - G.leftTrack[i - 1][0], p[1] - G.leftTrack[i - 1][1]) : 0), 0) - 14

const ALT =
  'A crayon drawing of a notebook page torn through. A railway runs in from the left past a signpost whose three arrows all point different ways, and stops at the torn edge. Through the tear you can see sky. On the far side the railway carries on up a cut-paper hill to a small town, past a grazing cow.'

const HINTS = {
  start: 'Start your line at the end of the rails, on the left edge of the tear.',
  end: 'So close. Carry it all the way to the rails on the far side.',
  short: 'Press and drag across the gap to draw the track.',
} as const

// Walk a polyline by distance: the train's position and heading at `s` units along the route.
function pointAt(route: Pt[], cum: number[], s: number): { p: Pt; ang: number } {
  const total = cum[cum.length - 1]
  const d = Math.max(0, Math.min(total, s))
  let i = 1
  while (i < cum.length - 1 && cum[i] < d) i++
  const a = route[i - 1], b = route[i], seg = cum[i] - cum[i - 1] || 1, t = (d - cum[i - 1]) / seg
  return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }
}

export function NotFound() {
  const reduced = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [stroke, setStroke] = useState<Pt[]>([])
  const [bridge, setBridge] = useState<Pt[] | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [q, setQ] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [s, setS] = useState(PARKED)
  const home = homeHref()

  // The whole route the train can run: the last stretch of rails, the reader's bridge, the far side.
  const route = useMemo<Pt[]>(() => [...G.leftTrack, ...(bridge ? bridge.slice(1, -1) : []), ...(bridge ? G.rightTrack : [])], [bridge])
  const cum = useMemo(() => route.reduce<number[]>((acc, p, i) => (i ? [...acc, acc[i - 1] + Math.hypot(p[0] - route[i - 1][0], p[1] - route[i - 1][1])] : [0]), []), [route])

  // Lay, then roll: a short pause so the reader sees the rails appear, then the train runs to the town.
  useEffect(() => {
    if (phase !== 'laying') return
    const t = window.setTimeout(() => {
      if (reduced) {
        setS(cum[cum.length - 1] - 6)
        setPhase('arrived')
      } else setPhase('rolling')
    }, reduced ? 0 : 520)
    return () => window.clearTimeout(t)
  }, [phase, reduced, cum])
  useEffect(() => {
    if (phase !== 'rolling') return
    const end = cum[cum.length - 1] - 6
    const start = performance.now(), from = PARKED, dur = 1400 + (end - from) * 2.4
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
      setS(from + (end - from) * e)
      if (k < 1) raf = requestAnimationFrame(tick)
      else setPhase('arrived')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, cum])

  const toSvg = (e: PointerEvent): Pt | null => {
    const svg = svgRef.current, m = svg?.getScreenCTM()
    if (!svg || !m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (phase === 'laying' || phase === 'rolling' || phase === 'arrived') return
    const p = toSvg(e)
    if (!p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setStroke([p])
    setHint(null)
    setPhase('drawing')
  }
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (phase !== 'drawing') return
    const p = toSvg(e)
    if (p) setStroke((st) => [...st, p])
  }
  const up = () => {
    if (phase !== 'drawing') return
    const r = judge(stroke, G.leftEnd, G.rightStart)
    setStroke([])
    if (r.ok) {
      setBridge(r.path)
      setPhase('laying')
    } else {
      setHint(HINTS[r.reason])
      setPhase('idle')
    }
  }
  const layForMe = () => {
    setHint(null)
    setBridge(arch(G.leftEnd, G.rightStart))
    setPhase('laying')
  }
  const again = () => {
    setBridge(null)
    setS(PARKED)
    setPhase('idle')
  }

  const done = phase === 'rolling' || phase === 'arrived'
  const rails = bridge ? railPaths(bridge) : null
  const quote = QUOTES[q]
  const cars = Array.from({ length: CARS }, (_, k) => pointAt(route, cum, s - k * CAR_GAP))

  return (
    <div className="lost relative min-h-dvh overflow-hidden bg-bg font-display text-ink">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${G.width} ${G.height}`}
        preserveAspectRatio="xMaxYMax slice"
        className="lost-scene absolute inset-0 block h-full w-full touch-none select-none"
        role="img"
        aria-label={ALT}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{ cursor: done ? 'default' : 'crosshair' }}
      >
        <defs>
          <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
          </filter>
        </defs>
        <image className="day-only" href={lostDay} width={G.width} height={G.height} />
        <image className="night-only" href={lostNight} width={G.width} height={G.height} />

        {/* the reader's pencil while they draw */}
        {stroke.length > 1 && <path d={toD(stroke)} fill="none" stroke="var(--ink2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#pencil)" />}

        {/* the bridge they laid */}
        {rails && (
          <g filter="url(#pencil)">
            <motion.path d={rails.ties} fill="none" stroke="#8A6A4E" strokeWidth="3.2" strokeLinecap="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45 }} />
            <motion.path d={rails.rails} fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45 }} />
          </g>
        )}

        {/* the train: an engine and three cars carrying bits */}
        <g aria-hidden="true">
          {cars
            .slice()
            .reverse()
            .map(({ p, ang }, i) => {
              const engine = i === CARS - 1
              return (
                <g key={i} transform={`translate(${p[0].toFixed(1)} ${(p[1] - 9).toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})`}>
                  <rect x="-15" y="-8" width="30" height="16" rx="2" fill={engine ? '#C24A3A' : '#3D52B0'} stroke="var(--ink)" strokeWidth="1.5" />
                  {engine ? <rect x="6" y="-15" width="5" height="8" fill="#C24A3A" stroke="var(--ink)" strokeWidth="1.2" /> : <rect x="-11" y="-11" width="22" height="4" fill="#F7D27A" />}
                </g>
              )
            })}
          {phase === 'rolling' && !reduced && (
            <circle cx={cars[0].p[0] + 4} cy={cars[0].p[1] - 34} r="7" fill="var(--sheet)" opacity="0.8">
              <animate attributeName="r" values="4;12" dur="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0" dur="0.7s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      </svg>

      <main className="lost-copy relative z-[1] flex max-w-[620px] flex-col gap-4 px-[5vw] pt-[5vh] pb-8">
        <a href={home} className="font-hand text-[24px] font-bold text-ink no-underline">
          Huh → Oh
        </a>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={done ? 'oh' : 'huh'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3"
          >
            <p className="m-0 flex items-baseline gap-3 font-hand text-[clamp(32px,3.4vw,50px)] font-bold leading-none text-now">
              {done ? 'Oh!' : 'Huh?'}
              <span className="font-mono text-[14px] font-normal text-ink2">{done ? 'found the way' : '404 · not on the line'}</span>
            </p>
            <h1 className="m-0 font-display text-[clamp(28px,3.1vw,46px)] font-bold leading-[1.05]">{done ? 'There it goes.' : "This page isn't on the line."}</h1>
            {done ? (
              <p className="m-0 font-reading text-lg leading-normal text-ink2">
                That's how every lesson here works. Something doesn't fit, you look closer, you build the missing piece, and then it runs.
              </p>
            ) : (
              <p className="m-0 font-reading text-lg leading-normal text-ink2">
                There's no station here yet. It may be a lesson that isn't written, or a typo. The rails stop at the tear, so <strong className="font-bold text-ink">draw the missing track across the gap</strong> and the train will take you somewhere real.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <p aria-live="polite" className="m-0 min-h-[1.5em] font-hand text-[17px] font-bold text-now">
          {hint ?? (phase === 'laying' ? 'Laying track…' : phase === 'rolling' ? 'All aboard.' : '')}
        </p>

        <div className="flex flex-wrap gap-3">
          {phase === 'arrived' ? (
            <>
              <a href={home} className={buttonVariants({ variant: 'solid' })}>
                Take the train home
              </a>
              <button type="button" onClick={again} className={cn(buttonVariants({ variant: 'outline' }), 'text-ink')}>
                Draw it again
              </button>
            </>
          ) : (
            <>
              <a href={home} className={buttonVariants({ variant: 'solid' })}>
                Back to the home page
              </a>
              <button type="button" onClick={layForMe} disabled={phase === 'laying' || phase === 'rolling'} className={cn(buttonVariants({ variant: 'outline' }), 'text-ink')}>
                Lay the track for me
              </button>
            </>
          )}
        </div>

      </main>

      <figure className="lost-quote absolute right-[4vw] top-[7vh] z-[1] m-0 flex w-[min(400px,34vw)] rotate-[0.8deg] flex-col gap-2 rounded-card border-[1.5px] border-ink bg-sheet px-5 py-4" style={{ boxShadow: '3px 4px 0 var(--shadow)' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={q} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2">
            <blockquote className="m-0 font-reading text-[19px] leading-[1.45] text-ink">“{quote.text}”</blockquote>
            <figcaption className="font-mono text-[13px] text-ink2">
              {quote.who}, {quote.where}
              {quote.attributed ? ' (attributed)' : ''}
            </figcaption>
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => setQ((i) => (i + 1) % QUOTES.length)} className="self-start cursor-pointer border-0 bg-transparent p-0 font-display text-[14.5px] font-bold text-accent">
          Another one ↻
        </button>
      </figure>
    </div>
  )
}
