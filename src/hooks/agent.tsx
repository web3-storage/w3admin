import { useContext } from "react"
import { AgentContext } from "@/contexts/agent"

export function useAgent () {
  const { agent } = useContext(AgentContext)
  return agent
}