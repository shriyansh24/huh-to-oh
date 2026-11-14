import { createColorScheme, createLocalStorage } from '@ui-sdk/core'

export const COLOR_SCHEME_KEY = 'huhoh-color-scheme'

export const colorScheme = createColorScheme({
  storage: createLocalStorage(COLOR_SCHEME_KEY),
  global: true,
})
