import { capability, struct, ok, Schema, intersection } from '@ucanto/validator'
import { Utils, Customer } from '@web3-storage/capabilities'

const { equal, equalWith, and} = Utils
const { ProviderDID } = Customer

export const add = capability({
  can: 'rate-limit/add',
  with: ProviderDID,
  nb: struct({
    subject: Schema.string(),
    rate: Schema.number()
  }),
  derives: (child, parent) => {
    return (
      and(equalWith(child, parent)) ||
      and(equal(child.nb.subject, parent.nb.subject, 'subject')) ||
      and(equal(child.nb.rate, parent.nb.rate, 'rate')) ||
      ok({})
    )
  },
})

export const remove = capability({
  can: 'rate-limit/remove',
  with: ProviderDID,
  nb: struct({
    subject: Schema.string()
  }),
  derives: (child, parent) => {
    return (
      and(equalWith(child, parent)) ||
      and(equal(child.nb.subject, parent.nb.subject, 'subject')) ||
      ok({})
    )
  },
})

export const RateLimit = { add, remove }
