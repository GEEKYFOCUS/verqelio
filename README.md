# Verqelio

Verqelio is an early-stage project for issuing, holding, sharing, and verifying portable digital credentials. It combines a Next.js web application, a Supabase-backed API, TypeScript SDKs, and Stellar/Soroban identity and credential infrastructure.

> **Development status:** This project is under active development. The API's on-chain transaction preparation is not implemented yet and currently returns placeholder transaction data. Demo and mock-data flows should not be treated as proof of real on-chain issuance. See [Known limitations](#known-limitations).

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Development commands](#development-commands)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

- Credential vault and profile interfaces, with English and Spanish translations.
- Credential browsing, filtering, detail views, sharing, and public verification flows.
- Stellar wallet connection and client-side signing integration.
- Supabase-backed API for API keys, vault metadata, credentials, and issuer identities.
- TypeScript packages for credential workflows, DID handling, shared types, and UI.
- Soroban contracts for `did:stellar` identity registration and single-holder credential vaults.
- Optional Upstash Redis storage for presentation links; in-memory storage is available for local development and demos.

## Architecture

| Component | Location | Responsibility |
| --- | --- | --- |
| Product web app | `apps/product` | Next.js user interface and presentation routes |
| API | `apps/api` | Express endpoints and Supabase persistence |
| Credentials SDK | `packages/credentials` | TypeScript/React client and credential hooks |
| DID library | `packages/did-stellar` | Stellar DID records, validation, and resolution |
| Integration SDK | `packages/sdk` | Credential sources, DID, and presentation helpers |
| Shared packages | `packages/ui`, `packages/types`, `packages/config` | UI components, shared types, and configuration |
| Soroban contracts | `contracts` | DID registry, vault factory, and credential vault contracts |
| Database schema | `supabase/migrations` | Supabase migrations |

The web app, API, database, and contracts are separate parts of the system. Hosting the web app does not deploy the API or contracts.

## Getting started

### Prerequisites

- Node.js `>=22.22.1 <25`
- pnpm `10.25.0` (provided through Corepack)
- Supabase project credentials to run the API
- A Stellar wallet extension for wallet-connected flows

### Install dependencies

From the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
```

### Run the product app

The product can start with mock credential fixtures, so Supabase and the API are not required for this local UI workflow.

```bash
cp .env.example .env.local
pnpm --filter @verqelio/product dev
```

Open [http://localhost:3001](http://localhost:3001).

### Run the API

The API requires its server-side environment variables. Create `apps/api/.env` using the relevant values from [`.env.example`](.env.example), then start it from the repository root:

```bash
pnpm --filter @verqelio/api dev
```

The API listens on port `4000` by default. Its health endpoint is `/health` and its public network configuration endpoint is `/config`.

Do not commit `.env`, `.env.local`, `apps/api/.env`, database credentials, API secrets, or wallet private keys. Keep the Supabase service-role key on the server only.

## Configuration

See [`.env.example`](.env.example) for the environment variable reference.

### Product app

For local mock mode, the app can use:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_WALLET=real
NEXT_PUBLIC_DATA_SOURCE=mock
PRESENTATION_STORE_DRIVER=memory
```

Set `NEXT_PUBLIC_DATA_SOURCE=real` only when the API, database, and a valid API key are configured. `NEXT_PUBLIC_WALLET=real` enables the real wallet connector. The mock wallet is intentionally blocked in production builds.

The default in-memory presentation store is process-local; records may be lost after a restart and are not shared between instances. For durable links, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, then set `PRESENTATION_STORE_DRIVER=upstash-redis`.

### API and database

Before starting the API, apply [`supabase/migrations/0001_core.sql`](supabase/migrations/0001_core.sql) to your Supabase project. The API requires at least:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
API_KEY_SECRET=
DID_REGISTRY_CONTRACT_ID=
VC_VAULT_FACTORY_CONTRACT_ID=
VC_VAULT_WASM_HASH=
```

For hosted deployments, also set `ADMIN_BOOTSTRAP_SECRET`, `CORS_ORIGIN`, and `NEXT_PUBLIC_APP_URL` to deployment-specific values. Generate new secrets for each environment. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable or place it in the frontend hosting environment.

## Development commands

Run commands from the repository root:

| Command | Description |
| --- | --- |
| `pnpm --filter @verqelio/product dev` | Start the product app |
| `pnpm --filter @verqelio/api dev` | Start the API |
| `pnpm --filter @verqelio/product build` | Build the product app |
| `pnpm --filter @verqelio/api build` | Compile the API |
| `pnpm typecheck` | Type-check workspace packages |
| `pnpm lint` | Lint workspace packages |
| `pnpm test` | Run configured package tests |
| `pnpm format:check` | Check formatting |

Contract build, test, and deployment commands are documented in [`contracts/README.md`](contracts/README.md). Contract deployment is separate from application deployment.

## Deployment

The API has a Render blueprint in [`render.yaml`](render.yaml) and a Docker build in [`Dockerfile.api`](Dockerfile.api). The product app can be deployed separately to Vercel from the repository root with:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter @verqelio/product build`
- Node.js version: `22.x`

Configure the product's `NEXT_PUBLIC_API_BASE_URL` to the deployed API URL and the API's `CORS_ORIGIN` to the product's public origin. Apply the Supabase migration and set deployment secrets before enabling real-data mode. For a step-by-step checklist, see [`docs/deployment-checklist.md`](docs/deployment-checklist.md).

## Known limitations

- API transaction preparation currently returns placeholder XDR; real on-chain credential and vault writes through these API routes are not complete.
- Mock fixtures are for demonstrations and development; they are not persisted credentials or proof of chain verification.
- In-memory presentation storage and rate limiting are process-local. Multi-instance deployments need shared durable services.
- The repository does not include a root-level license covering the entire monorepo. License files exist for specific subprojects; see [License](#license) before reusing code.
- Some SDK documentation links use reserved `.example` domains and are not live service URLs.
- This update changes browser storage namespaces, signed-message domains, API authentication headers, and the API configuration field to Verqelio-specific names. Existing browser state and older client integrations are not migrated automatically.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Check existing issues and open a discussion or issue for substantial changes.
2. Keep changes focused and include tests for behavior changes.
3. Update documentation when commands, configuration, or public APIs change.
4. Run the relevant lint, type-check, and test commands.
5. Do not commit secrets, real credential data, or wallet private keys.

Pull requests should explain the problem, the change, and how it was verified. For contract changes, include the affected network assumptions and test coverage. The repository does not yet have a root-level `CONTRIBUTING.md` or `CODE_OF_CONDUCT.md`; contributors should follow these instructions and communicate respectfully.

## Security

Do not report vulnerabilities in public issues. The repository currently has package-specific security policies at [`packages/credentials/SECURITY.md`](packages/credentials/SECURITY.md) and [`contracts/SECURITY.md`](contracts/SECURITY.md); they cover their respective components. For issues outside those scopes, use GitHub's private vulnerability reporting for this repository if enabled by maintainers. Do not include secrets or personal credential data in reports.

## License

There is no root-level license for the entire monorepo at this time. Some subprojects include their own license files, such as [`packages/credentials/LICENSE`](packages/credentials/LICENSE), [`packages/did-stellar/LICENSE`](packages/did-stellar/LICENSE), and [`contracts/LICENSE`](contracts/LICENSE). Those licenses apply only to the components they cover. Review the applicable license before copying, modifying, or distributing code; do not assume the whole repository is licensed under one license.
