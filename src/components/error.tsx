import { ReactNode } from "react";

export function SimpleError ({ children }: { children: ReactNode }) {
  return (<div className='text-red-500'>{children}</div>)
}