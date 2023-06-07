import useSWR from 'swr'
import { useClient } from './service'
import { Subscription } from '@/capabilities/subscription'
import { Signer, DID } from '@ucanto/interface'

export function useSubscription (id: string | undefined) {
  const client = useClient()
  return useSWR((id && client) ? ['subscription/get', id] : null,
    async ([, id]: [never, string | undefined]) => {
      if (id && client) {
        const result = await Subscription.get.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            subscription: id
          }
        }).execute(client)
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Subscription.get failed:', result.out.error)
          return null
        }
      } else {
        return null
      }
    })
}
