import useSWR, { useSWRConfig } from 'swr'
import { DID, Signer } from '@ucanto/interface'
import { Customer } from '@/capabilities/customer'
import { useClient } from './service'
import { domainFromMailtoDid } from '../util/did'
import { RateLimit } from '@/capabilities/rate-limit'

export function useCustomerActions (did: DID<'mailto'> | undefined) {
  const client = useClient()
  const { mutate } = useSWRConfig()

  async function setBlocked (subject: string, blocked: boolean) {
    if (did && client) {
      const result = blocked ? (
        await RateLimit.add.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            subject,
            rate: 0
          }
        }).execute(client)
      ) : (
        await RateLimit.remove.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            subject
          }
        }).execute(client)
      )
      if (result.out.ok) {
        mutate(['customer/get', did])
      } else {
        console.error('Block failed:', result.out.error)
      }
    }
  }

  const setEmailBlocked = (blocked: boolean) =>
    did && setBlocked(did, blocked)
  const setDomainBlocked = (blocked: boolean) =>
    did && setBlocked(domainFromMailtoDid(did), blocked)

  return { setEmailBlocked, setDomainBlocked }
}

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