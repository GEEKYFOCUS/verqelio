# Deployment Checklist

This is the fastest safe path for a tonight deploy:

1. Supabase for data.
2. Render or Railway for `@credport/api`.
3. Vercel for `@credport/product`.
4. Upstash Redis only if share links must survive redeploys tonight. Otherwise
   keep the product in mock/memory mode for the first demo deploy.

## 1. Rotate Exposed Secrets

The Supabase and Mailtrap values shared during setup should be rotated before a
public deployment.

Generate fresh random values:

```bash
openssl rand -hex 32 # API_KEY_SECRET
openssl rand -hex 32 # ADMIN_BOOTSTRAP_SECRET
openssl rand -hex 32 # CREDENTIAL_ENCRYPTION_KEY
openssl rand -hex 32 # ISSUER_IDENTITY_ENCRYPTION_KEY
```

## 2. Supabase Database

Run `supabase/migrations/0001_core.sql` in the Supabase SQL editor.

Required values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never add it to Vercel public
environment variables.

## 3. API Deploy

### Render

From this `new-product` directory, Render can use:

- `render.yaml`
- `Dockerfile.api`
- health check: `/health`

Set the API environment:

```bash
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
API_KEY_SECRET=
ADMIN_BOOTSTRAP_SECRET=
CORS_ORIGIN=https://your-product-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-product-domain.vercel.app
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
DID_REGISTRY_CONTRACT_ID=CAJQFHGAJR5Q2NMGM7IYGM2KK6FLQXT634XZMGEYKKOYN2E2ONCFRSQK
VC_VAULT_FACTORY_CONTRACT_ID=CB23E4GXNRJ367BVPDRMGLADKBQLCWMAWP6SZVGFJPMR2D6I3KBA3B4H
VC_VAULT_WASM_HASH=2bd0323a98acb8469606808368da6c79824f2dd8391494b94ddbeb3d22c1a957
```

### Railway / Other Node Hosts

Use Node `22.22.1` or any Node `>=22.22.1 <25`.

```bash
pnpm install --frozen-lockfile
pnpm --filter @credport/api build
pnpm --filter @credport/api start
```

## 4. Product App Deploy

Deploy to Vercel from the monorepo root (`new-product`) with:

- install command: `pnpm install --frozen-lockfile`
- build command: `pnpm --filter @credport/product build`
- dev command: `pnpm --filter @credport/product dev`
- Node version: `22.x`

Product environment for a safe first deploy:

```bash
NEXT_PUBLIC_APP_URL=https://your-product-domain.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.onrender.com
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DATA_SOURCE=mock
PRESENTATION_STORE_DRIVER=memory
```

For durable share links, set these too and change
`PRESENTATION_STORE_DRIVER=upstash-redis`:

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 5. Create an API Key

After API deploy:

```bash
curl -X POST "$API_BASE_URL/api/keys" \
  -H "Content-Type: application/json" \
  -H "X-CredPort-Admin-Secret: $ADMIN_BOOTSTRAP_SECRET" \
  -d '{"walletAddress":"G...","label":"Demo key"}'
```

Use the returned key as:

```bash
NEXT_PUBLIC_CREDPORT_API_KEY=
NEXT_PUBLIC_DATA_SOURCE=real
```

Redeploy the product after adding `NEXT_PUBLIC_CREDPORT_API_KEY`.

## 6. Final Smoke Checks

```bash
curl "$API_BASE_URL/health"
curl "$API_BASE_URL/config"
pnpm typecheck
pnpm test
pnpm build
```

Open:

- `/`
- `/vault`
- `/credentials`
- `/share`
- `/verify/not-a-real-token`

## Known Tonight Trade-Off

The API currently persists credentials in Supabase and returns mock prepared
XDR for on-chain write preparation. That is enough for a demoable product and
share/verify flow, but not a full production Soroban transaction pipeline yet.
