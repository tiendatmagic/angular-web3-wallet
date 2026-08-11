import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Web3Service } from '@core/services/web3.service';

const web3ServiceMock = {
  isEnabled: false,
  address: signal<string | null>(null),
  chainId: signal<number | null>(null),
  isConnected: signal(false),
  balance: signal('0.0000'),
  networkName: signal(''),
  isWrongChain: signal(false),
  chainSymbol: signal('ETH'),
  txSpeed: signal<'default' | 'fast' | 'custom'>('default'),
  gasMultiplier: signal(2),
  showWrongChainModal: signal(false),
  configuredChainId: signal('42161'),
  POPULAR_CHAINS: [],
  connect: async () => {},
  openNetworkModal: async () => {},
  openAccountModal: async () => {},
  disconnect: async () => {},
  switchNetwork: async () => {},
  getSigner: async () => null,
  getProvider: () => null,
  getGasOverrides: async () => ({})
};

describe('App', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
      })
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: Web3Service, useValue: web3ServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });
});
