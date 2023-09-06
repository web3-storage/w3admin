import { useContext } from "react"
import Image from 'next/image'
import Link from 'next/link'
import { ServiceContext } from "@/contexts/service"
import logo from '@/images/w3.svg'
import { Logo } from "./brand"

export default function Nav () {
  return (
    <div className='flex flex-row items-center bg-transparent px-4 py-2 justify-between'>
      <Link href='/'><Logo /></Link>
      <div className='flex flex-col text-xs items-center'>
        <div>
          {process.env.NEXT_PUBLIC_SERVICE_DID}
        </div>
        <div>
          {process.env.NEXT_PUBLIC_SERVICE_URL}
        </div>
      </div>
      <Link href='/console' className='text-lg'>Console</Link>
    </div >
  )
}