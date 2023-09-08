import useSWR, { useSWRConfig } from 'swr'
import { RateLimit } from '@web3-storage/capabilities'
import { DID, Signer } from '@ucanto/interface'
import { useClient, useServicePrincipal } from './service'
import { useAgent } from './agent'

export function useRateLimitActions (subject: string | undefined) {
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  const { mutate } = useSWRConfig()

  async function addBlock () {
    if (subject && agent && servicePrincipal) {
      const result = await agent.invokeAndExecute(RateLimit.add, {
        with: servicePrincipal.did() as DID<'web'>,
        nb: {
          subject,
          rate: 0
        }
      })
      if (result.out.ok) {
        mutate(['rate-limit/list', subject])
      } else {
        console.error('RateLimit.add:', result.out.error)
        throw result.out.error
      }
    }
  }

  async function removeRateLimit (id: string) {
    if (subject && agent && servicePrincipal) {
      const result = await agent.invokeAndExecute(RateLimit.remove, {
        with: servicePrincipal.did() as DID<'web'>,
        nb: {
          id
        }
      })
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
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  return useSWR((subject && agent && servicePrincipal) ? ['rate-limit/list', subject] : null,
    async ([, subject]: [never, DID<'web'> | undefined]) => {
      if (subject && agent && servicePrincipal) {
        const result = await agent.invokeAndExecute(RateLimit.list, {
          with: servicePrincipal.did() as DID<'web'>,
          nb: {
            subject
          }
        })
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