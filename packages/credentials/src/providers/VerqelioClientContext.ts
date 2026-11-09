import React, { useContext } from "react"
import { VerqelioClient } from "../client"

/** React context holding the configured `VerqelioClient`. */
export const VerqelioProviderContext = React.createContext<{ client: VerqelioClient | null }>({ client: null })

/**
 * Access the `VerqelioClient` from React context.
 * Throws if used outside `VerqelioConfig` provider.
 */
export function useVerqelioClient() {
  const ctx = useContext(VerqelioProviderContext)
  if (!ctx.client) throw new Error("useVerqelioClient must be inside VerqelioConfig")
  return ctx.client
}