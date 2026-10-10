/**
 * Entry point for the CredPort SDK.
 *
 * Exposes the provider, client hooks, environment base URLs,
 * and re-exports hooks and types.
 */
export { CredPortConfig } from "./providers/CredPortProvider";
export { useCredPortClient } from "./providers/CredPortClientContext";

/** Base API URL for CredPort mainnet. */
export const mainNet = "https://production-api.credport.build";
/** Base API URL for CredPort testnet. */
export const testNet = "https://sandbox-api.credport.build";

/** Re-export all hooks. */
export * from "./hooks";
/** Re-export all type definitions. */
export * from "./types";

/**
 * Re-export the issuer-identity layer. Most consumers do not need to
 * import from here — `useCredential().issue()` and
 * `CredPortClient.getOrCreateIssuerIdentity()` cover the common path.
 */
export * from "./identity";

/** Direct access to the HTTP client for advanced flows. */
export { CredPortClient } from "./client";
export type { CredPortClientIdentityOptions } from "./client";

/** Normalized error type thrown by every client request. */
export { CredPortApiError, normalizeError } from "./errors";
