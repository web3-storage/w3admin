import useSWR from 'swr'
import { Customer } from '@web3-storage/capabilities'
import { DID, Signer } from '@ucanto/interface'
import { useAgent, useClient } from './service'

export function useCustomerInfo (did: string | undefined) {
  const client = useClient()
  return useSWR(client ? ['/customer', did] : null, async ([, did]: [never, string | undefined]) => {
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
        return result.out.ok.customer
      } else {
        console.error('Customer.get failed:', result.out.error)
        return null
      }
    } else {
      return null
    }
  })
}