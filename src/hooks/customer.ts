import useSWR from 'swr'
import { DID } from '@ucanto/interface'
import { Customer } from '@web3-storage/capabilities'
import { useAgent } from './agent'
import { useServicePrincipal } from './service'

export function useCustomer (did: string | undefined) {
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  return useSWR(
    (did && agent && servicePrincipal) ? ['customer/get', did] : null,
    async ([, did]: [never, string | undefined]) => {
      if (did && agent && servicePrincipal) {
        const result = await agent?.invokeAndExecute(Customer.get, {
          with: servicePrincipal.did() as DID<'web'>,
          nb: {
            customer: did as DID<'mailto'>
          }
        })
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Customer.get failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}