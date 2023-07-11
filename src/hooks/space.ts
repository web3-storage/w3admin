import useSWR, { useSWRConfig } from 'swr'
import { DID, DIDKey, Signer } from '@ucanto/interface'
import { spacesByPublicKey } from '@/util/spaces'
import { useClient } from './service'
import { RateLimit } from '@/capabilities/rate-limit'
import { Consumer } from '@/capabilities/consumer'

export function useSpaceActions (did: DIDKey | undefined) {
  const client = useClient()
  const { mutate } = useSWRConfig()

  async function setBlocked (blocked: boolean) {
    if (did && client) {
      const result = blocked ? (
        await RateLimit.add.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            subject: did,
            rate: 0
          }
        }).execute(client)
      ) : (
        await RateLimit.remove.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            subject: did
          }
        }).execute(client)
      )
      if (result.out.ok) {
        mutate(['consumer/get', did])
      } else {
        console.error('Space.block failed:', result.out.error)
        throw result.out.error
      }
    }
  }
  return { setBlocked }
}

export function useConsumerGet (did: DIDKey | undefined) {
  const client = useClient()
  return useSWR((did && client) ? ['consumer/get', did] : null,
    async ([, did]: [never, DID<'key'> | undefined]) => {
      if (did && client && spacesByPublicKey[did]) {
        const result = await Consumer.get.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            consumer: did
          }
        }).execute(client)
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Consumer.get failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}