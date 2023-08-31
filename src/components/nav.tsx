import { useContext } from "react"
import { Listbox } from '@headlessui/react'

import { ServiceContext } from "@/contexts/service"
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import Image from 'next/image'
import Link from 'next/link'
import logo from '@/images/w3.svg'

export default function Nav () {
  const { serviceConfigs, selectedServiceKey, setSelectedServiceKey } = useContext(ServiceContext)
  const selectedService = selectedServiceKey && serviceConfigs[selectedServiceKey]
  return (
    <div className='flex flex-row items-center bg-transparent px-4 py-2 justify-between'>
      <Link href='/'><Image src={logo} alt='the w3up logo' /></Link>
      <div className='flex flex-row items-center space-x-2'>
        <div className='flex flex-row items-center'>
          <div className='text-lg box-border border-white border-2 rounded-l-lg h-full px-2 pb-1'>
            Service:
          </div>
          <div className='w-44 text-black'>
            <Listbox value={selectedServiceKey} onChange={setSelectedServiceKey}>
              <div className="relative">
                <Listbox.Button className='relative w-full cursor-default rounded-r-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
                  <span className="block truncate">
                    {selectedService ? selectedService.name : 'none'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>

                </Listbox.Button>
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {Object.entries(serviceConfigs).map(([key, config]) => (
                    <Listbox.Option key={key} value={key}
                      className='relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 ui-active:bg-amber-100 ui-active:text-amber-900'>
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                              }`}
                          >
                            {config.name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
        <Link href='/console' className='text-lg'>Console</Link>
      </div>
    </div >
  )
}