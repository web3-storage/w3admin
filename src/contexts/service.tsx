'use client'

import { useEffect, useState, createContext } from "react"
import * as DID from '@ipld/dag-ucan/did'
import { ServiceMethod, DIDKey, InferInvokedCapability } from '@ucanto/interface'
import * as Server from '@ucanto/server'
import { CAR, HTTP } from '@ucanto/transport'
import * as Ucanto from '@ucanto/interface'
import * as Signer from '@ucanto/principal/ed25519'
import * as Client from '@ucanto/client'
import { Customer, Consumer, Subscription, RateLimit } from '@web3-storage/capabilities'
import { webDidFromMailtoDid } from '@/util/did'
import { spaceOneDid, spaceTwoDid } from '@/util/spaces'
import {
  CustomerGetSuccess,
  CustomerGetFailure,
  ConsumerGetSuccess,
  ConsumerGetFailure,
  SubscriptionGetSuccess,
  SubscriptionGetFailure,
  RateLimitAddSuccess,
  RateLimitAddFailure,
  RateLimitRemoveSuccess,
  RateLimitRemoveFailure,
  RateLimitListSuccess,
  RateLimitListFailure,
  RateLimitSubject
} from "@web3-storage/capabilities/types"
import { Absentee } from "@ucanto/principal"

export type AccountDID = Ucanto.DID<'mailto'>

export type Customer = {
  did: AccountDID
  subscriptions: string[]
  blocked: boolean
  domainBlocked: boolean
}

export interface Service {
  customer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Customer.get>,
      CustomerGetSuccess & { subscriptions: string[] },
      CustomerGetFailure
    >
  },
  consumer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Consumer.get>,
      ConsumerGetSuccess,
      ConsumerGetFailure
    >
  },
  subscription: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Subscription.get>,
      SubscriptionGetSuccess,
      SubscriptionGetFailure
    >
  },
  'rate-limit': {
    add: ServiceMethod<
      InferInvokedCapability<typeof RateLimit.add>,
      RateLimitAddSuccess,
      RateLimitAddFailure
    >,
    remove: ServiceMethod<
      InferInvokedCapability<typeof RateLimit.remove>,
      RateLimitRemoveSuccess,
      RateLimitRemoveFailure
    >,
    list: ServiceMethod<
      InferInvokedCapability<typeof RateLimit.list>,
      RateLimitListSuccess,
      RateLimitListFailure
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
  subscription: Ucanto.DID<'mailto'>
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
  customer: Ucanto.DID<'mailto'>
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

interface RateLimitRow {
  subject: string
  rate: number
}

const rateLimits: RateLimitRow[] = []

export async function createLocalServer (id: Ucanto.Signer) {
  return Server.create<Service>({
    id,
    service: {
      customer: {
        get: Server.provide(Customer.get, async ({ capability }) => {
          const did = capability.nb.customer
          const domainBlocked = domains[webDidFromMailtoDid(did)]?.blocked
          if (customers[did]) {
            return {
              ok: {
                ...customers[did]
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
        }),
      },
      consumer: {
        get: Server.provide(Consumer.get, async ({ capability }) => {
          const did = capability.nb.consumer
          if (spaces[did]) {
            return {
              ok: {
                did, ...spaces[did]
              }
            }
          } else {
            return {
              error: {
                name: 'ConsumerNotFound',
                message: `could not find ${did}`
              }
            }
          }
        }),
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
      },
      'rate-limit': {
        add: Server.provide(RateLimit.add, async ({ capability }) => {
          console.log(rateLimits)
          rateLimits.push(capability.nb)
          console.log(rateLimits)
          return { ok: { id: (rateLimits.length - 1).toString() } }
        }),
        remove: Server.provide(RateLimit.remove, async ({ capability }) => {
          delete rateLimits[parseInt(capability.nb.id)]
          return { ok: {} }
        }),
        list: Server.provide(RateLimit.list, async ({ capability }) => {
          return {
            ok: {
              limits: rateLimits.map(({ rate, subject }, i) => {
                if (subject === capability.nb.subject) {
                  return ({ rate, id: i.toString() })
                } else {
                  return null
                }
              }).filter(x => x) as RateLimitSubject[]
            }
          }
        }),
      }
    },
    codec: CAR.inbound
  })
}

async function createLocalService () {
  const signer = await Signer.generate()
  const servicePrincipal = signer.withDID('did:web:test.web3.storage')
  return {
    server: await createLocalServer(servicePrincipal),
    servicePrincipal
  }
}

interface RemoteServiceConfig {
  name: string
  local?: false
  url: Ucanto.URI
  did: Ucanto.DID
}

interface LocalServiceConfig {
  name: string
  local: true
}

type ServiceConfig = RemoteServiceConfig | LocalServiceConfig

type ServiceConfigs = Record<string, ServiceConfig>

const staticServiceConfigs: ServiceConfigs = {
  local: { name: "Local", local: true },
  travis: { name: "Travis", url: 'https://9bovsbxdii.execute-api.us-west-2.amazonaws.com', did: 'did:web:travis.web3.storage' }
}

interface ServiceContextValue {
  servicePrincipal?: Ucanto.Principal
  server?: Server.Channel<Service>
  serviceConfigs: ServiceConfigs
  selectedService?: ServiceConfig
  selectedServiceKey?: string
  setSelectedServiceKey: (key: string) => void
}

export const ServiceContext = createContext<ServiceContextValue>({
  serviceConfigs: staticServiceConfigs,
  setSelectedServiceKey: () => { console.error('setSelectedService is not implemented') }
})

export function ServiceProvider ({ children }: { children: JSX.Element | JSX.Element[] }) {
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfigs>(staticServiceConfigs)
  const [selectedServiceKey, setSelectedServiceKey] = useState<string>('local')
  const [servicePrincipal, setServicePrincipal] = useState<Ucanto.Principal>()
  const [server, setServer] = useState<Server.Channel<Service>>()
  useEffect(function () {
    async function load () {
      const selectedServiceConfig = serviceConfigs[selectedServiceKey]
      if (selectedServiceConfig.local) {
        const { server, servicePrincipal } = await createLocalService()
        setServicePrincipal(servicePrincipal)
        setServer(server)
      } else {
        setServicePrincipal(Absentee.from({ id: selectedServiceConfig.did }))
        setServer(HTTP.open({
          url: new URL(selectedServiceConfig.url),
          method: 'POST',
        }))
      }
    }
    load()
  }, [])
  return (
    <ServiceContext.Provider value={{
      servicePrincipal,
      server,
      serviceConfigs,
      selectedServiceKey,
      selectedService: serviceConfigs[selectedServiceKey],
      setSelectedServiceKey
    }}>
      {children}
    </ServiceContext.Provider>
  )
}
