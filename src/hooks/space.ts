import useSWR, { useSWRConfig } from 'swr'
import Space from '@/capabilities/space'
import { DID, DIDKey, Signer } from '@ucanto/interface'
import { spaceOne, spaceTwo, spacesByPublicKey } from '@/util/spaces'
import { useClient } from './service'

export function useSpaceActions (did: DIDKey | undefined) {
  const client = useClient()
  const { mutate } = useSWRConfig()

  async function setBlocked (blocked: boolean) {
    if (did && client) {
      const result = await Space.block.invoke({
        issuer: client.id as Signer,
        audience: client.id,
        with: client.id.did() as DID<'web'>,
        nb: {
          space: did,
          blocked
        }
      }).execute(client)
      if (result.out.ok) {
        mutate(['space/info', did])
      } else {
        console.error('Space.block failed:', result.out.error)
        throw result.out.error
      }
    }
  }
  return { setBlocked }
}

export function useSpaceInfo (did: DIDKey | undefined) {
  const client = useClient()
  return useSWR((did && client) ? ['space/info', did] : null,
    async ([, did]: [never, DID<'key'> | undefined]) => {
      if (did && client && spacesByPublicKey[did]) {
        const result = await Space.info.invoke({
          issuer: spacesByPublicKey[did],
          audience: client.id,
          with: did,
        }).execute(client)
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Space.info failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}