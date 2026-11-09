import type { ReactNode } from "react";

/**
 * Base API URL for Verqelio services.
 *
 * The two production URLs are suggested by autocomplete, but any string is
 * accepted so integrators can point at staging, a self-hosted API, or
 * `http://localhost:...` during development. The `mainNet` / `testNet`
 * constants are exported for convenience.
 */
export type baseURL =
  | "https://production-api.verqelio.example"
  | "https://sandbox-api.verqelio.example"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export interface VerqelioConfigProps {
  baseURL: baseURL;
  children: ReactNode;
  apiKey?: string;
}
