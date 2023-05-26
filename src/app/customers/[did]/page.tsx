'use client'

import { useCustomerInfo } from "@/hooks/customer"
import Link from "next/link"

export default function Customer ({ params: { did: encodedDid } }: { params: { did: string } }) {
  const did = decodeURIComponent(encodedDid)
  const { data: customer, ...rest } = useCustomerInfo(did)
  console.log(customer, rest)
  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl mb-4'>Customer {did}</h2>
      {customer && (
        <div className='flex flex-col items-center'>
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