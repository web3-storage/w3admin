import useSWR from 'swr'

export function useSubscriptionInfo (did: string | undefined) {
  return useSWR(['/subscription', did], ([, did]: [never, string | undefined]) => {
    // TODO invoke subscription/info UCAN
    if (did) {
      return {
        customer: 'did:mailto:example.com:travis',
        consumer: 'did:key:z6Mko9iikCuip4SE6A2iD2s21UkcxZZkjxTzzE4PhhcED3gn'
      }
    } else {
      return null
    }
  })
}