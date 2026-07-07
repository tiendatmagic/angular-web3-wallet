import { Component, computed, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '@core/services/web3.service';
import { ThemeService } from '@core/services/theme.service';
import { ToastService } from '@core/services/toast.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public web3Service = inject(Web3Service);
  public themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  
  // Trạng thái hiển thị menu thả xuống (Dropdown) của ví
  public showDropdown = signal(false);
  
  // Trạng thái hiển thị menu ngôn ngữ
  public showLangDropdown = signal(false);
  public currentLang = signal<'VI' | 'EN'>('VI');

  // Trạng thái hiển thị Mobile Menu
  public showMobileMenu = signal(false);

  // Rút gọn địa chỉ ví dạng 0x1234...5678
  public shortenedAddress = computed(() => {
    const address = this.web3Service.address();
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  });

  // Toggle trạng thái hiển thị dropdown ví
  public toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown.update(prev => !prev);
    this.showLangDropdown.set(false);
  }

  // Toggle trạng thái hiển thị dropdown ngôn ngữ
  public toggleLangDropdown(event: Event) {
    event.stopPropagation();
    this.showLangDropdown.update(prev => !prev);
    this.showDropdown.set(false);
  }

  // Chọn ngôn ngữ
  public selectLang(lang: 'VI' | 'EN') {
    this.currentLang.set(lang);
    this.showLangDropdown.set(false);
  }

  // Sao chép địa chỉ ví vào Clipboard và hiển thị Toast thay cho alert
  public copyAddress(event: Event) {
    event.stopPropagation();
    const address = this.web3Service.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.toastService.showToast('Đã sao chép địa chỉ ví vào bộ nhớ tạm!', 'success');
      this.showDropdown.set(false);
    }
  }

  // Xem thông tin ví trên Blockchain Explorer tương ứng
  public viewOnExplorer(event: Event) {
    event.stopPropagation();
    const address = this.web3Service.address();
    const chainId = this.web3Service.chainId();
    if (!address) return;

    let explorerUrl = 'https://etherscan.io';
    
    // Ánh xạ URL Explorer theo chainId
    switch (chainId) {
      case 11155111: // Sepolia
        explorerUrl = 'https://sepolia.etherscan.io';
        break;
      case 421614: // Arbitrum Sepolia
        explorerUrl = 'https://sepolia.arbiscan.io';
        break;
      case 42161: // Arbitrum One
        explorerUrl = 'https://arbiscan.io';
        break;
      case 137: // Polygon Mainnet
        explorerUrl = 'https://polygonscan.com';
        break;
    }

    window.open(`${explorerUrl}/address/${address}`, '_blank');
    this.showDropdown.set(false);
  }

  // Ngắt kết nối ví
  public async disconnectWallet(event: Event) {
    event.stopPropagation();
    await this.web3Service.disconnect();
    this.showDropdown.set(false);
  }

  // Click ra ngoài để tự động đóng dropdowns
  @HostListener('document:click')
  public clickOut() {
    this.showDropdown.set(false);
    this.showLangDropdown.set(false);
  }
}
