import { useState, useEffect } from 'react'
import { ServiceMethod, DID, DIDKey, InferInvokedCapability } from '@ucanto/interface'
import * as Server from '@ucanto/server'
import * as Client from '@ucanto/client'
import * as Signer from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as Ucanto from '@ucanto/interface'
import { Customer as CapCustomer } from '@web3-storage/capabilities'
import * as LocalCustomer from '@/capabilities/customer'
import Space from '@/capabilities/space'
import Subscription from '@/capabilities/subscription'
import { webDidFromMailtoDid } from '@/util/did'
import { spaceOneDid, spaceTwoDid } from '@/util/spaces'

const Customer = { ...LocalCustomer, ...CapCustomer }

export type AccountDID = DID<'mailto'>

export type CustomerGetError = never

export type Customer = {
  did: AccountDID
  subscriptions: string[]
  blocked: boolean
  domainBlocked: boolean
}

export interface CustomerGetOk {
  customer: null | Customer
}

export interface UnknownDidType extends Ucanto.Failure {}

export type CustomerBlockError = UnknownDidType

export interface CustomerBlockOk {
}

export interface SpaceInfoRecord {
  did: Ucanto.DIDKey
  allocated: number
  total: number
  subscription: DID<'mailto'>
  blocked: boolean
}

export interface SpaceNotFound extends Ucanto.Failure {}

export type SpaceInfoOk = SpaceInfoRecord
export type SpaceInfoError = SpaceNotFound

export type SpaceBlockOk = {}
export type SpaceBlockError = Ucanto.Failure

export interface SubscriptionNotFound extends Ucanto.Failure {}
export interface SubscriptionGetOk {
  customer: DID<'mailto'>
  consumer: DIDKey
}

export type SubscriptionGetError = SubscriptionNotFound

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
  },
  space: {
    info: ServiceMethod<
      InferInvokedCapability<typeof Space.info>,
      SpaceInfoOk,
      SpaceInfoError
    >,
    block: ServiceMethod<
      InferInvokedCapability<typeof Space.block>,
      SpaceBlockOk,
      SpaceBlockError
    >
  },
  subscription: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Subscription.get>,
      SubscriptionGetOk,
      SubscriptionGetError
    >
  }
}

type CustomerRow = Pick<Customer, 'did' | 'subscriptions' | 'blocked'>

const customers: Record<string, CustomerRow> = {
  'did:mailto:example.com:travis': {
    did: 'did:mailto:example.com:travis',
    subscriptions: ['did:mailto:example.com:travis@test'],
    blocked: false,
  },
  'did:mailto:dag.house:travis': {
    did: 'did:mailto:dag.house:travis',
    subscriptions: ['did:mailto:dag.house:travis@test'],
    blocked: false,
  },
}

interface DomainRow {
  blocked: boolean
}

const domains: Record<string, DomainRow> = {
}

interface SpaceRow {
  allocated: number
  total: number
  subscription: DID<'mailto'>
  blocked: boolean
}

const spaces: Record<string, SpaceRow> = {
  [spaceOneDid]: {
    allocated: 345093845,
    total: 1000000000,
    subscription: 'did:mailto:example.com:travis@test',
    blocked: false
  },

  [spaceTwoDid]: {
    allocated: 9386794576,
    total: 1500000000,
    subscription: 'did:mailto:dag.house:travis@test',
    blocked: false
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

export async function createServer (id: Ucanto.Signer) {
  return Server.create<Service>({
    id,
    service: {
      customer: {
        get: Server.provide(Customer.get, async ({ capability }) => {
          const did = capability.nb.customer
          const domainBlocked = domains[webDidFromMailtoDid(did)]?.blocked
          return {
            ok: {
              customer: { ...customers[did], domainBlocked }
            }
          }
        }),
        block: Server.provide(Customer.block, async ({ capability }) => {
          const did = capability.nb.customer
          if (did.startsWith('did:mailto')) {
            customers[did].blocked = capability.nb.blocked
            return { ok: {} }
          } else if (did.startsWith('did:web')) {
            domains[did] ||= { blocked: false }
            domains[did].blocked = capability.nb.blocked
            return { ok: {} }
          } else {
            return {
              error: {
                name: 'UnknownDidType',
                message: `cannot block ${did}`
              }
            }
          }
        })
      },
      space: {
        info: Server.provide(Space.info, async ({ capability }) => {
          const space = spaces[capability.with]
          if (space) {
            return { ok: { did: capability.with, ...spaces[capability.with] } }
          } else {
            return {
              error: {
                name: 'SpaceNotFound',
                message: `could not find space with did ${capability.with}`
              }
            }
          }
        }),
        block: Server.provide(Space.block, async ({ capability }) => {
          if (spaces[capability.nb.space]) {
            spaces[capability.nb.space].blocked = capability.nb.blocked
            return { ok: {} }
          } else {
            return {
              error: {
                name: 'SpaceNotFound',
                message: `could not find space with did ${capability.with}`
              }
            }
          }
        })
      },
      subscription: {
        get: Server.provide(Subscription.get, async ({ capability }) => {
          if (subscriptions[capability.nb.subscription]){
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