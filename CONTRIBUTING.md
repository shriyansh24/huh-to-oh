# Contributing to Huh → Oh

Thanks for wanting to help. This project is early: the home page exists, and the lessons are still being written.

## What's useful right now

- **Bug reports:** something looks broken, unreadable or wrong in light or dark mode, on a phone or a big screen, with a keyboard or a screen reader.
- **Corrections:** a module title or one-line description that is wrong or unclear.
- **Ideas:** what you'd want from a station, a lesson or the papers lab.

Open an issue for any of these. The templates will ask for what helps.

## What isn't open yet

Lesson content. The lesson format, depth rules and review process are still being settled. Once they are, this file will say how to write and review a lesson.

## Working on the code

```bash
npm install
npm run dev
npm test
```

Before you open a pull request:

1. `npm test` passes and `npm run build` finishes with no type errors.
2. You checked the change in **both** light and dark mode, and at a phone width (390px) as well as a desktop width.
3. New behaviour has a test that would fail without your change.
4. The pull request says what was wrong, what you changed, why, and how you checked it.

## House rules for the look

These keep the site recognisable. Please don't break them in a pull request:

- Colours, type and spacing come from `src/design/tokens.json`. Don't hard-code new colours in components.
- No pure white surfaces. The page is warm paper: "Butter" by day, "Night desk" by night.
- No thick coloured stripe down one side of a card, row or callout.
- Text contrast at least 4.5:1 in both modes.
- Pictures are original and drawn in code (`art/`). No stock images, traced art, or other people's characters, logos or lettering.
- Motion explains something or it doesn't ship, and it switches off under `prefers-reduced-motion`.

## Writing style

Plain words, short sentences, active voice. Say what something does before what it's called. If a sentence could be cut and nobody would miss it, cut it.

## Commits

Small commits that each do one thing, with messages in the form `type(scope): what changed`. Types: `feat`, `fix`, `docs`, `test`, `build`, `chore`, `refactor`.

## Conduct

Everyone taking part agrees to the [Code of Conduct](CODE_OF_CONDUCT.md).
