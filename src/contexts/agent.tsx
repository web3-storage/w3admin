'use client'

import { useEffect, useState, useContext, createContext } from "react"

import type {
  ConnectionView,
  Principal,
} from '@ucanto/interface'
import { Service } from './service'
import { Agent } from '@web3-storage/access/agent'
import { StoreIndexedDB } from '@web3-storage/access/stores/store-indexeddb'
import * as RSASigner from '@ucanto/principal/rsa'
import * as Ucanto from '@ucanto/interface'

const DB_STORE_NAME = 'keyring'

interface ServiceConfig {
  servicePrincipal?: Principal
  connection?: ConnectionView<Service>
}

interface CreateAgentOptions extends ServiceConfig {
  principal?: Ucanto.Signer<Ucanto.DIDKey>
  name?: string
}

/**
 * Create an agent for managing identity. It uses RSA keys that are stored in
 * IndexedDB as unextractable `CryptoKey`s.
 */
export async function createAgent (
  options: CreateAgentOptions = { name: 'w3admin' }
): Promise<Agent<Service>> {
  const dbName = `${options.name}${options.servicePrincipal != null ? '@' + options.servicePrincipal.did() : ''
    }`
  const store = new StoreIndexedDB(dbName, {
    dbVersion: 1,
    dbStoreName: DB_STORE_NAME
  })
  const raw = await store.load()
  if (raw != null) {
    return Object.assign(Agent.from<Service>(raw, { ...options, store }), { store })
  }
  const principal = options.principal ?? await RSASigner.generate()
  return Object.assign(
    await Agent.create<Service>({ principal }, { ...options, store }),
    { store }
  )
}

interface AgentContextValue {
  agent?: Agent<Service>
}

export const AgentContext = createContext<AgentContextValue>({})

export function AgentProvider ({ children }: { children: JSX.Element | JSX.Element[] }) {
  const [agent, setAgent] = useState<Agent<Service>>()
  useEffect(function () {
    async function load () {
      setAgent(await createAgent())
    }
    load()
  }, [])
  return (
    <AgentContext.Provider value={{ agent }}>
      {children}
    </AgentContext.Provider>
  )
}
