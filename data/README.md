# data

**What it is.** Where the home page's station and module list comes from.

| File | What it is |
|---|---|
| `source/stations.json` | The 30 stations in order: plain name, one-sentence about, and which curriculum track feeds each one. One station per track. Nothing is grouped, so every language, TypeScript included, has its own |
| `source/poly-abouts.json` | One-line abouts for language modules whose titles don't already say what they cover |
| `source/bits-abouts.json` | One-line abouts for every systems and AI module |
| `../src/data/stations-full.json` | What the page reads: the stations, each with every module row (id, title, about), plus the first 40 papers for the papers lab. 255 rows in all |
| `../src/data/layout-day.json` | Where each station sits on the drawing. Written by `art/line.js` |

**How `stations-full.json` was made.** Module titles come from the curriculum's own module lists. The abouts were written by hand, because text cut from lesson openings stopped mid-sentence. The papers are the first 40 of the ranked paper list, 2017 to 2026, titles only.

**Not covered.** The script that merged those inputs ran once against the private curriculum workspace and isn't in this repo. Until it is, edit `stations-full.json` directly and keep `source/` in step.
