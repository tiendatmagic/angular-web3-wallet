import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/layout/header/header.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { SidebarComponent } from '@shared/layout/sidebar/sidebar.component';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
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

}

