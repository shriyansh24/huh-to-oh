import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { Derailed } from './components/Derailed'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Derailed>
      <App />
    </Derailed>
  </StrictMode>,
)
