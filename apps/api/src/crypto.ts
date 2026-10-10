import crypto from 'node:crypto';
import { config } from './config.js';

export function createApiKey() {
  return `cp_${crypto.randomBytes(32).toString('hex')}`;
}

export function hashApiKey(apiKey: string) {
  return crypto.createHmac('sha256', config.apiKeySecret).update(apiKey).digest('hex');
}

export function txId(prefix = 'local') {
  return `${prefix}_${crypto.randomBytes(16).toString('hex')}`;
}
