import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredAny(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim() !== '') return value;
  }
  throw new Error(`Missing required environment variable: ${names.join(' or ')}`);
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  corsOrigin:
    process.env.CORS_ORIGIN ??
    process.env.CORS_ALLOWED_ORIGINS ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3001',
  supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  apiKeySecret: required('API_KEY_SECRET'),
  adminBootstrapSecret: process.env.ADMIN_BOOTSTRAP_SECRET,
  stellarNetwork: process.env.STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
  stellarRpcUrl: process.env.STELLAR_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  stellarHorizonUrl: process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
  stellarNetworkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE,
  didRegistryContractId: required('DID_REGISTRY_CONTRACT_ID'),
  vaultFactoryContractId: requiredAny('VC_VAULT_FACTORY_CONTRACT_ID', 'FACTORY_CONTRACT_ID'),
  vaultWasmHash: required('VC_VAULT_WASM_HASH'),
  email: {
    from: process.env.EMAIL_FROM,
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 2525),
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
  },
};

export function networkPassphrase() {
  if (config.stellarNetworkPassphrase) return config.stellarNetworkPassphrase;
  return config.stellarNetwork === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';
}
