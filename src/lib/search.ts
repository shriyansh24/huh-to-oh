import { createDialogController } from '@ui-sdk/react/dialog'

export const createSearchController = () => createDialogController<unknown, unknown>()
export type SearchController = ReturnType<typeof createSearchController>
