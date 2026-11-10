import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { z } from 'zod';
import { config, networkPassphrase } from './config.js';
import { supabase } from './db.js';
import { createApiKey, hashApiKey, txId } from './crypto.js';
import { sendMail } from './mailer.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      config.corsOrigin === '*'
        ? true
        : config.corsOrigin
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());

const keySchema = z.object({
  walletAddress: z.string().min(10),
  label: z.string().max(80).optional(),
});

async function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.header('X-Verqelio-Key');
  if (!header) {
    res.status(401).json({ error: 'missing_api_key' });
    return;
  }

  const keyHash = hashApiKey(header);
  const { data, error } = await supabase
    .from('api_keys')
    .select('id,wallet_address,role,revoked_at')
    .eq('key_hash', keyHash)
    .maybeSingle();

  if (error || !data || data.revoked_at) {
    res.status(401).json({ error: 'invalid_api_key' });
    return;
  }

  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);
  res.locals.apiKey = data;
  next();
}

function requireAdminSecret(req: express.Request, res: express.Response, next: express.NextFunction) {
  const expected = config.adminBootstrapSecret;
  if (!expected && process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'admin_bootstrap_secret_not_configured' });
    return;
  }

  if (!expected) {
    next();
    return;
  }

  if (req.header('X-Verqelio-Admin-Secret') !== expected) {
    res.status(401).json({ error: 'invalid_admin_secret' });
    return;
  }

  next();
}

function prepareResponse() {
  return {
    xdr: 'MOCK_PREPARE_XDR_REPLACE_WITH_SOROBAN_TRANSACTION_BUILDER',
    network: networkPassphrase(),
  };
}

function parseJsonCredential(raw: unknown) {
  if (typeof raw === 'string') return JSON.parse(raw);
  return raw;
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'verqelio-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/config', (_req, res) => {
  res.json({
    rpcUrl: config.stellarRpcUrl,
    networkPassphrase: networkPassphrase(),
    networkType: config.stellarNetwork,
    factoryContractId: config.vaultFactoryContractId,
    vaultWasmHash: config.vaultWasmHash,
    didStellarRegistryId: config.didRegistryContractId,
    didStellarRegistryVersion: config.stellarNetwork === 'testnet' ? '0.3.0' : '0.2.0',
    didRegisterSponsoredSupported: config.stellarNetwork === 'testnet',
  });
});

app.post('/api/keys', requireAdminSecret, async (req, res) => {
  const parsed = keySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const apiKey = createApiKey();
  const { error } = await supabase.from('api_keys').insert({
    key_hash: hashApiKey(apiKey),
    wallet_address: parsed.data.walletAddress,
    label: parsed.data.label ?? 'Default key',
  });

  if (error) {
    res.status(500).json({ error: 'api_key_create_failed' });
    return;
  }

  res.status(201).json({ apiKey, header: 'X-Verqelio-Key' });
});

app.post('/contracts/vault/create', requireApiKey, async (req, res) => {
  if ('signedXdr' in req.body) {
    res.json({ tx_id: txId('vault') });
    return;
  }

  const parsed = z.object({ owner: z.string(), didUri: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  await supabase.from('vaults').upsert({
    owner: parsed.data.owner,
    owner_did: parsed.data.didUri,
    vault_contract_id: config.vaultFactoryContractId,
    updated_at: new Date().toISOString(),
  });

  res.json(prepareResponse());
});

app.post('/contracts/vc/issue', requireApiKey, async (req, res) => {
  if ('signedXdr' in req.body) {
    res.json({ tx_id: txId('issue') });
    return;
  }

  const parsed = z
    .object({
      owner: z.string(),
      vcId: z.string(),
      issuer: z.string(),
      issuerDid: z.string().optional(),
      vcData: z.union([z.string(), z.record(z.unknown())]),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const vcData = parseJsonCredential(parsed.data.vcData);
  const { error } = await supabase.from('credentials').upsert({
    owner: parsed.data.owner,
    vc_id: parsed.data.vcId,
    issuer: parsed.data.issuer,
    issuer_did: parsed.data.issuerDid,
    vc_data: vcData,
    status: 'valid',
    updated_at: new Date().toISOString(),
  });

  if (error) {
    res.status(500).json({ error: 'credential_store_failed' });
    return;
  }

  res.json(prepareResponse());
});

app.post('/contracts/vc/revoke', requireApiKey, async (req, res) => {
  if ('signedXdr' in req.body) {
    res.json({ tx_id: txId('revoke') });
    return;
  }

  const parsed = z.object({ owner: z.string(), vcId: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  await supabase
    .from('credentials')
    .update({ status: 'revoked', revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('owner', parsed.data.owner)
    .eq('vc_id', parsed.data.vcId);

  res.json(prepareResponse());
});

app.post('/contracts/vault/list-vc-ids', requireApiKey, async (req, res) => {
  const parsed = z.object({ owner: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const { data } = await supabase.from('credentials').select('vc_id').eq('owner', parsed.data.owner);
  res.json({ vc_ids: (data ?? []).map((row) => row.vc_id) });
});

app.post('/contracts/vault/get-vc', requireApiKey, async (req, res) => {
  const parsed = z.object({ owner: z.string(), vcId: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const { data } = await supabase
    .from('credentials')
    .select('vc_data')
    .eq('owner', parsed.data.owner)
    .eq('vc_id', parsed.data.vcId)
    .maybeSingle();

  if (!data) {
    res.status(404).json({ error: 'credential_not_found' });
    return;
  }

  res.json({ vc: data.vc_data });
});

app.post('/contracts/vault/verify-vc', requireApiKey, async (req, res) => {
  const parsed = z.object({ owner: z.string(), vcId: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const { data } = await supabase
    .from('credentials')
    .select('status,updated_at')
    .eq('owner', parsed.data.owner)
    .eq('vc_id', parsed.data.vcId)
    .maybeSingle();

  if (!data) {
    res.json({ status: 'revoked', since: new Date().toISOString() });
    return;
  }

  res.json({ status: data.status === 'revoked' ? 'revoked' : 'valid', since: data.updated_at });
});

app.get('/contracts/version', requireApiKey, (_req, res) => {
  res.json({ version: 'verqelio-api-mvp-0.1.0' });
});

app.post('/email/test', requireApiKey, async (req, res) => {
  const parsed = z.object({ to: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    return;
  }

  const result = await sendMail({
    to: parsed.data.to,
    subject: 'Verqelio email test',
    text: 'Verqelio SMTP is configured.',
  });
  res.json(result);
});

app.listen(config.port, () => {
  console.log(`Verqelio API listening on :${config.port}`);
});
