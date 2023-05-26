import useSWR from 'swr'

export function useCustomerInfo(did: string) {
  return useSWR(['/customer', did], ([, did]: [never, string]) => {
    // TODO invoke customer/info UCAN
    return {
      subscriptions: ['did:mailto:example.com:travis']
    }
  })
}