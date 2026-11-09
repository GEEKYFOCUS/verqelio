# Verqelio Rename

Verqelio (ver-KEH-lee-oh) is the product name; `verqelio` is the proposed GitHub
organization and monorepo name. On 2026-10-10, exact-name web searches returned no
results and https://api.github.com/users/verqelio returned HTTP 404. This does not
guarantee that GitHub will allow registration, or establish domain or trademark
availability. No organization, repository, domain, or npm scope has been reserved.

## Updated Names

| Previous | Current |
| --- | --- |
| CredPort / creditPort | Verqelio |
| `acta-revamp/credport` | `acta-revamp/verqelio` |
| `@credport/*` | `@verqelio/*` |
| `CredPortClient`, `CredPortConfig`, `useCredPortClient` | `VerqelioClient`, `VerqelioConfig`, `useVerqelioClient` |
| `NEXT_PUBLIC_CREDPORT_API_KEY` | `NEXT_PUBLIC_VERQELIO_API_KEY` |
| `CREDPORT_API_KEY[_MAINNET/_TESTNET]` | `VERQELIO_API_KEY[_MAINNET/_TESTNET]` |
| `X-CredPort-Key`, `X-CredPort-Admin-Secret` | `X-Verqelio-Key`, `X-Verqelio-Admin-Secret` |

Update deployment environment variable names and rebuild the frontend. API key
values, encryption keys, Supabase data, and Stellar contract IDs are unchanged.
The API accepts the previous header names during migration. SDK symbols and
package imports use the new names, so external SDK consumers must update imports.

Use `NEXT_PUBLIC_API_BASE_URL` for your actual API endpoint. SDK URLs and email
addresses under `verqelio.example` are reserved placeholders, not deployed services.
GitHub links in inherited SDK guides remain proposed destinations pending migration.
The renamed working directory retains its Git history; no remote was created or pushed.

## Intentionally Retained Identifiers

- `credport-issuer-identity`: IndexedDB name retained to preserve encrypted issuer
  identities and their encryption keys.
- `credport:session:address`: retained browser session storage key.
- `CredPort:presentations:list:` and `CredPort:presentations:revoke:`: signed-message
  prefixes retained on both client and server for protocol compatibility.
- `credportContractId`: legacy API response field used by existing SDK clients.
- Previous API header names: accepted aliases for existing clients.
- Old names in this document: historical migration mappings.

These identifiers are not product branding. License files, NOTICE files, upstream
authorship, source snapshots, contract code, and on-chain identifiers are preserved.
The rename does not deploy contracts or complete the API's placeholder transaction
builder; those require separate validation before real credential issuance.
