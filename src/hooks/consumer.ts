import useSWR from 'swr'
import { DID } from '@ucanto/interface'
import { Consumer } from '@web3-storage/capabilities'
import { useServicePrincipal } from './service'
import { useAgent } from './agent'

export function useConsumer (did: string | undefined) {
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  return useSWR(
    (did && agent && servicePrincipal) ? ['consumer/get', did] : null,
    async ([, did]: [never, string | undefined]) => {
      if (did && agent && servicePrincipal) {
        const result = await agent.invokeAndExecute(Consumer.get, {
          with: servicePrincipal.did() as DID<'web'>,
          nb: {
            consumer: did as DID<'key'>
          }
        })
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Customer.get failed:', result.out.error)
          return null
        }
      } else {
        return null
      }
    })
}