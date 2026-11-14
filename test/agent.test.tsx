import { act, render } from '@testing-library/react'
import { createAgent } from '@ui-sdk/react/agent'
import { expect, test } from 'vitest'
import { App } from '../src/App'

test('an agent can find every control by name and open a station', async () => {
  const agent = createAgent()
  render(<App />)
  await act(() => new Promise((r) => setTimeout(r, 0)))
  const entries = agent.snapshot().filter((e) => !e.offPage && e.component !== 'more')
  for (const e of entries) expect(e.label, `${e.component} ${e.ref} has no name`).toBeTruthy()
  const labels = entries.map((e) => e.label)
  for (const l of ['Dark mode', 'Run it', 'Stations on the line']) expect(labels.some((x) => x?.includes(l)), `${l} missing`).toBe(true)
})
