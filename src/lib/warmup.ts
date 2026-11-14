// Rust warm-up 1. Each step's output was recorded by compiling and running the program with rustc 1.97.0
// (2026-11-14); the page compares the learner's guess against that recorded output, it does not simulate Rust.
export type WarmupStep = { afternoon: number; output: string; prompt: string }

export const RUSTC = 'rustc 1.97.0'

export const WARMUP: WarmupStep[] = [
  { afternoon: 7, output: '12', prompt: 'What does it print?' },
  { afternoon: 8, output: '13', prompt: 'Change one thing: afternoon is now 8. What does it print?' },
]

export const program = (afternoon: number) =>
  `let morning = 5;\nlet afternoon = ${afternoon};\nlet total = morning + afternoon;\nprintln!("{total}");`

export function checkGuess(guess: string, output: string): boolean {
  return guess.trim() === output.trim()
}
