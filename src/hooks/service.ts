import { useState, useEffect } from 'react'
import { ServiceMethod, DID, InferInvokedCapability } from '@ucanto/interface'
import * as Server from '@ucanto/server'
import * as Client from '@ucanto/client'
import * as Signer from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as Ucanto from '@ucanto/interface'
import { Customer as CapCustomer } from '@web3-storage/capabilities'
import * as LocalCustomer from '@/capabilities/customer'
const Customer = { ...LocalCustomer, ...CapCustomer }

export type AccountDID = DID<'mailto'>

export type CustomerGetError = never

export type Customer = {
  did: AccountDID
  subscriptions: string[]
  blocked: boolean
}

export interface CustomerGetOk {
  customer: null | Customer
}

export type CustomerBlockError = never

export interface CustomerBlockOk {
}

interface Service {
  customer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Customer.get>,
      CustomerGetOk,
      CustomerGetError
    >,
    block: ServiceMethod<
      InferInvokedCapability<typeof Customer.block>,
      CustomerBlockOk,
      CustomerBlockError
    >
  }
}

const customers: Record<string, Customer> = {
  'did:mailto:example.com:travis': {
    did: 'did:mailto:example.com:travis',
    subscriptions: ['did:mailto:example.com:travis'],
    blocked: false
  }
}

export async function createServer (id: Ucanto.Signer) {
  return Server.create<Service>({
    id,
    service: {
      customer: {
        get: Server.provide(Customer.get, async ({ capability }) => {
          const did = capability.nb.customer
          return {
            ok: {
              customer: customers[did]
            }
          }
        }),
        block: Server.provide(Customer.block, async ({ capability }) => {
          const did = capability.nb.customer
          customers[did].blocked = capability.nb.blocked
          return {
            ok: {
            }
          }
        })
      }
    },
    codec: CAR.inbound
  })
}

export async function createClient (id: Ucanto.Signer, server: Server.ServerView<Service>) {
  return Client.connect({
    id,
    codec: CAR.outbound,
    channel: server,
  })
}

export function useClient () {
  const [client, setClient] = useState<Server.ConnectionView<Service>>()
  useEffect(() => {
    async function load () {
      const id = (await Signer.generate()).withDID('did:web:test.web3.storage')
      setClient(await createClient(id, await createServer(id)))
    }
    load()
  }, [])
  return client
}

export function useAgent () {
  const [agent, setAgent] = useState<Ucanto.Signer>()
  useEffect(() => {
    async function load () {
      setAgent(await Signer.generate())
    }
    load()
  }, [])
  return agent
}