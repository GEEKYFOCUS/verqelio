import React, { useContext } from "react"
import { CredPortClient } from "../client"

/** React context holding the configured `CredPortClient`. */
export const CredPortProviderContext = React.createContext<{ client: CredPortClient | null }>({ client: null })

/**
 * Access the `CredPortClient` from React context.
 * Throws if used outside `CredPortConfig` provider.
 */
export function useCredPortClient() {
  const ctx = useContext(CredPortProviderContext)
  if (!ctx.client) throw new Error("useCredPortClient must be inside CredPortConfig")
  return ctx.client
}