import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Web3Service } from './web3.service';

describe('Web3Service', () => {
  let service: Web3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Web3Service]
    });
    service = TestBed.inject(Web3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('wrapProviderAutoAdd', () => {
    it('should ignore invalid or non-request providers', () => {
      expect(() => service.wrapProviderAutoAdd(null)).not.toThrow();
      expect(() => service.wrapProviderAutoAdd({})).not.toThrow();
    });

    it('should pass through normal methods without alteration', async () => {
      const mockRequest = vi.fn().mockResolvedValue(['0x123']);
      const provider = { request: mockRequest };

      service.wrapProviderAutoAdd(provider);

      const result = await provider.request({ method: 'eth_accounts' });
      expect(result).toEqual(['0x123']);
      expect(mockRequest).toHaveBeenCalledWith({ method: 'eth_accounts' });
    });

    it('should intercept unrecognized chain error 4902 on switch and invoke addNetworkToWallet', async () => {
      let callCount = 0;
      const mockRequest = vi.fn().mockImplementation(async (args: { method: string; params?: any[] }) => {
        if (args.method === 'wallet_switchEthereumChain') {
          callCount++;
          if (callCount === 1) {
            const err: any = new Error('Unrecognized chain ID "0x61". Try adding the chain using wallet_addEthereumChain first.');
            err.code = 4902;
            throw err;
          }
          return null;
        }
        if (args.method === 'wallet_addEthereumChain') {
          return null;
        }
        return null;
      });

      const provider = { request: mockRequest };
      const addNetworkSpy = vi.spyOn(service, 'addNetworkToWallet').mockResolvedValue(true);

      service.wrapProviderAutoAdd(provider);

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }]
      });

      expect(addNetworkSpy).toHaveBeenCalledWith(97, provider);
      expect(callCount).toBe(2);
    });

    it('should throw if addNetworkToWallet fails or user rejects adding the network', async () => {
      const mockRequest = vi.fn().mockImplementation(async () => {
        const err: any = new Error('Unrecognized chain ID');
        err.code = 4902;
        throw err;
      });

      const provider = { request: mockRequest };
      vi.spyOn(service, 'addNetworkToWallet').mockResolvedValue(false);

      service.wrapProviderAutoAdd(provider);

      await expect(
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }]
        })
      ).rejects.toThrow('Unrecognized chain ID');
    });

    it('should recursively wrap multiple nested providers if available', async () => {
      const p1 = { request: vi.fn().mockResolvedValue(null) };
      const p2 = { request: vi.fn().mockResolvedValue(null) };
      const parentProvider = {
        request: vi.fn().mockResolvedValue(null),
        providers: [p1, p2]
      };

      service.wrapProviderAutoAdd(parentProvider);

      expect((parentProvider as any).__chainAutoAddWrapped).toBe(true);
      expect((p1 as any).__chainAutoAddWrapped).toBe(true);
      expect((p2 as any).__chainAutoAddWrapped).toBe(true);
    });
  });
});
