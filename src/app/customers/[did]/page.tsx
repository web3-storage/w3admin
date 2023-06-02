'use client'

import Link from "next/link"
import { notFound } from "next/navigation"
import * as DidMailto from '@web3-storage/did-mailto'

import { useCustomerActions, useCustomerInfo } from "@/hooks/customer"
import { useState } from "react"

function domainFromEmail (email: string) {
  const ind = email.indexOf('@')
  return email.slice(ind + 1)
}

function mailtoDidFromUrlComponent (urlComponent: string) {
  try {
    return DidMailto.fromString(decodeURIComponent(urlComponent))
  } catch {
    return undefined
  }
}

export default function Customer ({ params: { did: encodedDid } }: { params: { did: string } }) {
  const [domainBlocked, setDomainBlocked] = useState(false)
  const did = mailtoDidFromUrlComponent(encodedDid)
  const { data: customer } = useCustomerInfo(did)
  const emailBlocked = customer?.blocked
  const { setEmailBlocked } = useCustomerActions(did)
  if (did) {
    const email = DidMailto.toEmail(did)
    const domain = domainFromEmail(email)
    return (
      <div className='flex flex-col items-center'>
        <h2 className='text-2xl mb-4'>Customer {did}</h2>
        {customer && (
          <div className='flex flex-col items-center'>
            <div className='flex flex-row space-x-2 mt-4 mb-2'>
              <button className='rounded bg-gray-500 px-2 py-1 hover:bg-gray-600 active:bg-gray-400'
                onClick={() => setEmailBlocked(!emailBlocked)}>
                {emailBlocked ? 'Unblock' : 'Block'} {email}
              </button>
              <button className='rounded bg-gray-500 px-2 py-1 hover:bg-gray-600 active:bg-gray-400'
                onClick={() => setDomainBlocked(!domainBlocked)}>
                {domainBlocked ? 'Unblock' : 'Block'} {domain}
              </button>
            </div>
            <table className='border-separate border-spacing-x-4 mb-8'>
              <tbody>
                <tr>
                  <td className='font-bold'>Email blocked</td>
                  <td className='text-right'>{emailBlocked ? 'yes' : 'no'}</td>
                </tr>
                <tr>
                  <td className='font-bold'>Domain blocked</td>
                  <td className='text-right'>{domainBlocked ? 'yes' : 'no'}</td>
                </tr>
              </tbody>
            </table>
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
  } else {
    return notFound()
  }
}