'use client'

import './globals.css'
import { AgentProvider } from '@/contexts/agent'
import { ServiceProvider } from '@/contexts/service'
import Nav from '@/components/nav'

export default function RootLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ServiceProvider>
      <AgentProvider>
        <html>
          <body className='min-h-screen bg-slate-800 text-white'>
            <Nav />
            <main className='grow text-white p-4'>
              {children}
            </main>
          </body>
        </html>
      </AgentProvider>
    </ServiceProvider>
  )
}
