'use client';

import { VerqelioConfig, mainNet, testNet } from '@verqelio/sdk';
import type { baseURL } from '@verqelio/sdk';

// The verqelio package does not export the StellarNetwork type — declare it locally.
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

interface VerqelioProviderProps {
  children: React.ReactNode;
}

export function VerqelioProvider({ children }: VerqelioProviderProps) {
  const network = resolveNetwork();
  const baseURL = resolveBaseURL(network);
  const apiKey = process.env.NEXT_PUBLIC_VERQELIO_API_KEY || 'placeholder-batch1-no-api-calls';

  return (
    <VerqelioConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </VerqelioConfig>
  );
}
