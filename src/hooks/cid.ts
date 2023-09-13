import useSWR from 'swr'
import { DID } from '@ucanto/interface'
import { Admin } from '@web3-storage/capabilities'
import { useServicePrincipal } from './service'
import { useAgent } from './agent'
import { parseLink } from '@ucanto/core'

export function useContentCid (maybeCid: string | undefined) {
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  return useSWR(
    (maybeCid && agent && servicePrincipal) ? [Admin.upload.inspect.can, maybeCid] : null,
    async ([, cid]: [never, string | undefined]) => {
      if (cid && agent && servicePrincipal) {
        const result = await agent.invokeAndExecute(Admin.upload.inspect, {
          with: servicePrincipal.did() as DID<'web'>,
          nb: {
            root: parseLink(cid)
          }
        })
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('useContentCid failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}

export function useShardCid (maybeCid: string | undefined) {
  const agent = useAgent()
  const servicePrincipal = useServicePrincipal()
  return useSWR(
    (maybeCid && agent && servicePrincipal) ? [Admin.store.inspect.can, maybeCid] : null,
    async ([, cid]: [never, string | undefined]) => {
      if (cid && agent && servicePrincipal) {
        const result = await agent.invokeAndExecute(Admin.store.inspect, {
          with: servicePrincipal.did() as DID<'web'>,
          nb: {
            link: parseLink(cid)
          }
        })
        if (result.out.ok) {
          return result.out.ok
        } else {
          console.error('useShardCid failed:', result.out.error)
          throw result.out.error
        }
      } else {
        return null
      }
    })
}