# Verqelio Credentials SDK

[![npm](https://img.shields.io/npm/v/%40verqelio-team%2Fcredentials)](https://www.npmjs.com/package/@verqelio/credentials)

React/TypeScript SDK for [Verqelio](https://verqelio.example): issue, store, verify, and revoke **verifiable credentials on Stellar** through single-tenant vaults, with non-custodial wallet signing and automatic issuer identity (did:stellar) onboarding.

- **Full documentation:** https://docs.verqelio.example
- **Quickstart (zero to credential):** https://docs.verqelio.example/quickstart

## Install

```bash
npm install @verqelio/credentials
# or: yarn add / pnpm add
```

Requires React 18 or 19 (peer dependency). Ships ESM + CJS with TypeScript declarations. Subpath exports: `@verqelio/credentials/hooks` and `@verqelio/credentials/types`.

## Quick start

```tsx
import { VerqelioConfig, testNet } from "@verqelio/credentials";

// Get an API key at https://dapp.verqelio.example (API Keys section)
export function Providers({ children }) {
  return (
    <VerqelioConfig baseURL={testNet} apiKey={process.env.NEXT_PUBLIC_VERQELIO_API_KEY}>
      {children}
    </VerqelioConfig>
  );
}
```

Issue and verify a credential (your wallet signs; keys never leave the device):

```ts
import { useVault, useCredential, useVaultRead } from "@verqelio/credentials";

const { createVault } = useVault();
const { issue } = useCredential();
const { verifyVc } = useVaultRead();

await createVault({ owner, ownerDid, signTransaction });

await issue({
  owner,
  vcId: "badge-001",
  vcData: {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    type: ["VerifiableCredential"],
    credentialSubject: { id: holderDid, name: "Ada Lovelace" },
  },
  issuer,
  signTransaction,
  // issuerDid can be omitted: the SDK auto-registers a did:stellar
  // for the issuer with one wallet signature and reuses it afterwards.
});

const status = await verifyVc({ owner, vcId: "badge-001" });
// { status: "valid", since: "..." }
```

`signTransaction` is any wallet callback `(xdr, { networkPassphrase }) => Promise<signedXdr>` (Freighter, Albedo, WalletConnect...).

## What's inside

| Export | Purpose |
|--------|---------|
| `VerqelioConfig` / `useVerqelioClient` | Provider and direct access to the HTTP client |
| `useVault` | `createVault`, `denyIssuer`, `allowIssuer` (issuance is open by default; owners block by exception) |
| `useCredential` | `issue`, `revoke` |
| `useVaultRead` | `listVcIds`, `getVc`, `verifyVc` |
| `useSponsoredDid` | `registerSponsored`, `generateKeys`, `generateDid`, `isSupported` (testnet only) |
| `VerqelioClient` | Everything else: `getConfig`, `vaultSetDid`, `vaultPush`, `vaultSetNewOwner`, `sponsoredVaultCreate`, identity APIs |
| `VerqelioApiError` / `normalizeError` | Typed errors with stable `code`s, 30s timeouts |
| `mainNet` / `testNet` | Base URL constants (`https://api.{network}.verqelio.example`); custom URLs accepted |

API keys resolve from the `apiKey` prop or env (`VERQELIO_API_KEY_MAINNET` / `VERQELIO_API_KEY_TESTNET` / `VERQELIO_API_KEY`) and are sent as `X-Verqelio-Key`.

## Issuer identity on a server

The issuer's `did:stellar` and its signing key are held in an `IssuerIdentityStorage`. In the browser the default is IndexedDB, which survives reloads. Everywhere else the default is an in-memory map, which does not survive a restart — and an issuer that forgets its identity registers a brand-new DID on the next boot, leaving every credential it already issued signed by a DID it no longer uses.

So server-side issuers must say which they want. Without `storage`, the first `getOrCreateIssuerIdentity` (and any `issue()` that omits `issuerDid`) throws `EphemeralIssuerStorageError` before signing or touching the chain:

```ts
import { VerqelioClient, testNet } from "@verqelio/credentials";
import type { IssuerIdentity, IssuerIdentityStorage } from "@verqelio/credentials";

// Two methods, scoped by network. Back it with your database, a KMS, or an
// encrypted file — the identity holds private keys, so encrypt it at rest.
const storage: IssuerIdentityStorage = {
  async get(controller, network): Promise<IssuerIdentity | null> {
    return db.issuerIdentities.findOne({ controller, network });
  },
  async set(identity, network) {
    await db.issuerIdentities.upsert({ ...identity, network });
  },
};

const client = new VerqelioClient(testNet, apiKey, { storage });
```

For tests, demos, and short-lived scripts, an identity that dies with the process is fine — ask for it explicitly with `{ allowEphemeralStorage: true }` (or pass `new InMemoryIssuerIdentityStorage()`).

## Fees & networks

Issuance charges an on-chain fee paid by the issuer: **1 USDC per credential on mainnet** (USDC trustline required), **5 XLM on testnet**. Vaults, DIDs, and API keys are per network.

## Reference

- [SDK reference](https://docs.verqelio.example/sdk-overview) · [VerqelioClient](https://docs.verqelio.example/verqelioClient)
- [API reference](https://docs.verqelio.example/api-overview) · [Errors](https://docs.verqelio.example/api-errors)
- [did:stellar](https://docs.verqelio.example/did-overview) · [Going to mainnet](https://docs.verqelio.example/mainnet-guide)
- [Security & data model](https://docs.verqelio.example/security)

## License

MIT License - see the LICENSE file for details.
