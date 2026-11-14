import { Component, type ErrorInfo, type ReactNode } from 'react'
import { QUOTES } from '../notfound/quotes'
import { buttonVariants } from './ui/button'

type State = { error: Error | null }

/**
 * The page's last line of defence: if something throws while rendering, show what happened in plain words
 * instead of a blank screen, keep the error text for whoever reports it, and log it for whoever debugs it.
 */
export class Derailed extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[huh-to-oh] render failed', { message: error.message, componentStack: info.componentStack })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const quote = QUOTES[3] // Dijkstra, on testing: fitting, if a little smug
    return (
      <main role="alert" className="mx-auto flex min-h-dvh max-w-[640px] flex-col justify-center gap-5 bg-bg px-6 py-16 font-display text-ink">
        <p className="m-0 font-hand text-[44px] font-bold leading-none text-now">Huh?</p>
        <h1 className="m-0 text-[clamp(28px,4vw,44px)] font-bold leading-[1.05]">The train came off the rails.</h1>
        <p className="m-0 font-reading text-lg text-ink2">
          Something on this page broke while it was being drawn. Reloading usually puts it back on the track. If it keeps happening, the details below help whoever fixes it.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => window.location.reload()} className={buttonVariants({ variant: 'solid' })}>
            Reload the page
          </button>
        </div>
        <details className="rounded-card border-[1.5px] border-ink bg-sheet px-4 py-3">
          <summary className="cursor-pointer font-bold">What went wrong</summary>
          <pre className="m-0 mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[13px] text-ink2">{error.message}</pre>
        </details>
        <figure className="m-0 flex flex-col gap-1 text-ink2">
          <blockquote className="m-0 font-reading text-[17px]">“{quote.text}”</blockquote>
          <figcaption className="font-mono text-[12.5px]">
            {quote.who}, {quote.where}
          </figcaption>
        </figure>
      </main>
    )
  }
}
