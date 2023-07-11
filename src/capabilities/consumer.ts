import { capability, struct, ok, Schema } from '@ucanto/validator'
import { Utils, Customer } from '@web3-storage/capabilities'

const { equal, equalWith, and } = Utils
const { ProviderDID } = Customer

export const get = capability({
  can: 'consumer/get',
  with: ProviderDID,
  nb: struct({
    consumer: Schema.string()
  }),
  derives: (child, parent) => {
    return (
      and(equalWith(child, parent)) ||
      and(equal(child.nb.consumer, parent.nb.consumer, 'consumer')) ||
      ok({})
    )
  },
})

export const Consumer = { get }
