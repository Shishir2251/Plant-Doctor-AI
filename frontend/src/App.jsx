import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'

export default function App() {
  return (
    <>
      <Home />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#052e16',
            color: '#bbf7d0',
            border: '1px solid rgba(34,197,94,0.2)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#052e16',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#052e16',
            },
            style: {
              borderColor: 'rgba(248,113,113,0.2)',
            },
          },
        }}
      />
    </>
  )
}