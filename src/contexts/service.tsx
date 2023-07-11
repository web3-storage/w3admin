'use client'

import { useEffect, useState, useContext, createContext } from "react"
import { ServiceMethod, DID, DIDKey, InferInvokedCapability } from '@ucanto/interface'
import * as Server from '@ucanto/server'
import * as Signer from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as Ucanto from '@ucanto/interface'
import { Subscription } from '@/capabilities/subscription'
import { Customer } from '@/capabilities/customer'
import { domainFromMailtoDid } from '@/util/did'
import { spaceOneDid, spaceTwoDid } from '@/util/spaces'
import { createAgent } from "./agent"
import { Agent } from "@web3-storage/access"
import { RateLimit } from "@/capabilities/rate-limit"
import { Consumer } from "@/capabilities/consumer"

export type AccountDID = DID<'mailto'>

export interface CustomerNotFound extends Ucanto.Failure {}

export type CustomerGetError = CustomerNotFound

export type Customer = {
  did: AccountDID
  subscriptions: string[]
  blocked: boolean
  domainBlocked: boolean
}

export interface CustomerGetOk {
  customer: null | Customer
}

export interface RateLimitAddError extends Ucanto.Failure {}

export interface RateLimitAddOk {
}

export interface RateLimitRemoveError extends Ucanto.Failure {}

export interface RateLimitRemoveOk {
}

export interface ConsumerGetRecord {
  did: Ucanto.DIDKey
  allocated: number
  total: number
  subscription: DID<'mailto'>
  blocked: boolean
}

export interface ConsumerNotFound extends Ucanto.Failure {}

export type ConsumerGetOk = ConsumerGetRecord

export type ConsumerGetError = ConsumerNotFound

export interface SubscriptionNotFound extends Ucanto.Failure {}
export interface SubscriptionGetOk {
  customer: DID<'mailto'>
  consumer: DIDKey
}

export type SubscriptionGetError = SubscriptionNotFound

export interface Service {
  consumer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Consumer.get>,
      ConsumerGetOk,
      ConsumerGetError
    >
  },
  customer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Customer.get>,
      CustomerGetOk,
      CustomerGetError
    >
  },
  subscription: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Subscription.get>,
      SubscriptionGetOk,
      SubscriptionGetError
    >
  },
  'rate-limit': {
    add: ServiceMethod<
      InferInvokedCapability<typeof RateLimit.add>,
      RateLimitAddOk,
      RateLimitAddError
    >,
    remove: ServiceMethod<
    InferInvokedCapability<typeof RateLimit.remove>,
    RateLimitRemoveOk,
    RateLimitRemoveError
  >
  }
}

type CustomerRow = Pick<Customer, 'did' | 'subscriptions'>

const customers: Record<string, CustomerRow> = {
  'did:mailto:example.com:travis': {
    did: 'did:mailto:example.com:travis',
    subscriptions: ['did:mailto:example.com:travis@test'],
  },
  'did:mailto:dag.house:travis': {
    did: 'did:mailto:dag.house:travis',
    subscriptions: ['did:mailto:dag.house:travis@test'],
  },
}

interface SpaceRow {
  allocated: number
  total: number
  subscription: DID<'mailto'>
}

const spaces: Record<string, SpaceRow> = {
  [spaceOneDid]: {
    allocated: 345093845,
    total: 1000000000,
    subscription: 'did:mailto:example.com:travis@test',
  },

  [spaceTwoDid]: {
    allocated: 9386794576,
    total: 1500000000,
    subscription: 'did:mailto:dag.house:travis@test',
  }
}

interface SubscriptionRow {
  customer: DID<'mailto'>
  consumer: DIDKey
}

const subscriptions: Record<string, SubscriptionRow> = {
  'did:mailto:example.com:travis@test': {
    customer: 'did:mailto:example.com:travis',
    consumer: spaceOneDid
  },
  'did:mailto:dag.house:travis@test': {
    customer: 'did:mailto:dag.house:travis',
    consumer: spaceTwoDid
  }
}

const limits: Record<string, number | undefined> = {}

export async function createServer (id: Ucanto.Signer) {
  return Server.create<Service>({
    id,
    service: {
      customer: {
        get: Server.provide(Customer.get, async ({ capability }) => {
          const did = capability.nb.customer
          const blocked = (limits[did] === 0)
          const domainBlocked = (limits[domainFromMailtoDid(did)] === 0)
          if (customers[did]) {
            return {
              ok: {
                customer: {
                  ...customers[did],
                  blocked,
                  domainBlocked
                }
              }
            }
          } else {
            return {
              error: {
                name: 'CustomerNotFound',
                message: `could not find ${did}`
              }
            }
          }
        })
      },
      'rate-limit': {
        add: Server.provide(RateLimit.add, async ({ capability }) => {
          limits[capability.nb.subject] = capability.nb.rate
          return { ok: {} }
        }),
        remove: Server.provide(RateLimit.remove, async ({ capability }) => {
          limits[capability.nb.subject] = undefined
          return { ok: {} }
        })
      },
      consumer: {
        get: Server.provide(Consumer.get, async ({ capability }) => {
          const consumerDid = capability.nb.consumer
          const space = spaces[consumerDid]
          const blocked = (limits[consumerDid] === 0)
          if (space) {
            return {
              ok: {
                did: capability.nb.consumer as Ucanto.DIDKey,
                blocked,
                ...space
              }
            }
          } else {
            return {
              error: {
                name: 'ConsumerNotFound',
                message: `could not find consumer with did ${capability.nb.consumer}`
              }
            }
          }
        })
      },
      subscription: {
        get: Server.provide(Subscription.get, async ({ capability }) => {
          if (subscriptions[capability.nb.subscription]) {
            return {
              ok: subscriptions[capability.nb.subscription]
            }
          } else {
            return {
              error: {
                name: 'SubscriptionNotFound',
                message: `could not find subscription with id ${capability.nb.subscription}`
              }
            }
          }
        })
      }
    },
    codec: CAR.inbound
  })
}

interface ServiceContextValue {
  agent?: Agent
  serverPrincipal?: Ucanto.Signer
  server?: Ucanto.ServerView<Service>
}

export const ServiceContext = createContext<ServiceContextValue>({})

export function ServiceProvider ({ children }: { children: JSX.Element | JSX.Element[] }) {
  const [serverPrincipal, setServerPrincipal] = useState<Ucanto.Signer>()
  const [server, setServer] = useState<Ucanto.ServerView<Service>>()
  const [agent, setAgent] = useState<Agent>()
  useEffect(function () {
    async function load () {
      const signer = await Signer.generate()
      setAgent(await createAgent({ principal: signer, name: 'did:web:test.web3.storage' }))
      const id = signer.withDID('did:web:test.web3.storage')
      setServerPrincipal(id)
      setServer(await createServer(id))
    }
    load()
  }, [])
  return (
    <ServiceContext.Provider value={{ agent, serverPrincipal, server }}>
      {children}
    </ServiceContext.Provider>
  )
}

export function useServer () {
  const { server } = useContext(ServiceContext)
  return server
}