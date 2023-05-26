import useSWR from 'swr'

export function useSubscriptionInfo (did: string) {
  return useSWR(['/subscription', did], ([, did]: [never, string]) => {
    // TODO invoke subscription/info UCAN
    return {
      customer: 'did:mailto:travis@example.com',
      consumer: 'did:key:z6Mko9iikCuip4SE6A2iD2s21UkcxZZkjxTzzE4PhhcED3gn'
    }
  })
}