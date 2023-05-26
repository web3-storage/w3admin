'use client'

import { useSpaceInfo } from "@/hooks/space"
import Link from "next/link"

export default function Space ({ params: { did: encodedDid } }: { params: { did: string } }) {
  const did = decodeURIComponent(encodedDid)
  const { data: space } = useSpaceInfo(did)
  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl mb-4'>Space {did}</h2>
      {space && (
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
          </tbody>
        </table>
      )}
    </div>
  )
}