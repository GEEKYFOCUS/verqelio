/**
 * Entry point for the Verqelio SDK.
 *
 * Exposes the provider, client hooks, environment base URLs,
 * and re-exports hooks and types.
 */
export { VerqelioConfig } from "./providers/VerqelioProvider";
export { useVerqelioClient } from "./providers/VerqelioClientContext";

/** Base API URL for Verqelio mainnet. */
export const mainNet = "https://production-api.verqelio.example";
/** Base API URL for Verqelio testnet. */
export const testNet = "https://sandbox-api.verqelio.example";

/** Re-export all hooks. */
export * from "./hooks";
/** Re-export all type definitions. */
export * from "./types";

/**
 * Re-export the issuer-identity layer. Most consumers do not need to
 * import from here — `useCredential().issue()` and
 * `VerqelioClient.getOrCreateIssuerIdentity()` cover the common path.
 */
export * from "./identity";

/** Direct access to the HTTP client for advanced flows. */
export { VerqelioClient } from "./client";
export type { VerqelioClientIdentityOptions } from "./client";

/** Normalized error type thrown by every client request. */
export { VerqelioApiError, normalizeError } from "./errors";
