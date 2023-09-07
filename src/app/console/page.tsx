'use client'

import { useContext, useState, useEffect, ChangeEvent } from 'react'
import { delegate } from '@ucanto/core'
import Countdown from 'react-countdown'
import { useAgent } from "@/hooks/agent"
import { ServiceContext, } from "@/contexts/service"
import { Delegation, Capabilities } from '@ucanto/interface'
import * as Ucanto from '@ucanto/interface'
import * as Signer from '@ucanto/principal/ed25519'
import { CarReader } from '@ipld/car/reader'
import { importDAG } from '@ucanto/core/delegation'
import { CopyToClipboardButton } from '@/components/copy'
import { SimpleError } from '@/components/error'

async function toDelegation (car: Blob): Promise<Delegation> {
  const blocks = []
  const bytes = new Uint8Array(await car.arrayBuffer())
  const reader = await CarReader.fromBytes(bytes)
  for await (const block of reader.blocks()) {
    blocks.push(block as Ucanto.Block)
  }
  return importDAG(blocks)
}

export default function Console () {
  const agent = useAgent()
  const agentDID = agent?.did()
  const [delegations, setDelegations] = useState<Delegation<Capabilities>[]>([])
  const [configuredServiceSigner, setConfiguredServiceSigner] = useState<Ucanto.Signer>()
  const [expiry, setExpiry] = useState<number>(30)
  useEffect(function () {
    if (agent) {
      setDelegations(agent.proofs())
    }
  }, [agent])
  const { servicePrincipal } = useContext(ServiceContext)

  const serviceSigner = configuredServiceSigner || servicePrincipal as Ucanto.Signer | undefined
  const haveSigningKey = !!(serviceSigner?.signatureAlgorithm)
  const canAuthorize = agent && servicePrincipal && serviceSigner && haveSigningKey
  async function authorize () {
    if (canAuthorize) {
      const delegation = await delegate({
        issuer: serviceSigner as Ucanto.Signer,
        audience: agent.issuer,
        capabilities: [
          { with: servicePrincipal.did(), can: 'customer/get' },
          { with: servicePrincipal.did(), can: 'consumer/get' },
          { with: servicePrincipal.did(), can: 'subscription/get' },
          { with: servicePrincipal.did(), can: 'rate-limit/*' },
        ],
        expiration: Math.floor(Date.now() / 1000) + (60 * expiry)
      })
      await agent.addProof(delegation)
      setDelegations(agent.proofs())
    }
  }
  function onServiceSignerPrivateKeyChange (e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value && servicePrincipal) {
      try {
        setConfiguredServiceSigner(Signer.parse(e.target.value).withDID(servicePrincipal.did()))
      } catch {
        // TODO: add error message to tell user this isn't a valid key
      }
    }
  }
  const hasDelegations = delegations && delegations.length > 0

  const [importError, setImportError] = useState<Error | null>()
  async function onImport (e: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (agent) {
      const input = e.target.files?.[0]
      if (input === undefined) return
      let delegation
      try {
        delegation = await toDelegation(input)
      } catch (err) {
        console.log(err)
        return
      }
      try {
        await agent.addProof(delegation)
        setDelegations(agent.proofs())
      } catch (err) {
        setImportError(err as Error)
        console.log(err)
      }
    }
  }
  const createDelegationCaps = `[
  { with: '${servicePrincipal?.did()}', can: 'customer/get' },
  { with: '${servicePrincipal?.did()}', can: 'consumer/get' },
  { with: '${servicePrincipal?.did()}', can: 'subscription/get' },
  { with: '${servicePrincipal?.did()}', can: 'rate-limit/*' },
]`
  return (
    <div className='flex flex-col items-center'>
      {
        agent && (
          <div className='flex flex-col items-center'>
            <div className='flex flex-col items-center gap-x-1 mb-4'>
              <h3 className='text-2xl font-bold'>Current Agent DID</h3>
              {agentDID && (
                <div className='flex flex-row items-center space-x-2'>
                  <CopyToClipboardButton text={agentDID} />
                  <span className='w-72 text-ellipsis overflow-hidden'>{agentDID}</span>
                </div>
              )}
              <h3 className='text-2xl font-bold mt-4'>Delegations</h3>
              {hasDelegations ? delegations.map(delegation => (
                <div key={delegation.link().toString()}>
                  <div>
                    <h3 className='font-bold inline'>issued by: </h3>
                    {delegation.issuer.did()}
                  </div>
                  <div>
                    <h3 className='font-bold inline'>expires in: </h3>
                    <Countdown date={delegation.expiration * 1000} />
                  </div>
                  {delegation.capabilities.map((capability, i) => (
                    <div key={i} className='flex flex-col m-2 '>
                      <div>
                        <h3 className='font-bold inline'>can: </h3>
                        {capability.can}
                      </div>
                      <div>
                        <h3 className='font-bold inline'>with: </h3>
                        {capability.with}
                      </div>
                    </div>
                  ))}
                </div>
              )) : (
                <div className='max-w-xl text-center mt-2'>
                  You do not currently have any delegations - create or import administrative delegations below.
                </div>
              )}
            </div>
            <div className='flex flex-col items-center my-4'>
              <h3 className='text-2xl font-bold my-2'>Create Delegation</h3>
              <div className='max-w-xl flex flex-col items-center'>
                <h5 className='text-lg'>To create an administrative delegation:</h5>
                <ol className='list-decimal px-8'>
                  <li>Ensure this browser window is secure: disable extensions, run in a dedicated profile, and take whatever other steps you need to ensure nobody can extract or observe the private key</li>
                  <li>Input the service signer&apos;s private key and hit &ldquo;authorize&rdquo;</li>
                </ol>
              </div>
              <div className='flex flex-col items-start'>
                <input className='w-72 mt-4 mb-2 px-2 py-1 text-black focus:outline-0'
                  type='password' placeholder='Service Signer Private Key'
                  onChange={onServiceSignerPrivateKeyChange} />
                <label className='mb-4'>
                  <input className='mr-4 px-2 py-1 text-black w-24' value={expiry} type='number'
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setExpiry(e.target.valueAsNumber)} />
                  expiry in minutes
                </label>
              </div>
              <button className='btn' onClick={authorize} disabled={!canAuthorize}>
                Authorize
              </button>
            </div>
            <div className='flex flex-col items-center my-4'>
              <h3 className='text-2xl font-bold my-2'>Import Delegation</h3>
              <div className='max-w-xl flex flex-col items-center'>
                <h5 className='text-lg'>To import an administrative delegation:</h5>
                <ol className='list-decimal px-8'>
                  <li>
                    Generate a delegation using custom code, granting the following capabilities:
                    <div className='flex flex-row items-center space-x-2'>
                      <CopyToClipboardButton text={createDelegationCaps} />
                      <code className='block bg-gray-500 p-2 my-2 whitespace-pre max-w-2xl overflow-x-scroll'>
                        {createDelegationCaps}
                      </code>
                    </div>
                  </li>
                  <li>Import the UCAN using the button below. </li>
                </ol>
              </div>
              <label className='btn text-center block w-52 my-4'>
                Import UCAN
                <input
                  type='file'
                  accept='.ucan,.car,application/vnd.ipfs.car'
                  className='hidden'
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    void onImport(e)
                  }}
                />
              </label>
              {importError && (
                <SimpleError>{importError.message}</SimpleError>
              )}
            </div>
          </div>
        )
      }
    </div>
  )
}