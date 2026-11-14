import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { Derailed } from '../components/Derailed'
import { NotFound } from './NotFound'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Derailed>
      <NotFound />
    </Derailed>
  </StrictMode>,
)
