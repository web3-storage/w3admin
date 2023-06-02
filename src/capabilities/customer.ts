import { capability, struct, ok, Schema } from '@ucanto/validator'
import { Utils, Customer } from '@web3-storage/capabilities'

const { equal, equalWith, and } = Utils
const { AccountDID, ProviderDID } = Customer

export const block = capability({
  can: 'customer/block',
  with: ProviderDID,
  nb: struct({
    customer: AccountDID,
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