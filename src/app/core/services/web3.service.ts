import { Injectable, signal, inject, effect } from '@angular/core';
import { createAppKit, type AppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum, arbitrumSepolia, bsc, bscTestnet } from '@reown/appkit/networks';
import { ApiController, ChainController, ModalController, RouterController } from '@reown/appkit-controllers';
import { BrowserProvider, JsonRpcProvider, formatEther, parseEther } from 'ethers';
import { environment } from '@environments/environment';
import { ThemeService } from './theme.service';
import { ToastService } from './toast.service';
import { ModalService } from './modal.service';

export interface ExecuteTxOptions {
  title?: string;
  subtitle?: string;
  amount?: string;
  symbol?: string;
  toAddress?: string;
  confirmText?: string;
  chainId?: number | string;
  networkName?: string;
  onSuccess?: (receipt: any) => void;
  onError?: (error: any) => void;
}
import { POPULAR_CHAINS, getAllRpcUrls } from '../utils/blockchain.utils';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private modal!: AppKit;
  private targetChainBeforeConnect: number | null = null;
  private readonly translationService = inject(TranslationService);

  public readonly isEnabled: boolean = environment.enableWeb3;

  public address = signal<string | null>(
    (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem('angular_web3_last_address')) || null
  );
  public chainId = signal<number | null>(null);
  public isConnected = signal<boolean>(
    typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem('angular_web3_was_connected') === 'true'
  );
  public balance = signal<string>('0.0000');
  public chainSymbol = signal<string>('ETH');
  public networkName = signal<string>(this.translationService.t('showcase.unknown_network'));
  public isWrongChain = signal<boolean>(false);
  public txSpeed = signal<'default' | 'fast' | 'custom'>('default');
  public gasMultiplier = signal<number>(2);
  public showWrongChainModal = signal<boolean>(false);

  public readonly configuredChainId = signal<string>(
    (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem('angular_web3_configured_chain_id')) || environment.defaultChainId || '42161'
  );

  public readonly POPULAR_CHAINS = POPULAR_CHAINS;

  public readonly supportedChains = [arbitrum, mainnet, bsc, arbitrumSepolia, bscTestnet].map(chain => {
    const popular = POPULAR_CHAINS.find(c => Number(c.chainId) === Number(chain.id));
    const rpcList = getAllRpcUrls(chain.id);
    if (popular) {
      return {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          default: { http: rpcList.length > 0 ? rpcList : [popular.rpcUrl] }
        },
        blockExplorers: {
          ...chain.blockExplorers,
          default: { name: popular.name, url: popular.explorerUrl }
        }
      };
    }
    return chain;
  });

  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  constructor() {
    if (!this.isEnabled) {
      return;
    }
    this.initAppKit();
    this.setupThemeSync();

    effect(() => {
      const isConn = this.isConnected();
      const addr = this.address();
      if (isConn && addr) {
        this.closeConnectModalIfOpen();
      }
    });

    effect(() => {
      const isConn = this.isConnected();
      const confId = this.configuredChainId();
      if (!isConn) {
        const popular = POPULAR_CHAINS.find(c => c.chainId === confId);
        this.networkName.set(popular ? popular.name : this.translationService.t('showcase.unknown_network'));
        const symbol = popular ? ((popular as any).symbol || (popular.chainId === '56' ? 'BNB' : popular.chainId === '97' ? 'tBNB' : 'ETH')) : 'ETH';
        this.chainSymbol.set(symbol);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const chain = this.configuredChainId();
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && chain) {
        localStorage.setItem('angular_web3_configured_chain_id', chain);
      }
    });

    effect(() => {
      this.translationService.currentLang();
      if (this.isConnected() && this.isWrongChain()) {
        this.networkName.set(this.translationService.t('showcase.unknown_network'));
      }
    });
  }

  private setupThemeSync() {
    effect(() => {
      const isDark = this.themeService.isDarkMode();
      if (this.modal) {
        try {
          this.modal.setThemeMode(isDark ? 'dark' : 'light');
        } catch (e) {
          console.warn('[Web3] Failed to sync theme mode to AppKit:', e);
        }
      }
    });
  }

  public closeConnectModalIfOpen(): void {
    try {
      if (typeof window === 'undefined') return;
      if (ModalController.state.open) {
        const view = RouterController.state.view;
        if (!view || view.startsWith('Connect') || view === 'AllWallets') {
          ModalController.close();
          this.modal?.close();
        }
      }
    } catch (e) {
      console.warn('[Web3] Error closing connect modal:', e);
    }
  }

  private async initAppKit() {
    if (typeof window === 'undefined') return;

    const projectId = environment.walletConnectProjectId;
    if (!projectId) {
      console.warn('[Web3] walletConnectProjectId is missing in environment configuration.');
      return;
    }

    const isDark = this.themeService.isDarkMode();
    const initialChainIdNum = Number(this.configuredChainId() || environment.defaultChainId || '42161');
    const initialNetwork = this.supportedChains.find(c => Number(c.id) === initialChainIdNum) || this.supportedChains[0];

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('@appkit/active_caip_network_id', `eip155:${initialChainIdNum}`);
      localStorage.setItem('@appkit/active_namespace', 'eip155');
    }

    this.modal = createAppKit({
      adapters: [new EthersAdapter()],
      networks: this.supportedChains as any,
      defaultNetwork: initialNetwork as any,
      allowUnsupportedChain: true,
      metadata: {
        name: 'Angular Web3 DApp',
        description: this.translationService.t('about.subtitle'),
        url: window.location.origin,
        icons: [window.location.origin + '/assets/logo.svg']
      },
      projectId,
      themeMode: isDark ? 'dark' : 'light',
      allWallets: 'SHOW',
      featuredWalletIds: [
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        '8a0ee50d18f9e949c64773d86f34077371133272d824b86133b56cd2fb55be32',
        '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a87c97d0d8b1e',
        'fd20dc426fb3792d60343b87b379fd61f1621297160195fc497f1b4900ac2740'
      ],
      features: {
        email: false,
        socials: false,
        analytics: false,
        reownAuthentication: false
      },
      enableCoinbase: false
    } as any);

    this.modal.subscribeAccount(async (accountState) => {
      const prevConnected = this.isConnected();
      const hasAddress = !!accountState.address;

      if (hasAddress && accountState.isConnected) {
        const nextAddress = accountState.address || null;
        this.address.set(nextAddress);
        this.isConnected.set(true);

        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('angular_web3_last_address', nextAddress || '');
          localStorage.setItem('angular_web3_was_connected', 'true');
        }

        this.closeConnectModalIfOpen();

        const pendingTarget = this.targetChainBeforeConnect;
        this.targetChainBeforeConnect = null;

        if (pendingTarget) {
          const currentId = this.chainId();
          if (currentId && currentId !== pendingTarget) {
            void this.switchNetwork(pendingTarget);
          }
        }

        void this.updateBalanceAndNetwork();
      } else if (!hasAddress) {
        this.targetChainBeforeConnect = null;
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('angular_web3_last_address');
          localStorage.removeItem('angular_web3_was_connected');
        }
        this.address.set(null);
        this.isConnected.set(false);
        this.balance.set('0.0000');
        this.chainId.set(null);
        this.networkName.set(this.translationService.t('showcase.unknown_network'));
        this.isWrongChain.set(false);
        this.showWrongChainModal.set(false);
        if (prevConnected) {
          this.toastService.showToast(this.translationService.t('showcase.web3_disconnected'), 'error');
        }
      }
    });

    this.modal.subscribeNetwork((networkState) => {
      if (networkState.chainId) {
        const id = Number(networkState.chainId);
        this.checkAndUpdateNetworkState(id, true);

        if (this.isConnected() && !this.targetChainBeforeConnect) {
          const idStr = id.toString();
          this.configuredChainId.set(idStr);
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem('angular_web3_configured_chain_id', idStr);
            localStorage.setItem('@appkit/active_caip_network_id', `eip155:${idStr}`);
            localStorage.setItem('@appkit/active_namespace', 'eip155');
          }
        }
      }

      if (this.isConnected()) {
        this.updateBalanceAndNetwork();
      }
    });

    RouterController.subscribeKey('view', (view) => {
      if (this.isConnected() && this.address()) {
        if (view && (view.startsWith('Connect') || view === 'AllWallets')) {
          this.closeConnectModalIfOpen();
        }
      }
    });

    this.modal.subscribeEvents(async (event: any) => {
      const eventName = event.data?.event;
      if (eventName === 'CONNECT_SUCCESS') {
        this.closeConnectModalIfOpen();
      }
      const errorMsg = event.data?.properties?.message || event.data?.error || '';
      const isConnectionError = eventName === 'CONNECT_ERROR' || errorMsg.toString().toLowerCase().includes('declined') || errorMsg.toString().toLowerCase().includes('active');

      if (isConnectionError) {
        console.warn('[Web3] Connection or session stall detected in AppKit, releasing...');
        try {
          await this.modal.disconnect();
          await this.clearWalletConnectStorage();
        } catch (e) { }
      }
    });
  }

  private checkAndUpdateNetworkState(chainId: number, showToastAlert = true) {
    const prevChainId = this.chainId();
    const prevWrongChain = this.isWrongChain();

    this.chainId.set(chainId);

    const supportedChain = this.supportedChains.find(c => Number(c.id) === chainId);
    const isSupported = !!supportedChain;
    this.isWrongChain.set(!isSupported);

    if (isSupported) {
      this.networkName.set(supportedChain.name);
      const symbol = (supportedChain as any).nativeCurrency?.symbol || 'ETH';
      this.chainSymbol.set(symbol);

      this.showWrongChainModal.set(false);
      if (prevWrongChain) {
        try {
          this.modal.close();
        } catch (e) {
        }
      }
      if (showToastAlert && prevChainId && prevChainId !== chainId) {
        this.toastService.showToast(this.translationService.t('showcase.web3_network_switched', { network: supportedChain.name }), 'success');
      }

      const isTestnet = !!supportedChain.testnet || supportedChain.name.toLowerCase().includes('sepolia') || supportedChain.name.toLowerCase().includes('testnet');
      if (isTestnet) {
        this.txSpeed.set('fast');
      } else {
        this.txSpeed.set('default');
      }
    } else {
      const popular = POPULAR_CHAINS.find(c => Number(c.chainId) === chainId);
      this.networkName.set(popular ? popular.name : this.translationService.t('showcase.unknown_network'));
      this.chainSymbol.set((popular as any)?.symbol || 'ETH');

      if (this.isConnected()) {
        this.showWrongChainModal.set(true);
        if (showToastAlert && (!prevWrongChain || prevChainId !== chainId)) {
          this.toastService.showToast(this.translationService.t('showcase.web3_unsupported_network'), 'error');
        }
      } else {
        this.showWrongChainModal.set(false);
      }

      const isTestnet = popular
        ? popular.name.toLowerCase().includes('sepolia') || popular.name.toLowerCase().includes('testnet')
        : (chainId === 421614 || chainId === 97 || chainId === 11155111);
      if (isTestnet) {
        this.txSpeed.set('fast');
      } else {
        this.txSpeed.set('default');
      }
    }
  }

  public async updateBalanceAndNetwork() {
    try {
      const walletProvider = this.modal?.getWalletProvider();
      const currentAddress = this.address();

      if (walletProvider && currentAddress) {
        const ethersProvider = new BrowserProvider(walletProvider as any);
        const balanceVal = await ethersProvider.getBalance(currentAddress);
        const formattedBalance = formatEther(balanceVal);
        this.balance.set(parseFloat(formattedBalance).toFixed(4));

        const network = await ethersProvider.getNetwork();
        const id = Number(network.chainId);
        this.checkAndUpdateNetworkState(id, false);
      } else if (currentAddress) {
        const readonlyProvider = this.getReadonlyProvider();
        const balanceVal = await readonlyProvider.getBalance(currentAddress);
        const formattedBalance = formatEther(balanceVal);
        this.balance.set(parseFloat(formattedBalance).toFixed(4));
      }
    } catch (error) {
      console.error('[Web3] Error updating balance or network:', error);
    }
  }

  public async connect() {
    if (!this.isEnabled) return;

    if (this.isConnected() && this.address()) {
      this.closeConnectModalIfOpen();
      return;
    }

    try {
      const targetChainIdNum = Number(this.configuredChainId() || '42161');
      this.targetChainBeforeConnect = targetChainIdNum;

      const targetNetwork = this.supportedChains.find(chain => Number(chain.id) === targetChainIdNum);
      if (targetNetwork) {
        try {
          ChainController.setActiveCaipNetwork(targetNetwork as any);
        } catch (e) { }
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('@appkit/active_caip_network_id', `eip155:${targetChainIdNum}`);
          localStorage.setItem('@appkit/active_namespace', 'eip155');
        }
      }

      if (this.modal && targetNetwork) {
        try {
          await this.modal.switchNetwork(targetNetwork as any);
        } catch (e) { }
      }

      await this.modal.open();
    } catch (error: any) {
      this.targetChainBeforeConnect = null;
      console.error('[Web3] Wallet connection error:', error);
      if (error?.message?.includes('declined') || error?.message?.includes('active')) {
        try {
          await this.modal.disconnect();
          await this.modal.open();
        } catch (e) { }
      }
    }
  }

  public async openNetworkModal() {
    if (!this.isEnabled) return;
    try {
      await this.modal.open({ view: 'Networks' });
    } catch (error) {
      console.error('[Web3] Error opening network modal:', error);
    }
  }

  public async openAccountModal() {
    if (!this.isEnabled) return;
    try {
      await this.modal.open({ view: 'Account' });
    } catch (error) {
      console.error('[Web3] Error opening account modal:', error);
    }
  }

  public async disconnect() {
    if (!this.isEnabled) return;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('angular_web3_last_address');
        localStorage.removeItem('angular_web3_was_connected');
      }
      this.address.set(null);
      this.isConnected.set(false);
      this.balance.set('0.0000');
      await this.modal.disconnect();
    } catch (error) {
      console.error('[Web3] Wallet disconnect error:', error);
    }
  }

  private async clearWalletConnectStorage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('wc@2') || key.startsWith('@w3m') || key.startsWith('@appkit'))) {
          if (key.includes('proposal') || key.includes('request') || key.includes('pending')) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) { }
  }

  private getAppKitNetworkByChainId(chainId: string | number): any {
    const id = chainId.toString().trim();
    switch (id) {
      case '1': return mainnet;
      case '56': return bsc;
      case '97': return bscTestnet;
      case '42161': return arbitrum;
      case '421614': return arbitrumSepolia;
      default: return arbitrum;
    }
  }

  public async addNetworkToWallet(chainId: number | string, provider?: any): Promise<boolean> {
    const walletProvider: any = provider || this.modal?.getWalletProvider() || (typeof window !== 'undefined' ? (window as any).ethereum : null);
    if (!walletProvider?.request) return false;

    const idNum = Number(chainId);
    const idStr = idNum.toString();
    const hexChainId = '0x' + idNum.toString(16);

    const chainInfo = this.POPULAR_CHAINS.find(c => c.chainId === idStr);
    if (!chainInfo) {
      console.warn(`[Web3] Network info not found in POPULAR_CHAINS for chainId: ${chainId}`);
      return false;
    }

    let symbol = 'ETH';
    let currencyName = 'Ether';
    if (idStr === '56' || idStr === '97') {
      symbol = 'BNB';
      currencyName = 'BNB';
    }

    const allUrls = getAllRpcUrls(idStr);
    const rpcList = allUrls.length > 0 ? allUrls : [chainInfo.rpcUrl];

    const params = {
      chainId: hexChainId,
      chainName: chainInfo.name,
      nativeCurrency: { name: currencyName, symbol: symbol, decimals: 18 },
      rpcUrls: rpcList,
      blockExplorerUrls: [chainInfo.explorerUrl]
    };

    try {
      await walletProvider.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      });
      return true;
    } catch (e) {
      console.warn('[Web3] Failed to add network to wallet:', e);
      return false;
    }
  }

  public syncDefaultChainToProvider(chainId: number | string): void {
    const walletProvider: any = this.modal?.getWalletProvider() || (typeof window !== 'undefined' ? (window as any).ethereum : null);
    if (!walletProvider) return;

    const idNum = Number(chainId);
    if (!idNum) return;
    const caipChainId = `eip155:${idNum}`;

    if (typeof walletProvider.setDefaultChain === 'function') {
      try {
        walletProvider.setDefaultChain(caipChainId);
        walletProvider.setDefaultChain(idNum.toString());
      } catch (e) {
        console.warn('[Web3] Error syncing default chain to provider:', e);
      }
    }
  }

  public formatWeb3Error(err: any): string {
    if (!err) return this.translationService.t('home.toast_tx_failed');

    const errStr = (typeof err === 'string' ? err : (err?.message || err?.reason || JSON.stringify(err))).toLowerCase();

    if (
      err?.code === 4001 ||
      err?.code === 'ACTION_REJECTED' ||
      errStr.includes('user rejected') ||
      errStr.includes('user cancelled') ||
      errStr.includes('transaction rejected')
    ) {
      return this.translationService.t('home.toast_tx_rejected');
    }

    if (
      err?.code === 5300 ||
      errStr.includes('5300') ||
      errStr.includes('invalid session properties') ||
      errStr.includes('session properties requested') ||
      errStr.includes('unsupported namespace')
    ) {
      return this.translationService.t('home.toast_session_sync_error');
    }

    if (
      err?.code === 'INSUFFICIENT_FUNDS' ||
      errStr.includes('insufficient funds') ||
      errStr.includes('exceeds balance')
    ) {
      return this.translationService.t('home.toast_insufficient_funds');
    }

    if (
      err?.code === 5201 ||
      errStr.includes('unknown method')
    ) {
      return this.translationService.t('home.toast_wallet_unsupported_chain_or_method');
    }

    if (errStr.includes('could not coalesce error')) {
      const msgMatch = err?.message?.match(/"message"\s*:\s*"([^"]+)"/);
      if (msgMatch && msgMatch[1]) {
        const innerMsg = msgMatch[1];
        if (innerMsg.toLowerCase().includes('invalid session properties')) {
          return this.translationService.t('home.toast_session_sync_error');
        }
        if (innerMsg.toLowerCase().includes('unknown method')) {
          return this.translationService.t('home.toast_wallet_unsupported_chain_or_method');
        }
        return innerMsg;
      }
    }

    return err?.reason || err?.shortMessage || err?.message || this.translationService.t('home.toast_tx_failed');
  }

  public async switchNetwork(chainId: number) {
    if (!this.isEnabled) return;

    const chainIdStr = chainId.toString();
    this.configuredChainId.set(chainIdStr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('angular_web3_configured_chain_id', chainIdStr);
      localStorage.setItem('@appkit/active_caip_network_id', `eip155:${chainIdStr}`);
      localStorage.setItem('@appkit/active_namespace', 'eip155');
    }

    const network = this.supportedChains.find(chain => Number(chain.id) === chainId);
    if (network) {
      try {
        ChainController.setActiveCaipNetwork(network as any);
      } catch (e) { }
    }

    this.syncDefaultChainToProvider(chainId);

    if (this.isConnected()) {
      try {
        const hexChainId = '0x' + Number(chainId).toString(16);
        const walletProvider: any = this.modal.getWalletProvider() || (typeof window !== 'undefined' ? (window as any).ethereum : null);

        if (walletProvider?.request) {
          try {
            await walletProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: hexChainId }]
            });
          } catch (switchErr: any) {
            const isUnrecognized =
              switchErr?.code === 4902 ||
              switchErr?.info?.error?.code === 4902 ||
              switchErr?.data?.originalError?.code === 4902 ||
              switchErr?.cause?.code === 4902 ||
              switchErr?.message?.toLowerCase().includes('unrecognized') ||
              switchErr?.message?.toLowerCase().includes('try adding the chain') ||
              switchErr?.message?.toLowerCase().includes('wallet_addethereumchain');

            if (isUnrecognized) {
              const added = await this.addNetworkToWallet(chainId, walletProvider);
              if (added) {
                try {
                  await walletProvider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: hexChainId }]
                  });
                } catch (e) { }
              }
            }
          }
        }

        const network = this.supportedChains.find(chain => Number(chain.id) === chainId);
        if (network) {
          try {
            await this.modal.switchNetwork(network as any);
          } catch (e) { }
        }
        this.syncDefaultChainToProvider(chainId);
      } catch (error: any) {
        console.warn('[Web3] Error switching to chain:', chainId, error);
      }
    } else {
      const popular = POPULAR_CHAINS.find(c => Number(c.chainId) === chainId);
      if (popular) {
        this.networkName.set(popular.name);
        const symbol = (popular as any).symbol || (popular.chainId === '56' ? 'BNB' : popular.chainId === '97' ? 'tBNB' : 'ETH');
        this.chainSymbol.set(symbol);
        this.toastService.showToast(this.translationService.t('showcase.web3_network_selected', { network: popular.name }), 'success');
      }

      if (this.modal) {
        const network = this.supportedChains.find(chain => Number(chain.id) === Number(chainId));
        if (network) {
          try {
            this.modal.switchNetwork(network as any);
          } catch (e) { }
        }
      }
    }
  }

  public async getWalletProviderWithRetry(maxWaitMs = 3000): Promise<any> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      let provider: any = null;
      if (this.modal) {
        try {
          provider = this.modal.getWalletProvider();
        } catch (e) { }
      }
      if (!provider && typeof window !== 'undefined' && (window as any).ethereum) {
        provider = (window as any).ethereum;
      }
      if (provider) return provider;
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
  }

  public parseProviderChainId(value: unknown): number | null {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string' || !value) return null;

    const parsed = value.toLowerCase().startsWith('0x')
      ? parseInt(value, 16)
      : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  public async ensureProviderChain(provider: any, targetChainId: number): Promise<void> {
    if (!provider || typeof provider.request !== 'function') {
      throw new Error('Wallet provider does not support EIP-1193 requests');
    }

    let activeChainId: number | null = null;
    try {
      activeChainId = this.parseProviderChainId(await provider.request({ method: 'eth_chainId' }));
    } catch (error) {
      console.warn('[Web3] Unable to read provider chain:', error);
    }

    if (activeChainId !== null && activeChainId !== targetChainId) {
      const chainIdHex = '0x' + targetChainId.toString(16);
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        });
      } catch (error: any) {
        const isNotAdded = error?.code === 4902 ||
          error?.info?.error?.code === 4902 ||
          error?.message?.toLowerCase().includes('unrecognized') ||
          error?.message?.toLowerCase().includes('add');

        if (!isNotAdded || !(await this.addNetworkToWallet(targetChainId, provider))) {
          throw error;
        }

        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        });
      }
    }

    const verifiedChainId = this.parseProviderChainId(
      await provider.request({ method: 'eth_chainId' })
    );
    if (verifiedChainId !== targetChainId) {
      throw new Error(`Wallet is on chain ${verifiedChainId ?? 'unknown'}, expected chain ${targetChainId}`);
    }

    this.checkAndUpdateNetworkState(targetChainId, false);
  }

  public async getSigner(targetChainIdParam?: number | string) {
    if (!this.isEnabled) throw new Error(this.translationService.t('showcase.web3_disabled'));
    const walletProvider: any = await this.getWalletProviderWithRetry(3000);
    if (!walletProvider) {
      throw new Error(this.translationService.t('showcase.web3_wallet_not_connected'));
    }

    const targetChainId = Number(targetChainIdParam || this.configuredChainId() || this.chainId() || 42161);
    this.syncDefaultChainToProvider(targetChainId);

    const ethersProvider = new BrowserProvider(walletProvider as any);
    const currentAddress = this.address();
    const originalSend = ethersProvider.send.bind(ethersProvider);

    ethersProvider.send = async (method: string, params: any[]) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
        if (currentAddress) {
          return [currentAddress];
        }
      }
      return await originalSend(method, params);
    };

    return await ethersProvider.getSigner();
  }

  public async sendNativeTransaction(to: string, amountEth: string, targetChainId?: number): Promise<{ hash: string }> {
    const userAddress = this.address();
    if (!userAddress) {
      throw new Error(this.translationService.t('showcase.web3_wallet_not_connected'));
    }

    const chainId = Number(targetChainId || this.configuredChainId() || this.chainId() || 42161);
    const walletProvider = await this.getWalletProviderWithRetry(3000);
    if (!walletProvider) {
      throw new Error('Wallet provider is not available');
    }

    await this.ensureProviderChain(walletProvider, chainId);

    const valBigInt = parseEther(amountEth);
    const valHex = '0x' + valBigInt.toString(16);

    const txParams: any = {
      from: userAddress,
      to,
      value: valHex,
      data: '0x'
    };

    if (chainId === 56 || chainId === 97) {
      txParams.gas = '0x5208';
    }

    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    });

    return { hash: txHash };
  }

  public getReadonlyProvider(chainId?: number | string): JsonRpcProvider {
    const targetChainId = (chainId || this.configuredChainId() || '42161').toString();
    const rpcUrls = getAllRpcUrls(targetChainId);
    const primaryUrl = rpcUrls[0] || environment.defaultRpcUrl;
    return new JsonRpcProvider(primaryUrl);
  }

  public getProvider(): BrowserProvider | JsonRpcProvider {
    if (!this.isEnabled) throw new Error(this.translationService.t('showcase.web3_disabled'));
    const walletProvider = this.modal?.getWalletProvider();
    if (walletProvider) {
      return new BrowserProvider(walletProvider as any);
    }
    return this.getReadonlyProvider();
  }

  public async getGasOverrides(signer?: any, targetChainIdParam?: number | string): Promise<any> {
    const overrides: any = {};
    try {
      const targetChainId = Number(targetChainIdParam || this.configuredChainId() || this.chainId() || 42161);
      const isBscChain = targetChainId === 56 || targetChainId === 97;
      let currentSigner = signer;
      if (!currentSigner) {
        currentSigner = await this.getSigner(targetChainId);
      }
      const provider = currentSigner?.provider;
      if (!provider) return overrides;

      const feeData = await provider.getFeeData();
      const speed = this.txSpeed();
      const multiplier = speed === 'fast' ? 1.5 : (speed === 'custom' ? this.gasMultiplier() : 1.0);
      const factor = BigInt(Math.round(multiplier * 100));

      if (isBscChain) {
        overrides.type = 0;
        let baseGasPrice = feeData.gasPrice || 3000000000n;
        if (targetChainId === 97 && baseGasPrice < 3000000000n) {
          baseGasPrice = 3000000000n;
        }
        overrides.gasPrice = (baseGasPrice * factor) / 100n;
        if (targetChainId === 97 && overrides.gasPrice < 3000000000n) {
          overrides.gasPrice = 3000000000n;
        }
        delete overrides.maxFeePerGas;
        delete overrides.maxPriorityFeePerGas;
      } else {
        if (speed !== 'default') {
          if (feeData.maxFeePerGas) {
            overrides.maxFeePerGas = (feeData.maxFeePerGas * factor) / 100n;
            if (feeData.maxPriorityFeePerGas) {
              overrides.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * factor) / 100n;
            }
            delete overrides.gasPrice;
          } else if (feeData.gasPrice) {
            overrides.gasPrice = (feeData.gasPrice * factor) / 100n;
            delete overrides.maxFeePerGas;
            delete overrides.maxPriorityFeePerGas;
          }
        }
      }
    } catch (err) {
      console.warn('[Web3] Unable to fetch fee data for gas overrides:', err);
    }
    return overrides;
  }

  public async executeContractTx(
    txPromiseOrFn: Promise<any> | ((overrides: any) => Promise<any>),
    options?: ExecuteTxOptions
  ): Promise<any> {
    try {
      const targetChainId = options?.chainId ? Number(options.chainId) : (this.configuredChainId() ? Number(this.configuredChainId()) : null);
      if (targetChainId && this.isConnected()) {
        this.syncDefaultChainToProvider(targetChainId);
        const walletProvider = await this.getWalletProviderWithRetry(2000);
        if (walletProvider) {
          try {
            await this.ensureProviderChain(walletProvider, targetChainId);
          } catch (chainErr) {
            console.warn('[Web3] ensureProviderChain warning in executeContractTx:', chainErr);
          }
        }
      }

      let txPromise: Promise<any>;
      if (typeof txPromiseOrFn === 'function') {
        const overrides = await this.getGasOverrides(undefined, targetChainId || undefined);
        txPromise = txPromiseOrFn(overrides);
      } else {
        txPromise = txPromiseOrFn;
      }

      const tx = await txPromise;
      const txHash = tx?.hash || (typeof tx === 'string' ? tx : null);

      if (txHash) {
        this.modalService.showTransactionSuccess({
          txHash,
          title: options?.title || this.translationService.t('showcase.tx_modal_title'),
          subtitle: options?.subtitle || this.translationService.t('showcase.tx_modal_subtitle'),
          amount: options?.amount,
          symbol: options?.symbol || this.chainSymbol() || 'ETH',
          toAddress: options?.toAddress,
          confirmText: options?.confirmText,
          chainId: this.chainId(),
          networkName: this.networkName(),
        });
      }

      if (tx && typeof tx.wait === 'function') {
        tx.wait().then(async (receipt: any) => {
          if (receipt && receipt.status === 1) {
            await this.updateBalanceAndNetwork();
            this.toastService.showToast(
              this.translationService.t('home.toast_tx_confirmed'),
              'success'
            );
            options?.onSuccess?.(receipt);
          }
        }).catch((waitErr: any) => {
          console.warn('[Web3] Error background waiting for tx receipt:', waitErr);
        });
      } else if (txHash) {
        const provider = this.getReadonlyProvider(targetChainId || undefined);
        provider.waitForTransaction(txHash).then(async (receipt: any) => {
          if (receipt && receipt.status === 1) {
            await this.updateBalanceAndNetwork();
            this.toastService.showToast(
              this.translationService.t('home.toast_tx_confirmed'),
              'success'
            );
            options?.onSuccess?.(receipt);
          }
        }).catch((waitErr: any) => {
          console.warn('[Web3] Error background waiting for tx receipt by hash:', waitErr);
        });
      }

      return tx;
    } catch (err: any) {
      console.error('[Web3] Error executing contract transaction:', err);
      const errMsg = this.formatWeb3Error(err);
      this.toastService.showToast(errMsg, 'error');
      options?.onError?.(err);
      throw err;
    }
  }
}
