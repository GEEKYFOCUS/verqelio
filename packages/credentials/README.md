# CredPort Credentials SDK

[![npm](https://img.shields.io/npm/v/%40credport-team%2Fcredentials)](https://www.npmjs.com/package/@credport/credentials)

React/TypeScript SDK for [CredPort](https://credport.build): issue, store, verify, and revoke **verifiable credentials on Stellar** through single-tenant vaults, with non-custodial wallet signing and automatic issuer identity (did:stellar) onboarding.

- **Full documentation:** https://docs.credport.build
- **Quickstart (zero to credential):** https://docs.credport.build/quickstart

## Install

```bash
npm install @credport/credentials
# or: yarn add / pnpm add
```

Requires React 18 or 19 (peer dependency). Ships ESM + CJS with TypeScript declarations. Subpath exports: `@credport/credentials/hooks` and `@credport/credentials/types`.

## Quick start

```tsx
import { CredPortConfig, testNet } from "@credport/credentials";

// Get an API key at https://dapp.credport.build (API Keys section)
export function Providers({ children }) {
  return (
    <CredPortConfig baseURL={testNet} apiKey={process.env.NEXT_PUBLIC_CREDPORT_API_KEY}>
      {children}
    </CredPortConfig>
  );
}
```

Issue and verify a credential (your wallet signs; keys never leave the device):

```ts
import { useVault, useCredential, useVaultRead } from "@credport/credentials";

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
| `CredPortConfig` / `useCredPortClient` | Provider and direct access to the HTTP client |
| `useVault` | `createVault`, `denyIssuer`, `allowIssuer` (issuance is open by default; owners block by exception) |
| `useCredential` | `issue`, `revoke` |
| `useVaultRead` | `listVcIds`, `getVc`, `verifyVc` |
| `useSponsoredDid` | `registerSponsored`, `generateKeys`, `generateDid`, `isSupported` (testnet only) |
| `CredPortClient` | Everything else: `getConfig`, `vaultSetDid`, `vaultPush`, `vaultSetNewOwner`, `sponsoredVaultCreate`, identity APIs |
| `CredPortApiError` / `normalizeError` | Typed errors with stable `code`s, 30s timeouts |
| `mainNet` / `testNet` | Base URL constants (`https://api.{network}.credport.build`); custom URLs accepted |

API keys resolve from the `apiKey` prop or env (`CREDPORT_API_KEY_MAINNET` / `CREDPORT_API_KEY_TESTNET` / `CREDPORT_API_KEY`) and are sent as `X-CredPort-Key`.

## Issuer identity on a server

The issuer's `did:stellar` and its signing key are held in an `IssuerIdentityStorage`. In the browser the default is IndexedDB, which survives reloads. Everywhere else the default is an in-memory map, which does not survive a restart — and an issuer that forgets its identity registers a brand-new DID on the next boot, leaving every credential it already issued signed by a DID it no longer uses.

So server-side issuers must say which they want. Without `storage`, the first `getOrCreateIssuerIdentity` (and any `issue()` that omits `issuerDid`) throws `EphemeralIssuerStorageError` before signing or touching the chain:

```ts
import { CredPortClient, testNet } from "@credport/credentials";
import type { IssuerIdentity, IssuerIdentityStorage } from "@credport/credentials";

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

const client = new CredPortClient(testNet, apiKey, { storage });
```

For tests, demos, and short-lived scripts, an identity that dies with the process is fine — ask for it explicitly with `{ allowEphemeralStorage: true }` (or pass `new InMemoryIssuerIdentityStorage()`).

## Fees & networks

Issuance charges an on-chain fee paid by the issuer: **1 USDC per credential on mainnet** (USDC trustline required), **5 XLM on testnet**. Vaults, DIDs, and API keys are per network.

## Reference

- [SDK reference](https://docs.credport.build/sdk-overview) · [CredPortClient](https://docs.credport.build/credportClient)
- [API reference](https://docs.credport.build/api-overview) · [Errors](https://docs.credport.build/api-errors)
- [did:stellar](https://docs.credport.build/did-overview) · [Going to mainnet](https://docs.credport.build/mainnet-guide)
- [Security & data model](https://docs.credport.build/security)

## License

MIT License - see the LICENSE file for details.
