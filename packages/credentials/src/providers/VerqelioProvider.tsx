"use client";

import React, { useMemo } from "react";
import { VerqelioConfigProps } from "../types/types";
import { VerqelioClient } from "../client";
import { VerqelioProviderContext, useVerqelioClient } from "./VerqelioClientContext";

/**
 * React provider that instantiates and exposes an `VerqelioClient`.
 * Wrap your app with this component to make the client available via `useVerqelioClient()`.
 *
 * The API key is automatically read from VERQELIO_API_KEY environment variable.
 * Set it in your .env file:
 *
 * VERQELIO_API_KEY=your-api-key-here
 *
 * API keys have roles (admin, standard, custom, early) that determine:
 * - Which endpoints can be accessed
 * - What fees are applied to transactions
 *
 * Get your API key from https://dapp.verqelio.example: connect a Stellar wallet,
 * sign in, and the key is minted bound to that wallet.
 *
 * @example
 * // .env: VERQELIO_API_KEY=your-api-key
 * <VerqelioConfig baseURL={mainNet}>
 *   <App />
 * </VerqelioConfig>
 */
export const VerqelioConfig = ({ baseURL, children, apiKey }: VerqelioConfigProps) => {
  // Recreate the client when the network (baseURL) or API key changes, so
  // switching network at runtime actually takes effect.
  const client = useMemo(() => new VerqelioClient(baseURL, apiKey), [baseURL, apiKey]);

  return (
    <VerqelioProviderContext.Provider value={{ client }}>
      {children}
    </VerqelioProviderContext.Provider>
  );
};
