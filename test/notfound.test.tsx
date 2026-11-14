import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import geometry from '../src/data/lost-geometry.json'
import { Derailed } from '../src/components/Derailed'
import { homeHref, NotFound } from '../src/notfound/NotFound'
import { QUOTES } from '../src/notfound/quotes'
import { arch, judge, type Pt } from '../src/notfound/track'

const from = geometry.leftEnd as Pt
const to = geometry.rightStart as Pt

describe('drawing the missing track', () => {
  test('a stroke from the rail end to the far rails is accepted and snapped onto both ends', () => {
    const r = judge(arch(from, to, 30, 30), from, to)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.path[0]).toEqual(from)
      expect(r.path[r.path.length - 1]).toEqual(to)
    }
  })

  test('a stroke that starts in the middle of the gap is refused with a reason', () => {
    const mid: Pt = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
    expect(judge([mid, [mid[0] + 40, mid[1]], to], from, to)).toEqual({ ok: false, reason: 'start' })
  })

  test('a stroke that stops short of the far side is refused with a reason', () => {
    expect(judge([from, [from[0] + 60, from[1] - 10], [from[0] + 120, from[1] - 20]], from, to)).toEqual({ ok: false, reason: 'end' })
  })

  test('a tap is not a stroke', () => {
    expect(judge([from], from, to)).toEqual({ ok: false, reason: 'short' })
  })
})

describe('the 404 page', () => {
  test('home is the repo folder on GitHub Pages and the root elsewhere', () => {
    expect(homeHref({ hostname: 'someone.github.io', pathname: '/huh-to-oh/no/such/page' })).toBe('/huh-to-oh/')
    expect(homeHref({ hostname: 'localhost', pathname: '/no/such/page' })).toBe('/')
  })

  test('says where you are, offers the way home, and lays the track for you on request', async () => {
    const user = userEvent.setup()
    render(<NotFound />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("This page isn't on the line.")
    expect(screen.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/')
    await user.click(screen.getByRole('button', { name: 'Lay the track for me' }))
    expect(await screen.findByRole('heading', { name: 'There it goes.' }, { timeout: 8000 })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Take the train home' }, { timeout: 8000 })).toBeInTheDocument()
  }, 15000)

  test('every quote has a person and a source', () => {
    for (const q of QUOTES) {
      expect(q.who).toBeTruthy()
      expect(q.where).toBeTruthy()
    }
  })
})

describe('when the page breaks', () => {
  test('shows what happened instead of a blank screen, and logs it', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Boom = () => {
      throw new Error('signal failure at station 8')
    }
    render(
      <Derailed>
        <Boom />
      </Derailed>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('The train came off the rails.')
    expect(screen.getByText('signal failure at station 8')).toBeInTheDocument()
    expect(spy).toHaveBeenCalledWith('[huh-to-oh] render failed', expect.objectContaining({ message: 'signal failure at station 8' }))
    spy.mockRestore()
    act(() => {})
  })
})
