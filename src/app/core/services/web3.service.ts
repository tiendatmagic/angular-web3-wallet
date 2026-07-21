import { Injectable, signal, inject, effect } from '@angular/core';
import { createAppKit, type AppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum, arbitrumSepolia, bsc, bscTestnet } from '@reown/appkit/networks';
import { ApiController } from '@reown/appkit-controllers';
import { BrowserProvider, formatEther } from 'ethers';
import { environment } from '@environments/environment';
import { ThemeService } from './theme.service';
import { ToastService } from './toast.service';
import { POPULAR_CHAINS } from '../utils/blockchain.utils';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private modal!: AppKit;

  public readonly isEnabled: boolean = environment.enableWeb3;

  public address = signal<string | null>(null);
  public chainId = signal<number | null>(null);
  public isConnected = signal<boolean>(false);
  public balance = signal<string>('0.0000');
  public chainSymbol = signal<string>('ETH');
  public networkName = signal<string>('Unknown Network');
  public isWrongChain = signal<boolean>(false);
  public txSpeed = signal<'default' | 'fast' | 'custom'>('default');
  public gasMultiplier = signal<number>(2);
  public showWrongChainModal = signal<boolean>(false);

  public readonly configuredChainId = signal<string>(
    (typeof window !== 'undefined' && localStorage.getItem('angular_web3_configured_chain_id')) || environment.defaultChainId || '42161'
  );

  public readonly POPULAR_CHAINS = POPULAR_CHAINS;

  public readonly supportedChains = [arbitrum, mainnet, bsc, arbitrumSepolia, bscTestnet].map(chain => {
    const popular = POPULAR_CHAINS.find(c => Number(c.chainId) === Number(chain.id));
    if (popular) {
      return {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          default: { http: [popular.rpcUrl] }
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

  constructor() {
    if (!this.isEnabled) {
      console.info('[Web3] Web3 đã bị tắt');
      return;
    }
    this.initAppKit();
    this.setupThemeSync();

    // Tự động cập nhật UI khi chưa kết nối ví dựa theo cấu hình mạng mong muốn
    effect(() => {
      const isConn = this.isConnected();
      const confId = this.configuredChainId();
      if (!isConn) {
        const popular = POPULAR_CHAINS.find(c => c.chainId === confId);
        this.networkName.set(popular ? popular.name : 'Unknown Network');
        const symbol = popular ? (popular.chainId === '56' || popular.chainId === '97' ? 'BNB' : 'ETH') : 'ETH';
        this.chainSymbol.set(symbol);
      }
    }, { allowSignalWrites: true });

    // Lưu cấu hình mạng mong muốn vào localStorage khi thay đổi
    effect(() => {
      const chain = this.configuredChainId();
      if (typeof window !== 'undefined' && chain) {
        localStorage.setItem('angular_web3_configured_chain_id', chain);
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
          console.warn('[Web3] Lỗi đồng bộ theme sang AppKit:', e);
        }
      }
    });
  }

  private async initAppKit() {
    if (typeof window === 'undefined') return;

    const projectId = environment.walletConnectProjectId;
    if (!projectId) {
      console.warn('[Web3] walletConnectProjectId is missing in environment configuration.');
      return;
    }

    // Nếu chưa đăng nhập, tự động dọn rác session/proposal treo cũ trong storage
    if (!this.isConnected()) {
      await this.clearWalletConnectStorage();
    }

    const isDark = this.themeService.isDarkMode();

    this.modal = createAppKit({
      adapters: [new EthersAdapter()],
      networks: this.supportedChains as any,
      defaultNetwork: this.supportedChains[0] as any,
      allowUnsupportedChain: true,
      metadata: {
        name: 'Angular Web3 DApp',
        description: 'Angular Web3 Application Framework',
        url: window.location.origin,
        icons: [window.location.origin + '/assets/logo.svg']
      },
      projectId,
      themeMode: isDark ? 'dark' : 'light',
      defaultAccountTypes: {
        eip155: 'smartAccount'
      },
      features: {
        analytics: false,
        reownAuthentication: false
      },
      enableCoinbase: false
    } as any);

    this.modal.subscribeAccount(async (accountState) => {
      const prevConnected = this.isConnected();
      this.address.set(accountState.address || null);
      this.isConnected.set(accountState.isConnected);

      if (accountState.isConnected && accountState.address) {
        await this.updateBalanceAndNetwork();
        const currentChainId = this.chainId();
        const targetChainId = Number(this.configuredChainId());

        if (currentChainId && currentChainId !== targetChainId) {
          // Tự động chuyển sang mạng mong muốn sau khi kết nối thành công để ví không bị lỗi treo unknown network lúc chưa connect
          setTimeout(async () => {
            await this.switchNetwork(targetChainId);
          }, 500);
        } else if (currentChainId) {
          this.checkAndUpdateNetworkState(currentChainId, false);
        }
      } else {
        this.balance.set('0.0000');
        this.chainId.set(null);
        this.networkName.set('Unknown Network');
        this.isWrongChain.set(false);
        this.showWrongChainModal.set(false);
        if (prevConnected) {
          this.toastService.showToast('Đã ngắt kết nối ví!', 'error');
        }
      }
    });

    this.modal.subscribeNetwork((networkState) => {
      if (networkState.chainId) {
        const id = Number(networkState.chainId);
        this.checkAndUpdateNetworkState(id, true);
      }

      if (this.isConnected()) {
        this.updateBalanceAndNetwork();
      }
    });

    this.modal.subscribeEvents(async (event: any) => {
      const eventName = event.data?.event;
      const errorMsg = event.data?.properties?.message || event.data?.error || '';
      const isConnectionError = eventName === 'CONNECT_ERROR' || errorMsg.toString().toLowerCase().includes('declined') || errorMsg.toString().toLowerCase().includes('active');
      
      if (isConnectionError) {
        console.warn('[Web3] Phát hiện lỗi kết nối hoặc treo session từ AppKit, tự động giải phóng...');
        try {
          await this.modal.disconnect();
          await this.clearWalletConnectStorage();
        } catch (e) {}
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
        this.toastService.showToast(`Đã chuyển sang mạng ${supportedChain.name}!`, 'success');
      }

      const isTestnet = !!supportedChain.testnet || supportedChain.name.toLowerCase().includes('sepolia') || supportedChain.name.toLowerCase().includes('testnet');
      if (isTestnet) {
        this.txSpeed.set('fast');
      } else {
        this.txSpeed.set('default');
      }
    } else {
      const popular = POPULAR_CHAINS.find(c => Number(c.chainId) === chainId);
      this.networkName.set(popular ? popular.name : 'Mạng không hỗ trợ');
      this.chainSymbol.set('ETH');

      if (this.isConnected()) {
        this.showWrongChainModal.set(true);
        if (showToastAlert && (!prevWrongChain || prevChainId !== chainId)) {
          this.toastService.showToast('Mạng hiện tại không được hỗ trợ!', 'error');
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
      const walletProvider = this.modal.getWalletProvider();
      const currentAddress = this.address();

      if (walletProvider && currentAddress) {
        const ethersProvider = new BrowserProvider(walletProvider as any);
        const balanceVal = await ethersProvider.getBalance(currentAddress);
        const formattedBalance = formatEther(balanceVal);
        this.balance.set(parseFloat(formattedBalance).toFixed(4));

        const network = await ethersProvider.getNetwork();
        const id = Number(network.chainId);
        this.checkAndUpdateNetworkState(id, false);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật số dư/mạng:', error);
    }
  }

  public async connect() {
    if (!this.isEnabled) return;
    try {
      const defaultChain = this.supportedChains.find(c => !(c as any).testnet && !c.name.toLowerCase().includes('sepolia') && !c.name.toLowerCase().includes('testnet')) || this.supportedChains[0];
      if (defaultChain) {
        try {
          await this.modal.switchNetwork(defaultChain as any);
        } catch (e) {
          console.warn('[Web3] Ép mạng mặc định trước khi mở modal thất bại:', e);
        }
      }

      // Ngắt kết nối phiên treo cũ nếu người dùng chưa kết nối active để tránh lỗi "Connection can be declined"
      if (!this.isConnected()) {
        try {
          await this.modal.disconnect();
        } catch (e) {}
      }
      await this.modal.open();
    } catch (error: any) {
      console.error('Lỗi kết nối ví:', error);
      // Nếu dính lỗi Connection declined do request cũ active, tự động ngắt phiên treo và mở lại
      if (error?.message?.includes('declined') || error?.message?.includes('active')) {
        try {
          await this.modal.disconnect();
          await this.modal.open();
        } catch (e) {}
      }
    }
  }

  public async openNetworkModal() {
    if (!this.isEnabled) return;
    try {
      await this.modal.open({ view: 'Networks' });
    } catch (error) {
      console.error('Lỗi mở popup chuyển mạng:', error);
    }
  }

  public async openAccountModal() {
    if (!this.isEnabled) return;
    try {
      await this.modal.open({ view: 'Account' });
    } catch (error) {
      console.error('Lỗi mở popup chi tiết ví:', error);
    }
  }

  public async disconnect() {
    if (!this.isEnabled) return;
    try {
      await this.modal.disconnect();
    } catch (error) {
      console.error('Lỗi ngắt kết nối ví:', error);
    }
  }

  /**
   * Tự động dọn dẹp dữ liệu kẹt trong IndexedDB & LocalStorage nếu chưa đăng nhập (Self-Healing)
   */
  private async clearWalletConnectStorage() {
    if (typeof window === 'undefined') return;

    try {
      if ('indexedDB' in window) {
        const dbs = (await indexedDB.databases?.()) || [];
        for (const db of dbs) {
          if (db.name && (db.name.includes('WALLET_CONNECT') || db.name.includes('walletconnect') || db.name.includes('reown') || db.name.includes('appkit'))) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }
    } catch (e) {
      console.warn('[Web3] Lỗi khi dọn dẹp IndexedDB:', e);
    }

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
    } catch (e) {}
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

  public async addNetworkToWallet(chainId: number | string): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).ethereum) return false;
    const idNum = Number(chainId);
    const idStr = idNum.toString();
    const hexChainId = '0x' + idNum.toString(16);

    const chainInfo = this.POPULAR_CHAINS.find(c => c.chainId === idStr);
    if (!chainInfo) {
      console.warn(`[Web3] Không tìm thấy thông tin mạng trong POPULAR_CHAINS cho chainId: ${chainId}`);
      return false;
    }

    let symbol = 'ETH';
    let currencyName = 'Ether';
    if (idStr === '56' || idStr === '97') {
      symbol = 'BNB';
      currencyName = 'BNB';
    }

    const params = {
      chainId: hexChainId,
      chainName: chainInfo.name,
      nativeCurrency: { name: currencyName, symbol: symbol, decimals: 18 },
      rpcUrls: [chainInfo.rpcUrl],
      blockExplorerUrls: [chainInfo.explorerUrl]
    };

    try {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      });
      return true;
    } catch (e) {
      console.warn('[Web3] Thêm mạng vào ví thất bại:', e);
      return false;
    }
  }

  public async switchNetwork(chainId: number) {
    if (!this.isEnabled) return;

    const chainIdStr = chainId.toString();
    this.configuredChainId.set(chainIdStr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('angular_web3_configured_chain_id', chainIdStr);
    }

    if (this.isConnected()) {
      try {
        const network = this.supportedChains.find(chain => Number(chain.id) === chainId);
        if (network) {
          try {
            await this.modal.switchNetwork(network as any);
          } catch (switchErr: any) {
            console.warn(`[Web3] AppKit switchNetwork thất bại cho chain ${chainId}, thử addNetworkToWallet:`, switchErr);
            const added = await this.addNetworkToWallet(chainId);
            if (added) {
              await this.modal.switchNetwork(network as any);
            } else {
              throw switchErr;
            }
          }
        } else {
          console.warn(`[Web3] Mạng với chainId ${chainId} không được hỗ trợ để chuyển.`);
        }
      } catch (error) {
        console.error(`Lỗi chuyển mạng ${chainId}:`, error);
      }
    } else {
      const popular = POPULAR_CHAINS.find(c => Number(c.chainId) === chainId);
      if (popular) {
        this.networkName.set(popular.name);
        this.toastService.showToast(`Đã chọn mạng mong muốn: ${popular.name}`, 'success');
      }
    }
  }

  public async getSigner() {
    if (!this.isEnabled) throw new Error('Web3 đã bị tắt. Bật lại environment.enableWeb3 = true.');
    const walletProvider = this.modal.getWalletProvider();
    if (!walletProvider) {
      throw new Error('Ví chưa được kết nối');
    }
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

  public getProvider() {
    if (!this.isEnabled) throw new Error('Web3 đã bị tắt. Bật lại environment.enableWeb3 = true.');
    const walletProvider = this.modal.getWalletProvider();
    if (!walletProvider) {
      throw new Error('Ví chưa được kết nối');
    }
    return new BrowserProvider(walletProvider as any);
  }

  public async getGasOverrides(signer?: any): Promise<any> {
    const overrides: any = {};
    try {
      let currentSigner = signer;
      if (!currentSigner) {
        currentSigner = await this.getSigner();
      }
      const provider = currentSigner.provider;
      if (!provider) return overrides;

      const feeData = await provider.getFeeData();
      const speed = this.txSpeed();
      if (speed !== 'default') {
        const multiplier = speed === 'fast' ? 1.5 : this.gasMultiplier();
        if (feeData.maxFeePerGas) {
          overrides.maxFeePerGas = (feeData.maxFeePerGas * BigInt(Math.round(multiplier * 100))) / 100n;
        }
        if (feeData.maxPriorityFeePerGas) {
          overrides.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * BigInt(Math.round(multiplier * 100))) / 100n;
        }
      }
    } catch (err) {
      console.warn('[Web3] Không thể lấy fee data để tính gas overrides:', err);
    }
    return overrides;
  }
}
