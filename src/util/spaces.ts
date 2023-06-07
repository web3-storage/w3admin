import { Signer as signer } from "@ucanto/principal/ed25519"
import { DID, Signer } from '@ucanto/interface'

// copied from https://github.com/web3-storage/w3up/blob/main/packages/access-client/test/helpers/fixtures.js
// tho note that the space DID there was wrong
export const spaceOneDid = 'did:key:z6Mkk89bC3JrVqKie71YEcc5M1SMVxuCgNx6zLZ8SYJsxALi'
export const spaceOne = signer.parse(
  'MgCZT5vOnYZoVAeyjnzuJIVY9J4LNtJ+f8Js0cTPuKUpFne0BVEDJjEu6quFIU8yp91/TY/+MYK8GvlKoTDnqOCovCVM='
)

export const spaceTwoDid = 'did:key:z6MkffDZCkCTWreg8868fG1FGFogcJj5X6PY93pPcWDn9bob'
export const spaceTwo = signer.parse(
  'MgCYbj5AJfVvdrjkjNCxB3iAUwx7RQHVQ7H1sKyHy46Iose0BEevXgL1V73PD9snOCIoONgb+yQ9sycYchQC8kygR4qY='
)

export const spacesByPublicKey: Record<DID<'key'>, Signer> = {
  [spaceOneDid]: spaceOne,
  [spaceTwoDid]: spaceTwo
}