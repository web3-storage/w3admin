'use client'

import './globals.css'
import { AgentProvider } from '@/contexts/agent'
import { ServiceProvider } from '@/contexts/service'

export default function RootLayout ({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <AgentProvider>
      <ServiceProvider>
        <html>
          <body>
            <main className='grow bg-gray-dark text-white p-4'>
              {children}
            </main>
          </body>
        </html>
      </ServiceProvider>
    </AgentProvider>
  )
}
