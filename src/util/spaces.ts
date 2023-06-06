import { Signer } from "@ucanto/principal/ed25519"

// copied from https://github.com/web3-storage/w3up/blob/main/packages/access-client/test/helpers/fixtures.js
// tho note that the space DID there was wrong
export const spaceOneDid = 'did:key:z6Mkk89bC3JrVqKie71YEcc5M1SMVxuCgNx6zLZ8SYJsxALi'
export const spaceOne = Signer.parse(
  'MgCZT5vOnYZoVAeyjnzuJIVY9J4LNtJ+f8Js0cTPuKUpFne0BVEDJjEu6quFIU8yp91/TY/+MYK8GvlKoTDnqOCovCVM='
)
