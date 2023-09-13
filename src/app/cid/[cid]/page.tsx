'use client'

import Link from "next/link"
import { notFound } from "next/navigation"
import { SimpleError } from "@/components/error"
import { Loader } from "@/components/brand"
import { useContentCid, useShardCid } from "@/hooks/cid"

export const runtime = 'edge'

function Space ({ space }: { space: { did: string, insertedAt: string } }) {
  return (
    <div className='flex flex-row justify-between'>
      <div className='w-7/12 overflow-hidden text-ellipsis'>
        <Link className='underline text-blue-200' href={`/spaces/${space.did}`}>{space.did}</Link>
      </div>
      <div className='w-4/12'>{space.insertedAt}</div>
    </div>
  )
}

export default function Customer ({ params: { cid } }: { params: { cid: string } }) {

  const { data: contentData, error: contentError, isLoading: contentIsLoading } = useContentCid(cid)
  const { data: shardData, error: shardError, isLoading: shardIsLoading } = useShardCid(cid)

  if (cid) {
    return (
      <div className='flex flex-col items-center'>
        <h2 className='text-2xl mb-4'>CID {cid}</h2>
        <h3 className='text-xl mb-2'>Uploaded</h3>
        {contentIsLoading ? <Loader /> : (
          <>
            {contentError && <SimpleError>{contentError.toString()}</SimpleError>}
            {contentData && (
              <div className='flex flex-col items-center'>
                {contentData.spaces.map((space, i) => <Space space={space} key={i} />)}
              </div>
            )}
          </>
        )}
        <h3 className='text-xl mt-4 mb-2'>Stored</h3>
        {shardIsLoading ? <Loader /> : (
          <>
            {shardError && <SimpleError>{shardError.toString()}</SimpleError>}
            {shardData && (
              <div className='flex flex-col items-center'>
                {shardData.spaces.map((space, i) => <Space space={space} key={i} />)}
              </div>
            )}
          </>
        )}
      </div>
    )
  } else {
    return notFound()
  }
}