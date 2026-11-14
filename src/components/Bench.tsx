import { Field, FieldDescription, FieldLabel } from '@ui-sdk/react/field'
import { Input } from '@ui-sdk/react/input'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { RUSTC, WARMUP, checkGuess, program } from '../lib/warmup'
import { Button } from './ui/button'

type Result = { guess: string; correct: boolean } | null

export function Bench() {
  const [step, setStep] = useState(0)
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState<Result>(null)
  const current = WARMUP[step]

  const run = (e: FormEvent) => {
    e.preventDefault()
    if (!guess.trim()) return
    setResult({ guess: guess.trim(), correct: checkGuess(guess, current.output) })
  }
  const next = () => {
    setStep((s) => s + 1)
    setGuess('')
    setResult(null)
  }
  const restart = () => {
    setStep(0)
    setGuess('')
    setResult(null)
  }

  return (
    <section aria-labelledby="try-h" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-8 py-16">
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
        <h2 id="try-h" className="m-0 font-display text-[34px] font-bold leading-[1.1]">
          Guess first. Then run it.
        </h2>
        <p className="m-0 max-w-[44ch] font-reading text-lg text-ink2">
          Every lesson works like this: predict what happens, run it for real, then change one thing and predict again. Here is the first one.
        </p>
      </div>
      <div
        className="relative min-w-0 flex-[999_1_520px] rounded-card border-[1.5px] border-ink bg-sheet px-7 pb-6 pt-[26px]"
        style={{
          transform: 'rotate(0.5deg)',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, var(--rule) 31px, var(--rule) 32px)',
        }}
      >
        <span aria-hidden="true" className="absolute -top-3 right-[18%] h-[22px] w-[90px] -rotate-[4deg]" style={{ background: 'var(--tape)' }} />
        <p className="m-0 mb-2 font-hand text-lg font-bold text-ink2">Rust · warm-up 1{step > 0 ? ' · change one thing' : ''}</p>
        <pre className="m-0 overflow-x-auto font-mono text-base leading-8 text-ink" aria-label="Rust program">
          {program(current.afternoon)}
        </pre>
        <form onSubmit={run} className="mt-3.5 flex flex-wrap items-end gap-2.5">
          <Field className="flex min-w-0 flex-[1_1_200px] flex-col gap-1.5">
            <FieldLabel className="font-bold">{current.prompt}</FieldLabel>
            <Input
              value={guess}
              onValueChange={(v) => {
                setGuess(v)
                if (result) setResult(null)
              }}
              autoComplete="off"
              className="h-[46px] rounded-button border-[1.5px] border-ink bg-bg px-3.5 font-mono text-base text-ink"
            />
            <FieldDescription className="sr-only">Type exactly what the program prints, then press Run it.</FieldDescription>
          </Field>
          <Button type="submit" disabled={!guess.trim()}>
            Run it
          </Button>
        </form>
        <div aria-live="polite" className="min-h-0">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={`${step}-${result.guess}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex flex-col gap-2"
              >
                <p className="m-0 font-mono text-[13px] text-ink2">Output ({RUSTC})</p>
                <pre className="m-0 rounded-button bg-bg px-3.5 py-2 font-mono text-base text-ink">{current.output}</pre>
                <p className={result.correct ? 'm-0 font-bold text-success' : 'm-0 font-bold text-danger'}>
                  {result.correct
                    ? `You guessed ${result.guess}. That is what it printed.`
                    : `You guessed ${result.guess}. It printed ${current.output}. Look at what total adds up, then try the next one.`}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {step + 1 < WARMUP.length ? (
                    <Button variant="outline" onClick={next}>
                      Change one thing
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={restart}>
                      Start the warm-up again
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
