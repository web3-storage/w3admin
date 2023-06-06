import { DID } from '@ucanto/interface';
import { toEmail } from '@web3-storage/did-mailto';
import { DidMailto } from '@web3-storage/did-mailto/dist/src/types';

export function webDidFromMailtoDid (did: DID<'mailto'>) {
  const domain = toEmail(did as DidMailto).split('@')[1];
  return `did:web:${domain}` as DID<'web'>;
}
