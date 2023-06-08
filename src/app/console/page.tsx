'use client'

import { useEffect, useState } from "react"


import type {
  ConnectionView,
  Principal,
} from '@ucanto/interface'
import type { Service } from '@web3-storage/access/types'
import { Agent } from '@web3-storage/access/agent'
import { StoreIndexedDB } from '@web3-storage/access/stores/store-indexeddb'
import * as RSASigner from '@ucanto/principal/rsa'

const DB_NAME = 'w3admin'
const DB_STORE_NAME = 'keyring'

interface ServiceConfig {
  servicePrincipal?: Principal
  connection?: ConnectionView<Service>
}

interface CreateAgentOptions extends ServiceConfig {}

/**
 * Create an agent for managing identity. It uses RSA keys that are stored in
 * IndexedDB as unextractable `CryptoKey`s.
 */
async function createAgent (
  options: CreateAgentOptions = {}
): Promise<Agent> {
  const dbName = `${DB_NAME}${options.servicePrincipal != null ? '@' + options.servicePrincipal.did() : ''
    }`
  const store = new StoreIndexedDB(dbName, {
    dbVersion: 1,
    dbStoreName: DB_STORE_NAME
  })
  const raw = await store.load()
  if (raw != null) {
    return Object.assign(Agent.from(raw, { ...options, store }), { store })
  }
  const principal = await RSASigner.generate()
  return Object.assign(
    await Agent.create({ principal }, { ...options, store }),
    { store }
  )
}

function useAgent () {
  const [agent, setAgent] = useState<Agent>()
  useEffect(function () {
    async function load () {
      setAgent(await createAgent())
    }
    load()
  }, [])
  return agent
}

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