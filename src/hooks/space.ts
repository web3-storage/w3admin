import useSWR from 'swr'
import { Space } from '@web3-storage/capabilities'
import { useClient } from './service'
import { DID, Signer } from '@ucanto/interface'
import { spaceOne } from '@/util/spaces'

export function useSpaceInfo (did: DID<'key'> | undefined) {
  const client = useClient()
  return useSWR((did && client) ? ['space/info', did] : null,
    async ([, did]: [never, DID<'key'> | undefined]) => {
      if (did && client) {
        const result = await Space.info.invoke({
          issuer: spaceOne,
          audience: client.id,
          with: did,
        }).execute(client)
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('Space.info failed:', result.out.error)
          return null
        }
      } else {
        return null
      }
    })
}