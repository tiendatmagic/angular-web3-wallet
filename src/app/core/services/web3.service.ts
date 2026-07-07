import { Injectable, signal, inject, effect } from '@angular/core';
import { createAppKit, type AppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum, arbitrumSepolia, sepolia, polygon } from '@reown/appkit/networks';
import { BrowserProvider, formatEther } from 'ethers';
import { environment } from '@environments/environment';
import { ThemeService } from './theme.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private modal!: AppKit;

  // Signals quản lý trạng thái ví
  public address = signal<string | null>(null);
  public chainId = signal<number | null>(null);
  public isConnected = signal<boolean>(false);
  public balance = signal<string>('0.0000');
  public networkName = signal<string>('Unknown Network');
  public isWrongChain = signal<boolean>(false);

  // Mạng được hỗ trợ
  public readonly supportedChains = [arbitrumSepolia, sepolia, mainnet, arbitrum, polygon];

  private readonly themeService = inject(ThemeService);
  private readonly toastService = inject(ToastService);

  constructor() {
    this.initAppKit();
    this.setupThemeSync();
  }

  // Tự động đồng bộ theme hệ thống/lựa chọn sang WalletConnect Modal
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

  private initAppKit() {
    // Đọc Project ID động từ environment
    const projectId = environment.walletConnectProjectId;

    const metadata = {
      name: 'Angular Web3 DApp',
      description: 'Angular Web3 Application Framework',
      url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    };

    // Khởi tạo AppKit ban đầu với theme mode tương ứng
    const isDark = this.themeService.isDarkMode();

    this.modal = createAppKit({
      adapters: [new EthersAdapter()],
      networks: this.supportedChains as any,
      metadata,
      projectId,
      themeMode: isDark ? 'dark' : 'light',
      features: {
        analytics: false
      }
    });

    // Lắng nghe sự thay đổi tài khoản
    this.modal.subscribeAccount(async (accountState) => {
      const prevConnected = this.isConnected();
      this.address.set(accountState.address || null);
      this.isConnected.set(accountState.isConnected);

      if (accountState.isConnected && accountState.address) {
        await this.updateBalanceAndNetwork();
        if (!prevConnected) {
          this.toastService.showToast('Kết nối ví thành công!', 'success');
        }
      } else {
        this.balance.set('0.0000');
        this.chainId.set(null);
        this.networkName.set('Unknown Network');
        this.isWrongChain.set(false);
        if (prevConnected) {
          this.toastService.showToast('Đã ngắt kết nối ví!', 'error');
        }
      }
    });

    // Lắng nghe sự thay đổi mạng lưới
    this.modal.subscribeNetwork((networkState) => {
      if (networkState.chainId) {
        const id = Number(networkState.chainId);
        const prevChainId = this.chainId();
        this.chainId.set(id);
        this.networkName.set(networkState.caipNetwork?.name || 'Unknown Network');

        // Kiểm tra xem mạng hiện tại có trong danh sách supported không
        const isSupported = this.supportedChains.some(
          chain => Number(chain.id) === id
        );
        this.isWrongChain.set(!isSupported);

        if (isSupported && prevChainId && prevChainId !== id) {
          this.toastService.showToast(`Đã chuyển sang mạng ${networkState.caipNetwork?.name || id}!`, 'success');
        } else if (!isSupported && this.isConnected()) {
          this.toastService.showToast('Mạng hiện tại không được hỗ trợ!', 'error');
        }
      }

      if (this.isConnected()) {
        this.updateBalanceAndNetwork();
      }
    });
  }

  // Cập nhật số dư và thông tin mạng thông qua Ethers BrowserProvider
  public async updateBalanceAndNetwork() {
    try {
      const walletProvider = this.modal.getWalletProvider();
      const currentAddress = this.address();

      if (walletProvider && currentAddress) {
        const ethersProvider = new BrowserProvider(walletProvider as any);
        const balanceVal = await ethersProvider.getBalance(currentAddress);
        const formattedBalance = formatEther(balanceVal);
        // Định dạng làm tròn 4 chữ số thập phân
        this.balance.set(parseFloat(formattedBalance).toFixed(4));

        const network = await ethersProvider.getNetwork();
        this.chainId.set(Number(network.chainId));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật số dư/mạng:', error);
    }
  }

  // Mở popup kết nối ví
  public async connect() {
    try {
      await this.modal.open();
    } catch (error) {
      console.error('Lỗi kết nối ví:', error);
    }
  }

  // Mở popup chuyển mạng
  public async openNetworkModal() {
    try {
      await this.modal.open({ view: 'Networks' });
    } catch (error) {
      console.error('Lỗi mở popup chuyển mạng:', error);
    }
  }

  // Ngắt kết nối ví
  public async disconnect() {
    try {
      await this.modal.disconnect();
    } catch (error) {
      console.error('Lỗi ngắt kết nối ví:', error);
    }
  }

  // Chuyển sang mạng cụ thể
  public async switchNetwork(chainId: number) {
    try {
      await this.modal.switchNetwork({ chainId } as any);
    } catch (error) {
      console.error(`Lỗi chuyển mạng ${chainId}:`, error);
    }
  }

  // Lấy Ethers Signer phục vụ giao dịch ghi
  public async getSigner() {
    const walletProvider = this.modal.getWalletProvider();
    if (!walletProvider) {
      throw new Error('Ví chưa được kết nối');
    }
    const ethersProvider = new BrowserProvider(walletProvider as any);
    return await ethersProvider.getSigner();
  }

  // Lấy Ethers Provider phục vụ giao dịch đọc
  public getProvider() {
    const walletProvider = this.modal.getWalletProvider();
    if (!walletProvider) {
      throw new Error('Ví chưa được kết nối');
    }
    return new BrowserProvider(walletProvider as any);
  }
}
