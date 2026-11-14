// Short quotes from people who built the field. Each has its source so it can be checked;
// "attributed" marks the ones that are widely quoted but have no confirmed original.
export type Quote = { text: string; who: string; where: string; attributed?: boolean }

export const QUOTES: Quote[] = [
  { text: 'What I cannot create, I do not understand.', who: 'Richard Feynman', where: 'written on his blackboard at Caltech, 1988' },
  { text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.', who: 'Alan Turing', where: '"Computing Machinery and Intelligence", 1950' },
  { text: 'The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.', who: 'Ada Lovelace', where: 'Notes on the Analytical Engine, 1843' },
  { text: 'Program testing can be used to show the presence of bugs, but never to show their absence!', who: 'Edsger W. Dijkstra', where: 'Notes on Structured Programming (EWD249), 1970' },
  { text: 'Beware of bugs in the above code; I have only proved it correct, not tried it.', who: 'Donald Knuth', where: 'note to Peter van Emde Boas, 1977' },
  { text: 'Talk is cheap. Show me the code.', who: 'Linus Torvalds', where: 'Linux kernel mailing list, 2000' },
  { text: 'If I have seen further it is by standing on the shoulders of Giants.', who: 'Isaac Newton', where: 'letter to Robert Hooke, 1675' },
  { text: "You can't think about thinking without thinking about thinking about something.", who: 'Seymour Papert', where: 'Mindstorms, 1980' },
  { text: 'Nothing in life is to be feared, it is only to be understood.', who: 'Marie Curie', where: 'widely quoted', attributed: true },
  { text: "The most dangerous phrase in the language is, 'We've always done it this way.'", who: 'Grace Hopper', where: 'widely quoted', attributed: true },
]
