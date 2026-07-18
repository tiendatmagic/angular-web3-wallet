import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CustomSwitchComponent } from '@shared/components/custom-switch/custom-switch.component';
import { CustomRadioComponent } from '@shared/components/custom-radio/custom-radio.component';
import { CustomSearchInputComponent } from '@shared/components/custom-search-input/custom-search-input.component';
import { CustomSelectComponent } from '@shared/components/custom-select/custom-select.component';
import { CustomCheckboxComponent } from '@shared/components/custom-checkbox/custom-checkbox.component';
import { CustomDatePickerComponent } from '@shared/components/custom-date-picker/custom-date-picker.component';
import { CustomDateTimeRangeComponent, DateTimeRangeValue } from '@shared/components/custom-date-time-range/custom-date-time-range.component';
import { CardComponent } from '@shared/components/card/card.component';
import { CustomInputComponent } from '@shared/components/custom-input/custom-input.component';
import { AccordionComponent } from '@shared/components/accordion/accordion.component';
import { AccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { KbdComponent } from '@shared/components/kbd/kbd.component';
import { TooltipDirective } from '@shared/components/tooltip/tooltip.directive';
import { RippleDirective } from '@shared/components/ripple/ripple.directive';
import { CustomSliderComponent } from '@shared/components/custom-slider/custom-slider.component';
import { TabGroupComponent, TabOption } from '@shared/components/tab-group/tab-group.component';
import { StateService } from '@core/services/state.service';
import { ModalService } from '@core/services/modal.service';
import { DemoModalComponent } from './components/demo-modal/demo-modal.component';
import { AuraComponent } from '@shared/components/aura/aura.component';
import { TableComponent, TableCellDirective, TableColumn } from '@shared/components/table/table.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { parseEther } from 'ethers';

@Component({
  selector: 'app-home',
  
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    CustomSwitchComponent,
    CustomRadioComponent,
    CustomSearchInputComponent,
    CustomSelectComponent,
    CustomCheckboxComponent,
    CustomDatePickerComponent,
    CustomDateTimeRangeComponent,
    CardComponent,
    CustomInputComponent,
    BadgeComponent,
    AccordionComponent,
    AccordionItemComponent,
    KbdComponent,
    TooltipDirective,
    TabGroupComponent,
    CustomSliderComponent,
    RippleDirective,
    AuraComponent,
    TableComponent,
    TableCellDirective,
    PaginationComponent,
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  public stateService = inject(StateService);
  private readonly modalService = inject(ModalService);
  public readonly today = CustomDatePickerComponent.todayString();
  public readonly Math = Math;
  
  public toAddress = signal('');
  public amount = signal('');
  public txHash = signal<string | null>(null);
  public txLoading = signal(false);
  public txError = signal<string | null>(null);

  public messageToSign = signal('Chào mừng bạn đến với Angular Web3!');
  public signature = signal<string | null>(null);
  public signLoading = signal(false);
  public signError = signal<string | null>(null);

  public demoSwitchChecked = signal(true);
  public demoSwitchFull = signal(false);
  public demoRadioValue = signal('arbitrum');
  public demoCheckboxValue = signal(true);
  public demoSearchQuery = signal('');
  public demoSelectValue = signal<string | null>(null);
  public demoSelectTenChainsValue = signal<string | null>(null);
  public demoDatePickerValue = signal('2026-07-10');
  public limitDatePicker = signal(false);
  public demoDatePickerMinDate = signal('2026-07-20');
  public demoDatePickerShowPresets = signal(true);
  public demoAccordionMultiple = signal(false);

  public demoRangeValue = signal<DateTimeRangeValue>({ startDate: '2026-07-10', endDate: '2026-07-15' });
  public demoRangeWithTimeValue = signal<DateTimeRangeValue>({ startDate: '2026-07-10 09:00', endDate: '2026-07-12 18:30' });
  public demoRangeLimitValue = signal<DateTimeRangeValue>({ startDate: '2026-07-12', endDate: '2026-07-15' });

  public demoSliderVal1 = signal(60);
  public demoSliderVal2 = signal(30);

  public demoTabValue = signal('wallet');
  public readonly demoTabOptions: TabOption[] = [
    { value: 'wallet', label: 'Ví dApp', icon: 'wallet', badge: 3 },
    { value: 'history', label: 'Lịch sử', icon: 'link-chain' },
    { value: 'settings', label: 'Cấu hình', icon: 'bolt' }
  ];

  public demoProfileBirthday = signal('');
  public demoProfileGender = signal('male');
  public demoProfileWallet = signal('');
  public readonly genderOptions: TabOption[] = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
  ];

  public demoRippleCentered = signal(false);
  public demoRippleDisabled = signal(false);
  public demoRippleUnbounded = signal(false);
  public demoRippleColor = signal('');
  public demoRippleDuration = signal(700);
  public demoRippleOpacity = signal(0.4);
  public demoRippleCustomColor = signal('#ffffff');
  public demoAuraVariant = signal<'primary' | 'secondary' | 'dual' | 'rainbow' | 'holo' | 'gold' | 'silver' | 'glow'>('dual');
  public demoAuraSize = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  public demoAuraGlow = signal(true);
  public demoAuraPaused = signal(false);
  public demoAuraSpeed = signal('4s');
  public demoAuraRadius = signal('15px');

    public readonly demoChainOptions = [
    { value: '1',     label: 'Ethereum Mainnet' },
    { value: '42161', label: 'Arbitrum One' },
    { value: '56',    label: 'BNB Smart Chain' },
    { value: '421614',label: 'Arbitrum Sepolia' },
    { value: '97',    label: 'BSC Testnet' },
  ];

  public readonly demoTenChainOptions = [
    { value: '1',      label: 'Ethereum Mainnet' },
    { value: '42161',  label: 'Arbitrum One' },
    { value: '56',     label: 'BNB Smart Chain' },
    { value: '137',    label: 'Polygon PoS' },
    { value: '10',     label: 'Optimism' },
    { value: '8453',   label: 'Base' },
    { value: '43114',  label: 'Avalanche C-Chain' },
    { value: '59144',  label: 'Linea' },
    { value: '534352', label: 'Scroll' },
    { value: '250',    label: 'Fantom Opera' },
  ];

  public demoMultiSelectValue = signal<string[]>(['mushroom', 'onion']);
  public readonly demoMultiSelectOptions = [
    { id: 'cheese', name: 'Extra cheese' },
    { id: 'mushroom', name: 'Mushroom' },
    { id: 'onion', name: 'Onion' },
    { id: 'pepperoni', name: 'Pepperoni' },
    { id: 'sausage', name: 'Sausage' },
    { id: 'tomato', name: 'Tomato' }
  ];

  public readonly demoRadioOptions = [
    { value: 'arbitrum', label: 'Arbitrum One', description: 'Layer 2 - Phí thấp, tốc độ cao' },
    { value: 'ethereum', label: 'Ethereum',     description: 'Mainnet - Bảo mật cao nhất' },
    { value: 'bsc',      label: 'BNB Chain',    description: 'BSC - Phí cực rẻ' },
  ];

  public copyAddress(event: Event) {
    event.stopPropagation();
    const address = this.stateService.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.stateService.showToast('Đã sao chép địa chỉ ví vào clipboard!', 'success');
    }
  }

  public async sendTransaction() {
    const to = String(this.toAddress() || '').trim();
    const val = String(this.amount() || '').trim();

    if (!to || !val) {
      this.stateService.showToast(`Vui lòng điền đầy đủ địa chỉ nhận và số lượng ${this.stateService.chainSymbol()}.`, 'error');
      return;
    }

    this.txLoading.set(true);
    this.txHash.set(null);
    this.txError.set(null);
    this.stateService.showToast('Đang gửi yêu cầu giao dịch đến ví...', 'warning');

    try {
      const signer = await this.stateService.getSigner();
      
      const overrides = await this.stateService.getGasOverrides(signer);
      const txRequest: any = {
        to,
        value: parseEther(val),
        data: '0x',
        chainId: this.stateService.chainId() ? Number(this.stateService.chainId()) : undefined,
        ...overrides
      };

      const tx = await signer.sendTransaction(txRequest);
      
      this.txHash.set(tx.hash);
      this.stateService.showToast('Giao dịch đã được phát đi! Đang chờ xác nhận...', 'warning');
      await tx.wait();
      await this.stateService.web3Service.updateBalanceAndNetwork();
      this.stateService.showToast(`Giao dịch chuyển ${this.stateService.chainSymbol()} đã thành công!`, 'success');

      this.toAddress.set('');
      this.amount.set('');
    } catch (err: any) {
      console.error('Lỗi khi gửi giao dịch:', err);
      const errMsg = err.reason || err.message || 'Lỗi không xác định xảy ra.';
      this.txError.set(errMsg);
      this.stateService.showToast('Giao dịch thất bại: ' + errMsg, 'error');
    } finally {
      this.txLoading.set(false);
    }
  }

  public async signMessage() {
    const msg = String(this.messageToSign() || '').trim();
    if (!msg) {
      this.stateService.showToast('Vui lòng nhập nội dung tin nhắn cần ký.', 'error');
      return;
    }

    this.signLoading.set(true);
    this.signature.set(null);
    this.signError.set(null);
    this.stateService.showToast('Đang yêu cầu ký tin nhắn...', 'warning');

    try {
      const signer = await this.stateService.getSigner();
      const sig = await signer.signMessage(msg);
      this.signature.set(sig);
      this.stateService.showToast('Đã ký tin nhắn thành công!', 'success');
    } catch (err: any) {
      console.error('Lỗi khi ký tin nhắn:', err);
      const errMsg = err.message || 'Lỗi không xác định xảy ra khi ký.';
      this.signError.set(errMsg);
      this.stateService.showToast('Ký tin nhắn thất bại: ' + errMsg, 'error');
    } finally {
      this.signLoading.set(false);
    }
  }

  public copySignature() {
    if (this.signature()) {
      navigator.clipboard.writeText(this.signature()!);
      this.stateService.showToast('Đã sao chép chữ ký vào bộ nhớ tạm!', 'success');
    }
  }

  public openDemoModal(): void {
    const ref = this.modalService.open(DemoModalComponent, {
      title: 'Demo Form Components',
      size: 'xl',
      closeOnBackdropClick: true
    });

    ref.afterClosed$.subscribe(result => {
      if (result) {
        this.stateService.showToast(
          `Xác nhận form! Date: ${result.date || '(chưa chọn)'}, Select: ${result.select || '(chưa chọn)'}`,
          'success'
        );
      }
    });
  }

  // === DEMO TABLE STATE & LOGIC ===
  public readonly demoTableColumns: TableColumn[] = [
    { key: 'txHash', label: 'Mã Txn (Hash)', sortable: true },
    { key: 'method', label: 'Phương thức', sortable: true },
    { key: 'block', label: 'Khối', sortable: true, align: 'center' },
    { key: 'time', label: 'Thời gian', sortable: true },
    { key: 'from', label: 'Từ', sortable: false },
    { key: 'to', label: 'Đến', sortable: false },
    { key: 'value', label: 'Giá trị', sortable: true, align: 'right' },
    { key: 'status', label: 'Trạng thái', sortable: true, align: 'center' }
  ];

  public readonly tableStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'success', label: 'Thành công' },
    { value: 'pending', label: 'Đang chờ' },
    { value: 'failed', label: 'Thất bại' }
  ];

  public readonly demoTransactions = [
    { id: '1', txHash: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b', method: 'Transfer', block: 18459201, time: '2026-07-18 22:45', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0x3c494A5011111222223333344444555556666677', value: '1.45 ETH', status: 'success' },
    { id: '2', txHash: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e', method: 'Swap ETH For USDT', block: 18459215, time: '2026-07-18 22:38', from: '0x3c494A5011111222223333344444555556666677', to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', value: '0.85 ETH', status: 'success' },
    { id: '3', txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', method: 'Approve USDT', block: 18459242, time: '2026-07-18 22:20', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', value: '0.00 ETH', status: 'success' },
    { id: '4', txHash: '0x5c6d7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b', method: 'Add Liquidity', block: 18459290, time: '2026-07-18 22:15', from: '0x3c494A5011111222223333344444555556666677', to: '0xC0AEe478e230586714457e5b573aD33a0E8B0E8c', value: '5.00 ETH', status: 'pending' },
    { id: '5', txHash: '0x7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', method: 'Stake', block: 18459310, time: '2026-07-18 22:02', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', value: '10.0 ETH', status: 'success' },
    { id: '6', txHash: '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2', method: 'Unstake', block: 18459350, time: '2026-07-18 21:55', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', value: '4.20 ETH', status: 'failed' },
    { id: '7', txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c', method: 'Transfer', block: 18459392, time: '2026-07-18 21:30', from: '0x2222222222222222222222222222222222222222', to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', value: '0.05 ETH', status: 'success' },
    { id: '8', txHash: '0x8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e', method: 'Mint NFT', block: 18459410, time: '2026-07-18 21:12', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0x0483b0dfc6c78062b9e999a82ffb7959276814ee', value: '0.12 ETH', status: 'success' },
    { id: '9', txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a', method: 'Transfer', block: 18459455, time: '2026-07-18 20:50', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0x5555555555555555555555555555555555555555', value: '0.50 ETH', status: 'pending' },
    { id: '10', txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d5e', method: 'Swap USDT For LINK', block: 18459520, time: '2026-07-18 20:30', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', value: '250 USDT', status: 'success' },
    { id: '11', txHash: '0x0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', method: 'Borrow DAI', block: 18459601, time: '2026-07-18 19:40', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', value: '1000 DAI', status: 'success' },
    { id: '12', txHash: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d5e6f7a', method: 'Flash Loan', block: 18459670, time: '2026-07-18 19:15', from: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', to: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', value: '50000 USDC', status: 'failed' }
  ];

  public demoTableSearchQuery = signal('');
  public demoTableStatusFilter = signal<'all' | 'success' | 'pending' | 'failed'>('all');
  public demoTableLoading = signal(false);
  public demoTableEmpty = signal(false);
  public demoTableCurrentPage = signal(1);
  public readonly demoTableItemsPerPage = 5;

  public demoTableSortKey = signal<string>('time');
  public demoTableSortDirection = signal<'asc' | 'desc' | ''>('desc');

  public readonly filteredTransactions = computed(() => {
    if (this.demoTableEmpty()) return [];

    const search = this.demoTableSearchQuery().toLowerCase().trim();
    const filter = this.demoTableStatusFilter();

    return this.demoTransactions.filter(tx => {
      const matchSearch = !search ||
        tx.txHash.toLowerCase().includes(search) ||
        tx.method.toLowerCase().includes(search) ||
        tx.from.toLowerCase().includes(search) ||
        tx.to.toLowerCase().includes(search);

      const matchFilter = filter === 'all' || tx.status === filter;

      return matchSearch && matchFilter;
    });
  });

  public readonly sortedTransactions = computed(() => {
    const list = [...this.filteredTransactions()];
    const key = this.demoTableSortKey();
    const dir = this.demoTableSortDirection();

    if (key && dir) {
      list.sort((a: any, b: any) => {
        const valA = a[key];
        const valB = b[key];

        if (valA === undefined || valA === null) return dir === 'asc' ? 1 : -1;
        if (valB === undefined || valB === null) return dir === 'asc' ? -1 : 1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return dir === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        return dir === 'asc' 
          ? strA.localeCompare(strB, 'vi', { numeric: true }) 
          : strB.localeCompare(strA, 'vi', { numeric: true });
      });
    }
    return list;
  });

  public readonly paginatedTransactions = computed(() => {
    const list = this.sortedTransactions();
    const page = this.demoTableCurrentPage();
    const size = this.demoTableItemsPerPage;
    const startIndex = (page - 1) * size;
    return list.slice(startIndex, startIndex + size);
  });

  public readonly demoTableTotalPages = computed(() => {
    return Math.ceil(this.filteredTransactions().length / this.demoTableItemsPerPage) || 1;
  });

  public readonly demoTableTotalItems = computed(() => {
    return this.filteredTransactions().length;
  });

  public onSortChange(event: { key: string; direction: 'asc' | 'desc' | '' }): void {
    this.demoTableSortKey.set(event.key);
    this.demoTableSortDirection.set(event.direction);
    this.demoTableCurrentPage.set(1);
  }

  public onPageChange(page: number): void {
    this.demoTableCurrentPage.set(page);
  }

  public resetTableFilters(): void {
    this.demoTableSearchQuery.set('');
    this.demoTableStatusFilter.set('all');
    this.demoTableEmpty.set(false);
    this.demoTableLoading.set(false);
    this.demoTableCurrentPage.set(1);
  }
}
