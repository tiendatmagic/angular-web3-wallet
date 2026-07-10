import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CustomSwitchComponent } from '@shared/components/custom-switch/custom-switch.component';
import { CustomRadioComponent } from '@shared/components/custom-radio/custom-radio.component';
import { CustomSearchInputComponent } from '@shared/components/custom-search-input/custom-search-input.component';
import { CustomSelectComponent } from '@shared/components/custom-select/custom-select.component';
import { CardComponent } from '@shared/components/card/card.component';
import { Web3Service } from '@core/services/web3.service';
import { ToastService } from '@core/services/toast.service';
import { parseEther } from 'ethers';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    CustomSwitchComponent,
    CustomRadioComponent,
    CustomSearchInputComponent,
    CustomSelectComponent,
    CardComponent,
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  public web3Service = inject(Web3Service);
  private toastService = inject(ToastService);
  
  // Trạng thái Form Gửi ETH Demo
  public toAddress = signal('');
  public amount = signal('');
  public txHash = signal<string | null>(null);
  public txLoading = signal(false);
  public txError = signal<string | null>(null);

  // Trạng thái Form Ký tin nhắn Demo
  public messageToSign = signal('Chào mừng bạn đến với Angular Web3!');
  public signature = signal<string | null>(null);
  public signLoading = signal(false);
  public signError = signal<string | null>(null);

  // === DEMO STATE: UI Components Showcase ===
  public demoSwitchChecked = signal(true);
  public demoSwitchFull = signal(false);
  public demoRadioValue = signal('arbitrum');
  public demoSearchQuery = signal('');
  public demoSelectValue = signal<string | null>(null);

  /** Danh sách chain để demo custom-select */
  public readonly demoChainOptions = [
    { value: '1',     label: 'Ethereum Mainnet' },
    { value: '42161', label: 'Arbitrum One' },
    { value: '56',    label: 'BNB Smart Chain' },
    { value: '421614',label: 'Arbitrum Sepolia' },
    { value: '97',    label: 'BSC Testnet' },
  ];

  /** Danh sách radio options cho demo */
  public readonly demoRadioOptions = [
    { value: 'arbitrum', label: 'Arbitrum One', description: 'Layer 2 - Phí thấp, tốc độ cao' },
    { value: 'ethereum', label: 'Ethereum',     description: 'Mainnet - Bảo mật cao nhất' },
    { value: 'bsc',      label: 'BNB Chain',    description: 'BSC - Phí cực rẻ' },
  ];

  // Sao chép địa chỉ ví nhanh
  public copyAddress(event: Event) {
    event.stopPropagation();
    const address = this.web3Service.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.toastService.showToast('Đã sao chép địa chỉ ví vào clipboard!', 'success');
    }
  }

  // Gửi ETH thông qua Ethers v6 Signer
  public async sendTransaction() {
    const to = String(this.toAddress() || '').trim();
    const val = String(this.amount() || '').trim();

    if (!to || !val) {
      this.toastService.showToast('Vui lòng điền đầy đủ địa chỉ nhận và số lượng ETH.', 'error');
      return;
    }

    this.txLoading.set(true);
    this.txHash.set(null);
    this.txError.set(null);
    this.toastService.showToast('Đang gửi yêu cầu giao dịch đến ví...', 'warning');

    try {
      const signer = await this.web3Service.getSigner();
      
      // Thực hiện gửi giao dịch với cấu hình phí gas động
      const txRequest: any = {
        to,
        value: parseEther(val),
        data: '0x', // Đảm bảo trường data luôn là '0x' để tránh lỗi của một số ví di động như Trust Wallet
        chainId: this.web3Service.chainId() ? Number(this.web3Service.chainId()) : undefined
      };

      try {
        const provider = this.web3Service.getProvider();
        const feeData = await provider.getFeeData();
        const speed = this.web3Service.txSpeed();

        if (speed === 'fast') {
          if (feeData.maxFeePerGas) {
            txRequest.maxFeePerGas = (feeData.maxFeePerGas * 150n) / 100n;
          }
          if (feeData.maxPriorityFeePerGas) {
            txRequest.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * 150n) / 100n;
          }
        } else if (speed === 'custom') {
          const multiplier = this.web3Service.gasMultiplier() || 2.0;
          const multiplierBigInt = BigInt(Math.round(multiplier * 100));
          if (feeData.maxFeePerGas) {
            txRequest.maxFeePerGas = (feeData.maxFeePerGas * multiplierBigInt) / 100n;
          }
          if (feeData.maxPriorityFeePerGas) {
            txRequest.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * multiplierBigInt) / 100n;
          }
        }
      } catch (gasErr) {
        console.warn('[Web3] Không thể cấu hình phí gas nâng cao:', gasErr);
      }

      const tx = await signer.sendTransaction(txRequest);
      
      this.txHash.set(tx.hash);
      this.toastService.showToast('Giao dịch đã được phát đi! Đang chờ xác nhận...', 'warning');
      
      // Đợi giao dịch được khai thác trên mạng (mined) và cập nhật số dư mới
      await tx.wait();
      await this.web3Service.updateBalanceAndNetwork();
      this.toastService.showToast('Giao dịch chuyển ETH đã thành công!', 'success');
      
      // Reset form
      this.toAddress.set('');
      this.amount.set('');
    } catch (err: any) {
      console.error('Lỗi khi gửi giao dịch:', err);
      const errMsg = err.reason || err.message || 'Lỗi không xác định xảy ra.';
      this.txError.set(errMsg);
      this.toastService.showToast('Giao dịch thất bại: ' + errMsg, 'error');
    } finally {
      this.txLoading.set(false);
    }
  }

  // Ký tin nhắn bảo mật thông qua ví
  public async signMessage() {
    const msg = String(this.messageToSign() || '').trim();
    if (!msg) {
      this.toastService.showToast('Vui lòng nhập nội dung tin nhắn cần ký.', 'error');
      return;
    }

    this.signLoading.set(true);
    this.signature.set(null);
    this.signError.set(null);
    this.toastService.showToast('Đang yêu cầu ký tin nhắn...', 'warning');

    try {
      const signer = await this.web3Service.getSigner();
      const sig = await signer.signMessage(msg);
      this.signature.set(sig);
      this.toastService.showToast('Đã ký tin nhắn thành công!', 'success');
    } catch (err: any) {
      console.error('Lỗi khi ký tin nhắn:', err);
      const errMsg = err.message || 'Lỗi không xác định xảy ra khi ký.';
      this.signError.set(errMsg);
      this.toastService.showToast('Ký tin nhắn thất bại: ' + errMsg, 'error');
    } finally {
      this.signLoading.set(false);
    }
  }

  // Sao chép chữ ký vào Clipboard
  public copySignature() {
    if (this.signature()) {
      navigator.clipboard.writeText(this.signature()!);
      this.toastService.showToast('Đã sao chép chữ ký vào bộ nhớ tạm!', 'success');
    }
  }
}
