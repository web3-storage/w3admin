'use client'

import { useState, useCallback, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation";

export default function Root () {
  const router = useRouter();
  const [spaceDID, setSpaceDID] = useState<string | undefined>()
  const goToSpace = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (spaceDID) {
      console.log("going to ", `/space/${spaceDID.toString()}`)
      router.push(`/spaces/${spaceDID.toString()}`)
    }
  }, [spaceDID])
  return (
      <div className='flex flex-col items-center'>
        <h1 className='text-xl mb-10'>Admin</h1>
        <form onSubmit={goToSpace} className='flex flex-col space-y-2'>
          <input className='text-black py-1 px-2 rounded' type='text' placeholder="Space DID" onChange={(e: ChangeEvent<HTMLInputElement>) => setSpaceDID(e.target.value)} />
          <input className='w3ui-button' type='submit' value='Go'/>
        </form>
      </div>
  )
}