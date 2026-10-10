/** Response body for `/credentials` issuance call. */
export type CreateCredentialResponse = {
  /** Credential identifier. */
  vc_id: string;
  /** Transaction ID of the issuance or store action. */
  tx_id: string;
};
