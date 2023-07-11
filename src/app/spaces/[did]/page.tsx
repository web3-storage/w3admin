'use client'

import { useSpaceActions, useConsumerGet } from "@/hooks/space"
import { DIDKey } from "@ucanto/interface"
import Link from "next/link"

export default function Space ({ params: { did: encodedDid } }: { params: { did: string } }) {
  const did = decodeURIComponent(encodedDid)
  const { data: space, error } = useConsumerGet(did as DIDKey)
  const blocked = space?.blocked
  const { setBlocked } = useSpaceActions(did as DIDKey)
  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl mb-4'>Space {did}</h2>
      {space && (
        <>
          <button className='rounded bg-gray-500 px-2 py-1 hover:bg-gray-600 active:bg-gray-400'
            onClick={() => setBlocked(!blocked)}>
            {blocked ? 'Unblock space' : 'Block space'}
          </button>
          <table className='border-separate border-spacing-x-4'>
            <tbody>
              <tr>
                <td className='font-bold'>Allocated</td>
                <td className='text-right'>{space.allocated}</td>
              </tr>
              <tr>
                <td className='font-bold'>Total</td>
                <td className='text-right'>{space.total}</td>
              </tr>
              <tr>
                <td className='font-bold'>Subscription</td>
                <td className='text-right'>
                  <Link className='underline text-blue-200' href={`/subscriptions/${space.subscription}`}>
                    {space.subscription}
                  </Link>
                </td>
              </tr>
              <tr>
                <td className='font-bold'>Blocked</td>
                <td className='text-right'>{blocked ? 'yes' : 'no'}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      {error && (
        <h3 className='text-lg'>{error.message}</h3>
      )}
    </div>
  )
}