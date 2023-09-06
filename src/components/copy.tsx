import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

export function CopyToClipboardButton ({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function onCopy(){
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }
  return (
    <CopyToClipboard text={text} onCopy={onCopy}>
      <ClipboardDocumentIcon className={`w-4 h-4 cursor-pointer ${copied ? 'text-green-400' : ''}`} />
    </CopyToClipboard>
  )
}
