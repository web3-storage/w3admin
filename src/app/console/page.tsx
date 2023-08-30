'use client'

import { useContext, useState, useEffect } from 'react'
import { delegate } from '@ucanto/core'
import { useAgent } from "@/hooks/agent"
import { ServiceContext, } from "@/contexts/service"
import { Delegation, Capabilities } from '@ucanto/interface'
import * as Ucanto from '@ucanto/interface'

export default function Console () {
  const agent = useAgent()
  const name = agent?.did()
  const [delegations, setDelegations] = useState<Delegation<Capabilities>[]>([])
  const isAuthorized = delegations.length > 0
  useEffect(function () {
    if (agent) {
      setDelegations(agent.proofs())
    }
  }, [agent])
  const { servicePrincipal: servicePrincipal } = useContext(ServiceContext)

  async function authorize () {
    if (agent && servicePrincipal) {
      const delegation = await delegate({
        issuer: servicePrincipal as Ucanto.Signer,
        audience: agent.issuer,
        capabilities: [{ with: servicePrincipal.did(), can: 'customer/get' }],
        expiration: Math.floor(Date.now() / 1000) + (60 * 30)
      })
      await agent.addProof(delegation)
      setDelegations(agent.proofs())
    }
  }

  return (
    <div className='flex flex-col items-center'>
      {
        agent && (
          <div className='flex flex-col items-center'>
            <div className='flex flex-row gap-x-1'>
              Agent
              <span className='w-44 text-ellipsis overflow-hidden'>{name}</span>
            </div>
            {isAuthorized ? (
              <button className='btn'>Refresh Delegations</button>
            ) : (
              <button className='btn' onClick={authorize}>Authorize</button>
            )}
            <h3>Delegations</h3>
            {delegations.map(delegation => (
              <div key={delegation.link().toString()}>
                <div>Issued by: {delegation.issuer.did()}</div>
                {delegation.capabilities.map((capability, i) => (
                  <div key={i} className='flex flex-col'>
                    <div>Can: {capability.can}</div>
                    <div>With: {capability.with}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}