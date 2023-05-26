import useSWR from 'swr'

export function useSpaceInfo (did: string) {
  return useSWR(['/space', did], ([, did]: [never, string]) => {
    // TODO invoke space/info UCAN
    return {
      allocated: 345093845,
      total: 1000000000,
      subscription: 'did:mailto:example.com:travis',
      blocked: false
    }
  })
}