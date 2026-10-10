'use client';

import { CredPortConfig, mainNet, testNet } from '@credport/sdk';
import type { baseURL } from '@credport/sdk';

// The credport package does not export the StellarNetwork type — declare it locally.
type StellarNetwork = 'mainnet' | 'testnet';

function resolveBaseURL(network: StellarNetwork): baseURL {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL as baseURL;
  }

  return network === 'mainnet' ? mainNet : testNet;
}

function resolveNetwork(): StellarNetwork {
  const raw = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet';
  return raw === 'mainnet' ? 'mainnet' : 'testnet';
}

interface CredPortProviderProps {
  children: React.ReactNode;
}

export function CredPortProvider({ children }: CredPortProviderProps) {
  const network = resolveNetwork();
  const baseURL = resolveBaseURL(network);
  const apiKey = process.env.NEXT_PUBLIC_CREDPORT_API_KEY || 'placeholder-batch1-no-api-calls';

  return (
    <CredPortConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </CredPortConfig>
  );
}
