import useSWR, { useSWRConfig } from 'swr'
import { RateLimit } from '@web3-storage/capabilities'
import { DID, Signer } from '@ucanto/interface'
import { useClient } from './service'

export function useRateLimitActions (subject: string | undefined) {
  const client = useClient()
  const { mutate } = useSWRConfig()

  async function addBlock () {
    if (subject && client) {
      const result = await RateLimit.add.invoke({
        issuer: client.id as Signer,
        audience: client.id,
        with: client.id.did() as DID<'web'>,
        nb: {
          subject,
          rate: 0
        }
      }).execute(client)
      if (result.out.ok) {
        mutate(['rate-limit/list', subject])
      } else {
        console.error('RateLimit.add:', result.out.error)
        throw result.out.error
      }
    }
  }

  async function removeRateLimit (id: string) {
    if (subject && client) {
      const result = await RateLimit.remove.invoke({
        issuer: client.id as Signer,
        audience: client.id,
        with: client.id.did() as DID<'web'>,
        nb: {
          id
        }
      }).execute(client)
      if (result.out.ok) {
        mutate(['rate-limit/list', subject])
      } else {
        console.error('RateLimit.remove:', result.out.error)
        throw result.out.error
      }
    }
  }

  const { data: rateLimits } = useRateLimits(subject)
  const blocks = rateLimits?.limits.filter(l => l.rate === 0) ?? []
  function removeBlock () {
    const block = blocks[0]
    if (block) {
      removeRateLimit(block.id)
    }
  }

  const blocked = blocks.length > 0

  return { addBlock, removeRateLimit, removeBlock, blocks, blocked }
}

export function useRateLimits (subject: string | undefined) {
  const client = useClient()
  return useSWR((subject && client) ? ['rate-limit/list', subject] : null,
    async ([, subject]: [never, DID<'web'> | undefined]) => {
      if (subject && client) {
        const result = await RateLimit.list.invoke({
          issuer: client.id as Signer,
          audience: client.id,
          with: client.id.did() as DID<'web'>,
          nb: {
            subject
          }
        }).execute(client)
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('RateLimit.list failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}