import { Component, computed, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '@core/services/web3.service';
import { ThemeService } from '@core/services/theme.service';
import { ToastService } from '@core/services/toast.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ThemeSwitcherComponent } from '@shared/components/theme-switcher/theme-switcher.component';
import { TxSpeedSelectorComponent } from '@shared/components/tx-speed-selector/tx-speed-selector.component';
import { POPULAR_CHAINS } from '../../../core/utils/blockchain.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    IconComponent, 
    ButtonComponent, 
    RouterModule, 
    FormsModule,
    LogoComponent,
    ThemeSwitcherComponent,
    TxSpeedSelectorComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public web3Service = inject(Web3Service);
  public themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  
  // Trạng thái hiển thị menu thả xuống (Dropdown) của ví
  public showDropdown = signal(false);
  
  // Trạng thái hiển thị menu chọn mạng nhanh
  public showNetworkDropdown = signal(false);
  
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
    this.showNetworkDropdown.set(false);
  }

  // Toggle trạng thái hiển thị dropdown mạng nhanh
  public toggleNetworkDropdown(event: Event) {
    event.stopPropagation();
    this.showNetworkDropdown.update(prev => !prev);
    this.showDropdown.set(false);
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

    // Lấy Explorer URL động từ cấu hình POPULAR_CHAINS
    const activeChain = POPULAR_CHAINS.find(c => Number(c.chainId) === Number(chainId));
    const explorerUrl = activeChain ? activeChain.explorerUrl : 'https://etherscan.io';

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
    this.showNetworkDropdown.set(false);
  }
}
