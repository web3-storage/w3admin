import { capability, struct, ok, Schema, DID } from '@ucanto/validator'
import { Utils, Customer as UpstreamCustomer } from '@web3-storage/capabilities'

const { equal, equalWith, and } = Utils
const { AccountDID, ProviderDID } = UpstreamCustomer

export const block = capability({
  can: 'customer/block',
  with: ProviderDID,
  nb: struct({
    customer: Schema.or(AccountDID, DID.match({ method: 'web' })),
    blocked: Schema.boolean()
  }),
  derives: (child, parent) => {
    return (
      and(equalWith(child, parent)) ||
      and(equal(child.nb.customer, parent.nb.customer, 'customer')) ||
      ok({})
    )
  },
})

export const Customer = { ...UpstreamCustomer, block }
