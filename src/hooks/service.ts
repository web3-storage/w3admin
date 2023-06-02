import { useState, useEffect } from 'react'
import * as Server from '@ucanto/server'
import * as Client from '@ucanto/client'
import * as Signer from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as Ucanto from '@ucanto/interface'
import { Customer } from '@web3-storage/capabilities'
import { ServiceMethod, DID, InferInvokedCapability } from '@ucanto/interface'

export type AccountDID = DID<'mailto'>

export type CustomerGetError = never

export interface CustomerGetOk {
  customer: null | {
    did: AccountDID
  }
}

interface Service {
  customer: {
    get: ServiceMethod<
      InferInvokedCapability<typeof Customer.get>,
      CustomerGetOk,
      CustomerGetError
    >
  }
}

export async function createServer (id: Ucanto.Signer) {
  return Server.create<Service>({
    id,
    service: {
      customer: {
        get: Server.provide(Customer.get, async ({ capability }) => {
          return {
            ok: {
              customer: {
                did: capability.nb.customer,
                subscriptions: ['did:mailto:example.com:travis']
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