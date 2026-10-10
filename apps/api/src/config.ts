import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  corsOrigin: process.env.CORS_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  apiKeySecret: required('API_KEY_SECRET'),
  adminBootstrapSecret: process.env.ADMIN_BOOTSTRAP_SECRET,
  stellarNetwork: process.env.STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
  stellarRpcUrl: process.env.STELLAR_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  stellarHorizonUrl: process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
  didRegistryContractId: required('DID_REGISTRY_CONTRACT_ID'),
  vaultFactoryContractId: required('VC_VAULT_FACTORY_CONTRACT_ID'),
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
  return config.stellarNetwork === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';
}
