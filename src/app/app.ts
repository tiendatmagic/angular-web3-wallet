import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { Web3Service } from '@core/services/web3.service';
import { ToastService } from '@core/services/toast.service';
import { parseEther } from 'ethers';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, ToastComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public web3Service = inject(Web3Service);
  private toastService = inject(ToastService);
  
  // Trạng thái Form Gửi ETH Demo
  public toAddress = signal('');
  public amount = signal('');
  public txHash = signal<string | null>(null);
  public txLoading = signal(false);
  public txError = signal<string | null>(null);

  // Trạng thái Form Ký tin nhắn Demo
  public messageToSign = signal('Chào mừng bạn đến với ProofRandom Web3 DApp!');
  public signature = signal<string | null>(null);
  public signLoading = signal(false);
  public signError = signal<string | null>(null);

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
    const to = this.toAddress().trim();
    const val = this.amount().trim();

    if (!to || !val) {
      this.toastService.showToast('Vui lòng điền đầy đủ địa chỉ nhận và số lượng ETH.', 'error');
      return;
    }

    this.txLoading.set(true);
    this.txHash.set(null);
    this.txError.set(null);
    this.toastService.showToast('Đang gửi yêu cầu giao dịch đến ví...', 'success');

    try {
      const signer = await this.web3Service.getSigner();
      
      // Thực hiện gửi giao dịch
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(val)
      });
      
      this.txHash.set(tx.hash);
      this.toastService.showToast('Giao dịch đã được phát đi! Đang chờ xác nhận...', 'success');
      
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
    const msg = this.messageToSign().trim();
    if (!msg) {
      this.toastService.showToast('Vui lòng nhập nội dung tin nhắn cần ký.', 'error');
      return;
    }

    this.signLoading.set(true);
    this.signature.set(null);
    this.signError.set(null);
    this.toastService.showToast('Đang yêu cầu ký tin nhắn...', 'success');

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
