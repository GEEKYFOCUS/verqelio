# Verqelio

**Portable, wallet-controlled credentials built on Stellar.** Verqelio is a revamp of the ACTA/CredPort credential experience: a web app and developer toolkit for storing, sharing, and verifying digital credentials, with a path to anchoring identity and credential state on Stellar.

> **Project status:** This repository is suitable for a testnet/demo deployment when configured as described below. It is not a finished production issuance system: the API's on-chain write preparation currently returns placeholder XDR. See [Known limitations](#known-limitations) before using it for real credentials or funds.

## What it does

- Connects a holder's Stellar wallet and presents a credential vault interface.
- Lists, filters, views, shares, and verifies credentials; English and Spanish messages are included.
- Creates shareable credential presentations and supports revoking share links. In-memory share records are temporary; Upstash Redis can make them durable across restarts.
- Provides a Supabase-backed API for API keys, vault metadata, credentials, and issuer identities.
- Includes TypeScript SDKs for DID resolution, wallet-assisted credential flows, and app integration.
- Includes Soroban contracts for `did:stellar` registration and single-holder credential vaults.

The product is designed around non-custodial wallet signing: a user's wallet is expected to sign transactions locally. The app/API and contracts are separate deployables; deploying the website does not deploy contracts or make placeholder API transactions real.

## Repository map

| Path | Purpose |
| --- | --- |
| `apps/product` | Next.js 16 web application (default port 3001) |
| `apps/api` | Express API (default port 4000), Supabase persistence, health/config endpoints |
| `packages/credentials` | React/TypeScript credential client and hooks |
| `packages/did-stellar` | Stellar DID records, validation, and resolution |
| `packages/sdk` | Product-facing credential sources, DID and presentation helpers |
| `packages/ui`, `packages/types`, `packages/config` | Shared components, types, and configuration |
| `contracts` | Soroban contract workspace, deployment records, and contract documentation |
| `supabase/migrations` | Database schema migrations |
| `docs/deployment-checklist.md` | Hosting setup and demo deployment checklist |
| `docs/brand-migration.md` | CredPort-to-Verqelio rename details and compatibility notes |

## Run locally

### Requirements

- Node.js `>=22.22.1 <25`
- pnpm `10.25.0` (Corepack can activate the pinned package manager)
- Supabase credentials for the API; the web app can start in mock data mode

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm --filter @verqelio/product dev
```

Open `http://localhost:3001`. To run the API in another terminal:

```bash
pnpm --filter @verqelio/api dev
```

Or start both workspace apps with `pnpm dev`. Set real secrets only in ignored local environment files or your hosting provider's secret manager. Never commit `.env`, `.env.local`, Supabase service-role keys, wallet secrets, or API secrets.

## Configuration

The full variable template is in [`.env.example`](.env.example). For a first testnet demo:

### Product app (Vercel)

Set these as build/runtime environment variables:

```dotenv
NEXT_PUBLIC_APP_URL=https://<your-product-host>
NEXT_PUBLIC_API_BASE_URL=https://<your-api-host>
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_WALLET=real
NEXT_PUBLIC_DATA_SOURCE=mock
PRESENTATION_STORE_DRIVER=memory
```

`NEXT_PUBLIC_DATA_SOURCE=mock` uses demo fixtures. Switch to `real` only after the API, database, and API key are configured. `NEXT_PUBLIC_WALLET=real` enables real wallet connection; production builds intentionally reject the unsafe mock wallet. Memory-backed presentation links can disappear on a server restart or redeploy. Configure Upstash Redis and set `PRESENTATION_STORE_DRIVER=upstash-redis` when links must persist.

### API (Render or another Node host)

Configure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `API_KEY_SECRET`, `ADMIN_BOOTSTRAP_SECRET`, `DID_REGISTRY_CONTRACT_ID`, `VC_VAULT_FACTORY_CONTRACT_ID`, and `VC_VAULT_WASM_HASH`. Set `CORS_ORIGIN` and `NEXT_PUBLIC_APP_URL` to the deployed product origin. For testnet, use the testnet RPC and passphrase values from [`.env.example`](.env.example). Generate fresh random API/admin/encryption secrets for the deployment; do not reuse values from local configuration.

Apply [`supabase/migrations/0001_core.sql`](supabase/migrations/0001_core.sql) to the Supabase project before starting the API. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side; it must never be a `NEXT_PUBLIC_` value or be added to Vercel's public environment.

## Deploy

The repo includes a Render blueprint for the API at [`render.yaml`](render.yaml) and a Docker build at [`Dockerfile.api`](Dockerfile.api). For the product, create a Vercel project rooted at this repository directory (`verqelio/`) and configure:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter @verqelio/product build`
- Node.js: `22.x`

Deploy the API and web app separately, then set the web app's `NEXT_PUBLIC_API_BASE_URL` to the actual API URL and the API's `CORS_ORIGIN` to the actual web origin. Use [`docs/deployment-checklist.md`](docs/deployment-checklist.md) for the ordered setup, API key creation, and suggested smoke-check routes. In a monorepo hosting setup, ensure the project root is `verqelio`, not the parent workspace containing unrelated projects.

## Workspace commands

```bash
pnpm dev                                      # run workspace development tasks
pnpm --filter @verqelio/product build         # build web app
pnpm --filter @verqelio/api build             # compile API
pnpm typecheck                                # type-check workspace packages
pnpm lint                                     # lint workspace packages
pnpm test                                     # run package test tasks
```

Soroban contract build/deployment instructions and recorded network deployments are documented in [`contracts/README.md`](contracts/README.md) and `contracts/docs/deployments/`. Contract deployment is a separate operation from hosting the product and API.

## Known limitations

- API transaction preparation currently returns `MOCK_PREPARE_XDR_REPLACE_WITH_SOROBAN_TRANSACTION_BUILDER`. Credential/vault writes are therefore not a complete on-chain transaction flow. Do not claim real chain issuance from this API is production-ready.
- A demo deployment can use mock credential fixtures and testnet wallet connectivity. Mock-mode screens are for demonstration, not evidence of persisted or chain-verified credentials.
- In-memory presentation storage and rate limiting are process-local; use a durable shared service for multi-instance/production traffic.
- Production hardening, deployment secrets, CORS, database policies, monitoring, and end-to-end behavior must be reviewed for the specific deployment.
- The brand migration does not reserve the Verqelio GitHub organization, repository, domain, or npm scope. Some SDK documentation links use `.example` placeholders.

## Contributing

Changes should preserve non-custodial signing and keep secrets out of source control. Please include focused tests for behavior changes and update deployment or SDK docs when configuration or public interfaces change. See package-level READMEs for package-specific guidance.

## License

See the license files in this repository and the individual packages/contracts for applicable terms and upstream notices.
