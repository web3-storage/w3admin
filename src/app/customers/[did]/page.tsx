'use client'

import { useCustomerInfo } from "@/hooks/customer"
import Link from "next/link"
import * as DidMailto from '@web3-storage/did-mailto'

function domainFromEmail (email: string) {
  const ind = email.indexOf('@')
  return email.slice(ind + 1)
}

export default function Customer ({ params: { did: encodedDid } }: { params: { did: string } }) {
  const did = DidMailto.fromString(decodeURIComponent(encodedDid))
  const { data: customer } = useCustomerInfo(did)
  const email = DidMailto.toEmail(did)
  const domain = domainFromEmail(email)
  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl mb-4'>Customer {did}</h2>
      {customer && (
        <div className='flex flex-col items-center'>
          <div className='flex flex-row space-x-2 mt-4 mb-8'>
            <button className='rounded bg-gray-500 px-2 py-1 hover:bg-gray-600 active:bg-gray-400'>Block {email}</button>
            <button className='rounded bg-gray-500 px-2 py-1 hover:bg-gray-600 active:bg-gray-400'>Block {domain}</button>
          </div>
          <h3 className='text-xl mb-2'>Subscriptions</h3>
          <table className='border-separate border-spacing-x-4'>
            <tbody>
              {
                customer.subscriptions?.map(subscriptionId => (
                  <tr key={subscriptionId}>
                    <td>
                      <Link className='underline text-blue-200' href={`/subscriptions/${subscriptionId}`}>
                        {subscriptionId}
                      </Link>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}