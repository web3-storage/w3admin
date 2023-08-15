import useSWR from 'swr'
import { DID, Signer } from '@ucanto/interface'
import { Consumer } from '@web3-storage/capabilities'
import { useClient } from './service'

export function useConsumer (did: string | undefined) {
  const client = useClient()
  return useSWR(
    (did && client) ? ['consumer/get', did] : null,
    async ([, did]: [never, string | undefined]) => {
      if (did && client) {
        const result = await Consumer.get.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            consumer: did as DID<'key'>
          }
        }).execute(client)
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