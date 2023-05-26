'use client'

import { useSubscriptionInfo } from "@/hooks/subscription"
import Link from "next/link"

export default function Subscription ({ params: { id: encodedId } }: { params: { id: string } }) {
  const id = decodeURIComponent(encodedId)
  const { data: subscription } = useSubscriptionInfo(id)
  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl mb-4'>Subscription {id}</h2>
      {subscription && (
        <table className='border-separate border-spacing-x-4'>
          <tbody>
            <tr>
              <td className='font-bold'>Customer</td>
              <td>
                <Link className='underline text-blue-200' href={`/customers/${subscription.customer}`}>
                  {subscription.customer}
                </Link>
              </td>
            </tr>
            <tr>
              <td className='font-bold'>Space</td>
              <td>
                <Link className='underline text-blue-200' href={`/spaces/${subscription.consumer}`}>
                  {subscription.consumer}
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}