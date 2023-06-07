import { capability, struct, ok, Schema } from '@ucanto/validator'
import { Utils, Customer } from '@web3-storage/capabilities'
import { SpaceDID } from '@web3-storage/capabilities/space'
import { Space as UpstreamSpace } from '@web3-storage/capabilities'

const { equal, equalWith, and } = Utils
const { ProviderDID } = Customer

export const block = capability({
  can: 'space/block',
  with: ProviderDID,
  nb: struct({
    space: SpaceDID,
    blocked: Schema.boolean()
  }),
  derives: (child, parent) => {
    return (
      and(equalWith(child, parent)) ||
      and(equal(child.nb.space, parent.nb.space, 'space')) ||
      ok({})
    )
  },
})

export const Space = { ...UpstreamSpace, block } 
