create extension if not exists pgcrypto;

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  wallet_address text not null,
  label text,
  role text not null default 'standard',
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.vaults (
  id uuid primary key default gen_random_uuid(),
  owner text not null unique,
  owner_did text,
  vault_contract_id text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  vc_id text not null,
  issuer text not null,
  issuer_did text,
  vc_data jsonb not null,
  status text not null default 'valid',
  tx_id text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner, vc_id)
);

create table if not exists public.issuer_identities (
  id uuid primary key default gen_random_uuid(),
  controller text not null,
  network text not null,
  did text not null,
  encrypted_identity text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(controller, network)
);

alter table public.api_keys enable row level security;
alter table public.vaults enable row level security;
alter table public.credentials enable row level security;
alter table public.issuer_identities enable row level security;

create index if not exists credentials_owner_idx on public.credentials(owner);
create index if not exists credentials_status_idx on public.credentials(status);
