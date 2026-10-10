'use client';

import { CredPortConfig, mainNet, testNet } from '@credport/sdk';
import type { baseURL } from '@credport/sdk';

// The credport package does not export the StellarNetwork type — declare it locally.
type StellarNetwork = 'mainnet' | 'testnet';

// Next.js inlines NEXT_PUBLIC_* at build time — declare so TypeScript resolves.
declare const NEXT_PUBLIC_STELLAR_NETWORK: string | undefined;
declare const NEXT_PUBLIC_CREDPORT_API_KEY: string | undefined;
declare const NEXT_PUBLIC_API_BASE_URL: string | undefined;

function resolveBaseURL(network: StellarNetwork): baseURL {
  if (typeof NEXT_PUBLIC_API_BASE_URL !== 'undefined' && NEXT_PUBLIC_API_BASE_URL) {
    return NEXT_PUBLIC_API_BASE_URL as baseURL;
  }

  return network === 'mainnet' ? mainNet : testNet;
}

function resolveNetwork(): StellarNetwork {
  const raw =
    typeof NEXT_PUBLIC_STELLAR_NETWORK !== 'undefined'
      ? (NEXT_PUBLIC_STELLAR_NETWORK as string)
      : 'testnet';
  return raw === 'mainnet' ? 'mainnet' : 'testnet';
}

interface CredPortProviderProps {
  children: React.ReactNode;
}

export function CredPortProvider({ children }: CredPortProviderProps) {
  const network = resolveNetwork();
  const baseURL = resolveBaseURL(network);
  const apiKey =
    typeof NEXT_PUBLIC_CREDPORT_API_KEY !== 'undefined' &&
    (NEXT_PUBLIC_CREDPORT_API_KEY as string).length > 0
      ? (NEXT_PUBLIC_CREDPORT_API_KEY as string)
      : 'placeholder-batch1-no-api-calls';

  return (
    <CredPortConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </CredPortConfig>
  );
}
