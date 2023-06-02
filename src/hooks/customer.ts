import useSWR, { useSWRConfig } from 'swr'
import { DID, Signer } from '@ucanto/interface'
import { useAgent, useClient } from './service'
import { Customer as CapCustomer } from '@web3-storage/capabilities'
import * as LocalCustomer from '@/capabilities/customer'
const Customer = { ...LocalCustomer, ...CapCustomer }

export function useCustomerActions (did: string | undefined) {
  const client = useClient()
  const { mutate } = useSWRConfig()

  async function setEmailBlocked (blocked: boolean) {
    if (did && client) {
      const result = await Customer.block.invoke({
        issuer: client.id as Signer,
        audience: client.id,
        with: client.id.did() as DID<'web'>,
        nb: {
          customer: did as DID<'mailto'>,
          blocked
        }
      }).execute(client)
      if (result.out.ok) {
        mutate(['customer/get', did])
      } else {
        console.error('Customer.block failed:', result.out.error)
      }
    }
  }

  return { setEmailBlocked }
}

export function useCustomerInfo (did: string | undefined) {
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