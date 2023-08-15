import useSWR, { useSWRConfig } from 'swr'
import { DID, Signer } from '@ucanto/interface'
import { Customer } from '@web3-storage/capabilities'
import { useClient } from './service'

export function useCustomer (did: string | undefined) {
  const client = useClient()
  return useSWR(
    (did && client) ? ['customer/get', did] : null,
    async ([, did]: [never, string | undefined]) => {
      if (did && client) {
        const result = await Customer.get.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            customer: did as DID<'mailto'>
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