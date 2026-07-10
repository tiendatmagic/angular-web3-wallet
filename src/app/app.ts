import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    ToastComponent,
    ModalComponent,
    IconComponent,
    ButtonComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public web3Service = inject(Web3Service);

  public switchNetwork(chainId: number) {
    this.web3Service.switchNetwork(chainId);
  }

  public disconnectWallet() {
    this.web3Service.disconnect();
    this.web3Service.showWrongChainModal.set(false);
  }

  public getChainColor(chainId: string | number): string {
    const id = chainId.toString().trim();
    switch (id) {
      case '1': return '#627EEA';
      case '42161': return '#00a3ff';
      case '56': return '#F3BA2F';
      case '421614': return '#5ba4cf';
      case '97': return '#e6a817';
      default: return '#94a3b8';
    }
  }
}

