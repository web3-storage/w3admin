'use client'

import { useAgent } from "@/contexts/agent"

export default function Console () {
  const agent = useAgent()
  const name = agent?.did()
  const isAuthorized = agent && (agent.proofs().length > 0)
  return (
    <div className='flex flex-col items-center'>
      <div className='flex flex-col items-center'>
        <div className='flex flex-row gap-x-1'>
          Agent
          <span className='w-44 text-ellipsis overflow-hidden'>{name}</span>
        </div>
        {isAuthorized ? (
          <button className='btn'>Refresh Delegations</button>
        ) : (
          <button className='btn'>Authorize</button>
        )}
      </div>

      
    </div>
  )
}