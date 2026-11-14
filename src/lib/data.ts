import stationsJson from '../data/stations-full.json'
import layoutJson from '../data/layout-day.json'

export type Row = { id: string; title: string; about: string }
export type Station = { name: string; about: string; part?: string; current?: boolean; mods: Row[] }
export type PlacedStation = { index: number; name: string; x: number; y: number; side: 'left' | 'right' }
export type Band = { part: string | null; top: number; h: number }

type LayoutJson = {
  width: number
  height: number
  bands: Band[]
  stations: PlacedStation[]
  end: { top: number; h: number }
  current?: { index: number }
}

// Day and night layouts are drawn from the same geometry (line.js), so one file places both pictures.
const layout = layoutJson as LayoutJson
const stations = stationsJson as Station[]

if (layout.stations.length !== stations.length) {
  throw new Error(`layout has ${layout.stations.length} stations but stations-full.json has ${stations.length}`)
}

export const W = layout.width
export const H = layout.height
export const BANDS = layout.bands
export const END = layout.end
export const CURRENT = layout.current?.index ?? -1

export type StationView = Station & PlacedStation & { key: string; order: number; noun: 'modules' | 'papers' }

export const STATIONS: StationView[] = layout.stations.map((p, order) => {
  const s = stations[p.index]
  return {
    ...s,
    ...p,
    key: `station-${order + 1}`,
    order,
    noun: s.name === 'Papers lab' ? 'papers' : 'modules',
  }
})

export const PART_COPY: { title: string; body: string }[] = [
  { title: 'The line, from the bit to the town', body: '30 stations, one for every track, in order. None are open yet. Open a station to see every module on the way and what each one is about.' },
  { title: 'Languages', body: 'Seven languages, each with its own line of stations, from first steps down to the runtime underneath. Then the same problems solved in all of them, and the languages calling each other.' },
  { title: 'The machine and its systems', body: 'What runs under your code: the CPU and the kernel, the network, databases, many machines agreeing on one answer, and keeping all of it up.' },
  { title: 'Maths and models', body: 'The maths models are made of, then machine learning from a straight line to large language models, the GPUs that serve them, and what can go wrong.' },
  { title: 'Build it all', body: 'Read the papers and build them. Build the tool that draws this site. Then one capstone in your languages and one in AI systems.' },
]

export function stationsInBand(i: number): StationView[] {
  const top = BANDS[i].top
  const next = i + 1 < BANDS.length ? BANDS[i + 1].top : END.top
  return STATIONS.filter((s) => s.y > top && s.y < next)
}

export const pctX = (v: number) => `${((v / W) * 100).toFixed(3)}%`
export const pctY = (v: number) => `${((v / H) * 100).toFixed(3)}%`
