import useSWR from 'swr'

export function useCustomerInfo (did: string | undefined) {
  return useSWR(['/customer', did], ([, did]: [never, string | undefined]) => {
    // TODO invoke customer/info UCAN
    if (did) {
      return {
        subscriptions: ['did:mailto:example.com:travis']
      }
    } else {
      return null
    }
  })
}