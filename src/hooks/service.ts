import { useState, useEffect, useContext } from 'react'
import * as Server from '@ucanto/server'
import * as Client from '@ucanto/client'
import * as Signer from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as Ucanto from '@ucanto/interface'
import { Service, ServiceContext, useServer } from '@/contexts/service'


export async function createClient (id: Ucanto.Signer, server: Server.ServerView<Service>) {
  return Client.connect({
    id,
    codec: CAR.outbound,
    channel: server,
  })
}

export function useClient () {
  const { server, serverPrincipal } = useContext(ServiceContext)
  const [client, setClient] = useState<Server.ConnectionView<Service>>()
  useEffect(() => {
    async function load () {
      if (server && serverPrincipal) {
        setClient(await createClient(serverPrincipal, server))
      }
    }
    load()
  }, [server, serverPrincipal])
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