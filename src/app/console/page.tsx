'use client'

import { useContext, useState, useEffect, ChangeEvent } from 'react'
import { delegate } from '@ucanto/core'
import { useAgent } from "@/hooks/agent"
import { ServiceContext, } from "@/contexts/service"
import { Delegation, Capabilities } from '@ucanto/interface'
import * as Ucanto from '@ucanto/interface'
import * as Signer from '@ucanto/principal/ed25519'

export default function Console () {
  const agent = useAgent()
  const name = agent?.did()
  const [delegations, setDelegations] = useState<Delegation<Capabilities>[]>([])
  const [configuredServiceSigner, setConfiguredServiceSigner] = useState<Ucanto.Signer>()
  useEffect(function () {
    if (agent) {
      setDelegations(agent.proofs())
    }
  }, [agent])
  const { servicePrincipal } = useContext(ServiceContext)

  const serviceSigner = configuredServiceSigner || servicePrincipal as Ucanto.Signer | undefined
  const haveSigningKey = !!(serviceSigner?.signatureAlgorithm)
  const canAuthorize = agent && servicePrincipal && serviceSigner && haveSigningKey
  async function authorize () {
    if (canAuthorize) {
      const delegation = await delegate({
        issuer: serviceSigner as Ucanto.Signer,
        audience: agent.issuer,
        capabilities: [
          { with: servicePrincipal.did(), can: 'customer/get' },
          { with: servicePrincipal.did(), can: 'consumer/get' },
          { with: servicePrincipal.did(), can: 'subscription/get' },
          { with: servicePrincipal.did(), can: 'rate-limit/*' },
        ],
        expiration: Math.floor(Date.now() / 1000) + (60 * 30)
      })
      await agent.addProof(delegation)
      setDelegations(agent.proofs())
    }
  }
  function onServiceSignerPrivateKeyChange (e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value && servicePrincipal) {
      try {
        setConfiguredServiceSigner(Signer.parse(e.target.value).withDID(servicePrincipal.did()))
      } catch {
        // TODO: add error message to tell user this isn't a valid key
      }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      {
        agent && (
          <div className='flex flex-col items-center'>
            <div className='flex flex-row gap-x-1 mb-4'>
              Agent
              <span className='w-44 text-ellipsis overflow-hidden'>{name}</span>
            </div>
            <div className='flex flex-col space-y-1 items-center'>
              <input className='w-72 px-2 py-1 text-black focus:outline-0'
                type='password' placeholder='Service Signer Private Key'
                onChange={onServiceSignerPrivateKeyChange} />
              <div>Signer Public Key: {serviceSigner?.did()}</div>
              <button className='btn' onClick={authorize} disabled={!canAuthorize}>
                Authorize
              </button>
            </div>
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