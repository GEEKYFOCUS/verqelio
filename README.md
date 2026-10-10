# CredPort

CredPort is a portable verifiable-credit and credential product built on Stellar,
Soroban contracts, Supabase, and a rebranded TypeScript product stack.

## Monorepo Layout

```text
apps/product       Next.js product app
apps/api           Supabase-backed credential API
packages/credentials  Credential SDK/client
packages/sdk       Product integration layer
packages/ui        Shared UI components
packages/types     Shared TypeScript types
contracts          Soroban contracts and deployment docs
supabase           Database migrations
```

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Run the API:

```bash
pnpm --filter @credport/api dev
```

Run the product app:

```bash
pnpm --filter @credport/product dev
```

## Security

Do not commit `.env.local` or real secrets. The API accepts `X-CredPort-Key`.

