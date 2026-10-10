/**
 * Payload variants to create a credential.
 * - Signed XDR flow: submit `signedXdr` and `vcId`.
 * - Server-issued flow: provide `owner`, `vcId`, `vcData`, and `vaultContractId` (optional `didUri`).
 */
export type CreateCredentialPayload =
  | {
      signedXdr: string;
      vcId: string;
    }
  | {
      owner: string;
      vcId: string;
      vcData: string;
      vaultContractId: string;
      didUri?: string;
    };
