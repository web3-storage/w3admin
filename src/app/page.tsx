'use client'
import type { EmailAddress } from "@web3-storage/did-mailto/dist/src/types";
import { useState, useCallback, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation";
import * as MailtoDid from '@web3-storage/did-mailto'

export default function Root () {
  const router = useRouter();
  const [spaceDID, setSpaceDID] = useState<string | undefined>()
  const goToSpace = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (spaceDID) {
      router.push(`/spaces/${spaceDID.toString()}`)
    }
  }, [router, spaceDID])
  const [customerEmail, setCustomerEmail] = useState<EmailAddress | undefined>()
  const goToCustomer = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (customerEmail) {
      router.push(`/customers/${MailtoDid.fromEmail(customerEmail)}`)
    }
  }, [router, customerEmail])
  return (
      <div className='flex flex-col items-center'>
        <h1 className='text-xl mb-10'>Admin</h1>
        <form onSubmit={goToSpace} className='flex flex-col space-y-2 mb-16'>
          <input className='text-black py-1 px-2 rounded' type='text' placeholder="Space DID" onChange={(e: ChangeEvent<HTMLInputElement>) => setSpaceDID(e.target.value)} />
          <input className='w3ui-button' type='submit' value='Go'/>
        </form>
        <form onSubmit={goToCustomer} className='flex flex-col space-y-2'>
          <input className='text-black py-1 px-2 rounded' type='text' placeholder="Customer Email" onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value as EmailAddress)} />
          <input className='w3ui-button' type='submit' value='Go'/>
        </form>
      </div>
  )
}