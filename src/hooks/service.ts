import { useState, useEffect, useContext } from 'react'
import * as Server from '@ucanto/server'
import * as Client from '@ucanto/client'
import * as Signer from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as Ucanto from '@ucanto/interface'
import { Service, ServiceContext } from '@/contexts/service'

export function useServer () {
  const { server } = useContext(ServiceContext)
  return server
}

export function useServicePrincipal () {
  const { servicePrincipal } = useContext(ServiceContext)
  return servicePrincipal
}

export async function createClient (id: Ucanto.Principal, server: Server.Channel<Service>) {
  return Client.connect({
    id,
    codec: CAR.outbound,
    channel: server,
  })
}

export function useClient () {
  const { server, servicePrincipal } = useContext(ServiceContext)
  const [client, setClient] = useState<Server.ConnectionView<Service>>()
  useEffect(() => {
    async function load () {
      if (server && servicePrincipal) {
        setClient(await createClient(servicePrincipal, server))
      }
    }
    load()
  }, [server, servicePrincipal])
  return client
}
