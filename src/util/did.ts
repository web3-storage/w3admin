import { DID } from '@ucanto/interface';
import { toEmail } from '@web3-storage/did-mailto';
import { DidMailto } from '@web3-storage/did-mailto/dist/src/types';

export function domainFromMailtoDid (did: DID<'mailto'>) {
  return toEmail(did as DidMailto).split('@')[1]
}
