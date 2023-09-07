import useSWR from 'swr'
import { useServicePrincipal } from './service'
import { useAgent } from './agent'
import { Subscription } from '@/capabilities/subscription'
import { DID } from '@ucanto/interface'

export function useSubscription (id: string | undefined) {
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  return useSWR((id && agent && servicePrincipal) ? ['subscription/get', id] : null,
    async ([, id]: [never, string | undefined]) => {
      if (id && agent && servicePrincipal) {
        const result = await agent.invokeAndExecute(Subscription.get, {
          audience: servicePrincipal,
          with: servicePrincipal.did() as DID<'web'>,
          nb: {
            subscription: id
          }
        })
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Subscription.get failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}
