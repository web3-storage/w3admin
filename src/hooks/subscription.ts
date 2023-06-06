import { spaceOneDid } from '@/util/spaces'
import useSWR from 'swr'

export function useSubscriptionInfo (did: string | undefined) {
  return useSWR(['/subscription', did], ([, did]: [never, string | undefined]) => {
    // TODO invoke subscription/info UCAN
    if (did) {
      return {
        customer: 'did:mailto:example.com:travis',
        consumer: spaceOneDid
      }
    } else {
      return null
    }
  })
}