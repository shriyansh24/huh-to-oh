import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { App } from '../src/App'
import { STATIONS } from '../src/lib/data'
import { COLOR_SCHEME_KEY } from '../src/lib/theme'
import { checkGuess, WARMUP } from '../src/lib/warmup'

const tick = () => act(() => new Promise((r) => setTimeout(r, 0)))
const trigger = (name: string) =>
  screen.getAllByRole('button').find((b) => b.getAttribute('data-station') && within(b).queryByText(name, { selector: 'span' }))!

describe('data', () => {
  test('30 stations, nothing grouped, TypeScript has its own station', () => {
    expect(STATIONS).toHaveLength(30)
    expect(STATIONS.filter((s) => s.name === 'TypeScript')).toHaveLength(1)
    expect(STATIONS.reduce((n, s) => n + s.mods.length, 0)).toBe(255)
  })
})

describe('theme', () => {
  test('the toggle switches the scheme and saves it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await tick()
    const toggle = screen.getByRole('button', { name: 'Dark mode' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement).toHaveAttribute('data-color-scheme', 'dark')
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('dark')
    await user.click(toggle)
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('light')
  })
})

describe('stations', () => {
  test('a station opens to show every module, and only one is open at a time', async () => {
    const user = userEvent.setup()
    render(<App />)
    await tick()
    const rust = trigger('Rust')
    const go = trigger('Go')
    expect(rust).toHaveAttribute('aria-expanded', 'false')
    await user.click(rust)
    expect(rust).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(rust.getAttribute('aria-controls')!)!
    const rustStation = STATIONS.find((s) => s.name === 'Rust')!
    expect(within(panel).getAllByRole('listitem')).toHaveLength(rustStation.mods.length)

    await user.click(go)
    expect(go).toHaveAttribute('aria-expanded', 'true')
    expect(rust).toHaveAttribute('aria-expanded', 'false')
  })

  test('Escape closes the open station and returns focus to it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await tick()
    const py = trigger('Python')
    await user.click(py)
    expect(py).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(py).toHaveAttribute('aria-expanded', 'false')
    expect(py).toHaveFocus()
  })
})

describe('search', () => {
  test('finds TypeScript and opens its station', async () => {
    const user = userEvent.setup()
    render(<App />)
    await tick()
    await user.click(screen.getAllByRole('button', { name: /^Search/ })[0])
    const input = await screen.findByRole('combobox', { name: 'Search stations and modules' })
    await user.type(input, 'TypeScript')
    await user.keyboard('{Enter}')
    await tick()
    const ts = trigger('TypeScript')
    expect(ts).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('guess first, then run it', () => {
  test('the checker compares against the recorded output exactly', () => {
    expect(checkGuess('12', WARMUP[0].output)).toBe(true)
    expect(checkGuess(' 12 ', WARMUP[0].output)).toBe(true)
    expect(checkGuess('13', WARMUP[0].output)).toBe(false)
    expect(checkGuess('13', WARMUP[1].output)).toBe(true)
  })

  test('running a guess shows the real output and the follow-up', async () => {
    const user = userEvent.setup()
    render(<App />)
    await tick()
    await user.type(screen.getByLabelText('What does it print?'), '13')
    await user.click(screen.getByRole('button', { name: 'Run it' }))
    expect(screen.getByText(/You guessed 13\. It printed 12\./)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Change one thing' }))
    await user.type(screen.getByLabelText(/afternoon is now 8/), '13')
    await user.click(screen.getByRole('button', { name: 'Run it' }))
    expect(await screen.findByText(/You guessed 13\. That is what it printed\./)).toBeInTheDocument()
  })
})
