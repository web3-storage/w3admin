'use client'

import { Loader } from "@/components/brand"
import { SimpleError } from "@/components/error"
import { useSubscription } from "@/hooks/subscription"
import Link from "next/link"

export const runtime = 'edge'

export default function Subscription ({ params: { id: encodedId } }: { params: { id: string } }) {
  const id = decodeURIComponent(encodedId)
  const { data: subscription, error, isLoading } = useSubscription(id)
  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl mb-4'>Subscription {id}</h2>
      {isLoading && <Loader />}
      {error && <SimpleError>{error.message}</SimpleError>}
      {subscription && (
        <table className='border-separate border-spacing-x-4'>
          <tbody>
            <tr>
              <td className='font-bold'>Customer</td>
              <td>
                <Link className='underline text-blue-200' href={`/customers/${encodeURIComponent(subscription.customer)}`}>
                  {decodeURIComponent(subscription.customer)}
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