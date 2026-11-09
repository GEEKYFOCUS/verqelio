import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';

const { getCredentialSource, getDataSourceMode, useVerqelioClient, useSession, verqelioClient, source } =
  vi.hoisted(() => ({
    getCredentialSource: vi.fn(),
    getDataSourceMode: vi.fn(),
    useVerqelioClient: vi.fn(),
    useSession: vi.fn(),
    verqelioClient: {},
    source: {},
  }));

vi.mock('@verqelio/sdk', () => ({
  getCredentialSource,
  getDataSourceMode,
  useVerqelioClient,
}));

vi.mock('@/session/session-provider', () => ({ useSession }));

import { useCredentialSource } from './use-credential-source';

const ADDRESS = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const DID = `did:stellar:testnet:${ADDRESS}`;

function connectedSession() {
  useSession.mockReturnValue({
    status: 'connected',
    address: ADDRESS,
    did: DID,
    connect: vi.fn(),
    disconnect: vi.fn(),
  });
}

function disconnectedSession() {
  useSession.mockReturnValue({
    status: 'disconnected',
    address: null,
    did: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  });
}

beforeEach(() => {
  getCredentialSource.mockReset().mockReturnValue(source);
  getDataSourceMode.mockReset();
  useVerqelioClient.mockReset().mockReturnValue(verqelioClient);
  useSession.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('useCredentialSource', () => {
  it('reports disconnected in real mode when the session is not connected', () => {
    getDataSourceMode.mockReturnValue('real');
    disconnectedSession();

    const { result } = renderHook(() => useCredentialSource());

    expect(result.current).toEqual({ status: 'disconnected' });
    expect(getCredentialSource).not.toHaveBeenCalled();
  });

  it('builds a real source from the session owner when connected in real mode', () => {
    getDataSourceMode.mockReturnValue('real');
    connectedSession();

    const { result } = renderHook(() => useCredentialSource());

    expect(result.current).toEqual({ status: 'ready', source });
    expect(getCredentialSource).toHaveBeenCalledWith({
      owner: ADDRESS,
      holderDid: DID,
      client: verqelioClient,
    });
  });

  it('stays ready with no wallet in mock mode', () => {
    getDataSourceMode.mockReturnValue('mock');
    disconnectedSession();

    const { result } = renderHook(() => useCredentialSource());

    expect(result.current).toEqual({ status: 'ready', source });
    expect(getCredentialSource).toHaveBeenCalledWith({
      owner: undefined,
      holderDid: undefined,
      client: verqelioClient,
    });
  });
});
