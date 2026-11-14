# Huh → Oh

> Huh? Wait, what? How? Why? Oh!

**A free, from-scratch curriculum for learning how computers work by building them, from one bit to a model in production.**

🚧 **Work in progress.** Only the home page exists so far. Every station, module and paper on it is marked *coming soon* until its lessons are written and checked.

**Live:** https://shriyansh24.github.io/huh-to-oh/

---

## What this is

Huh → Oh is planned as one long line with 30 stations, one for every track, and nothing grouped together:

- **Start here:** how computers work before any one language
- **Languages:** Python, JavaScript, TypeScript, Go, Rust, C++ and low-level code, each its own station. Then the same problems solved in all of them, the languages calling each other, and how to build, test and observe each one
- **The machine and its systems:** the CPU and the kernel, networking, databases, distributed systems, cloud and delivery, reliability and security
- **Maths and models:** the maths, machine learning, reinforcement learning, LLM architecture and training, GPUs and inference, applied AI, safety and interpretability
- **Build it all:** a papers lab (read a landmark paper with your editor open and build it, 2017 to now), the Statechart Studio, and capstones

Every lesson works the same way: guess what will happen, run it for real, change one thing, and guess again.

## Why

Most people learn computers from the top down and never find out what is underneath. This curriculum goes the other way, and it should stay free for good.

## What's in this repo today

| Part | State |
|---|---|
| Home page (light "Butter" and dark "Night desk") | ✅ Built. Stations open to show every module on the way; the warm-up exercise runs |
| Interactive 404 page: draw the missing track and the train takes you home | ✅ Built |
| Pictures: every drawing is made stroke by stroke in JavaScript (`art/`) | ✅ Built |
| Lessons, search, glossary, papers lab, progress tracking | ⏳ Coming soon |

## Run it locally

Needs Node 22 or newer.

```bash
npm install
npm run dev            # dev server at http://localhost:5173
npm test               # behaviour tests (Vitest + Testing Library)
npm run build          # type-check and build to dist/
npm run build:single   # dist/index.html and dist/404.html as self-contained files (what the live site serves)
```

To redraw the pictures, see [`art/README.md`](art/README.md).

## How it's built

| Part | Used for |
|---|---|
| Vite, React, TypeScript | The app |
| Tailwind CSS v4 | Styling, with colours from `src/design/tokens.json` turned into CSS variables by `scripts/tokens.mjs` |
| [UI SDK](https://github.com/vercel-labs/ui) | Behaviour of the station list, toggles and form fields |
| shadcn/ui conventions | `cn()` and button variants as a styling layer |
| Motion | Small, purposeful animation; switched off when the reader asks for reduced motion |
| `@napi-rs/canvas` | Drawing the pictures in `art/` |

## Repository map

```
art/          the drawing kit and the scripts that draw every picture
data/         where the station and module list comes from
src/          the home page, the 404 page and shared parts
  design/     tokens (colours, type, spacing): the one source of truth for the look
  data/       stations, modules and where they sit on the drawing
  notfound/   the 404 page
test/         behaviour tests
404.html      entry for the not-found page
```

## Hosting

The site is served by GitHub Pages from the `gh-pages` branch, which holds only the two built files (`index.html`, `404.html`). There are no CI jobs yet. To publish, run `npm run build:single` and commit `dist/` to `gh-pages`.

## Contributing

Ideas, corrections and bug reports are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Lessons aren't open for contributions yet, because the format is still being settled.

## Credits, sources and citations

- [CREDITS.md](CREDITS.md): who to thank (everyone, really)
- [SOURCES.md](SOURCES.md): what this learns from and is inspired by
- [CITATIONS.md](CITATIONS.md): how to cite this, and who it cites
- [CITATION.cff](CITATION.cff): machine-readable citation

## License

[MIT](LICENSE) © 2026 Shriyansh Singh. The fonts bundled in the build are under the SIL Open Font License. See [SOURCES.md](SOURCES.md#fonts).
