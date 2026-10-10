"use client";

import React, { useMemo } from "react";
import { CredPortConfigProps } from "../types/types";
import { CredPortClient } from "../client";
import { CredPortProviderContext, useCredPortClient } from "./CredPortClientContext";

/**
 * React provider that instantiates and exposes an `CredPortClient`.
 * Wrap your app with this component to make the client available via `useCredPortClient()`.
 *
 * The API key is automatically read from CREDPORT_API_KEY environment variable.
 * Set it in your .env file:
 *
 * CREDPORT_API_KEY=your-api-key-here
 *
 * API keys have roles (admin, standard, custom, early) that determine:
 * - Which endpoints can be accessed
 * - What fees are applied to transactions
 *
 * Get your API key from https://dapp.credport.build: connect a Stellar wallet,
 * sign in, and the key is minted bound to that wallet.
 *
 * @example
 * // .env: CREDPORT_API_KEY=your-api-key
 * <CredPortConfig baseURL={mainNet}>
 *   <App />
 * </CredPortConfig>
 */
export const CredPortConfig = ({ baseURL, children, apiKey }: CredPortConfigProps) => {
  // Recreate the client when the network (baseURL) or API key changes, so
  // switching network at runtime actually takes effect.
  const client = useMemo(() => new CredPortClient(baseURL, apiKey), [baseURL, apiKey]);

  return (
    <CredPortProviderContext.Provider value={{ client }}>
      {children}
    </CredPortProviderContext.Provider>
  );
};
