import { Component, signal, inject, computed, effect } from '@angular/core';
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
import { CodeBlockComponent, CodeFile } from '@shared/components/code-block/code-block.component';
import { FileUploadComponent, UploadFileItem } from '@shared/components/file-upload/file-upload.component';
import { InputOtpComponent } from '@shared/components/input-otp/input-otp.component';
import { DropdownMenuComponent, DropdownMenuItem, DropdownMenuHeader } from '@shared/components/dropdown-menu/dropdown-menu.component';
import { VoiceChatComponent } from '@shared/components/dropdown-menu/voice-chat.component';
import { ProgressComponent, ProgressSegment } from '@shared/components/progress/progress.component';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { AvatarComponent, AvatarItem } from '@shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { DrawerComponent } from '@shared/components/drawer/drawer.component';
import { StepperComponent, StepItem } from '@shared/components/stepper/stepper.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { DividerComponent } from '@shared/components/divider/divider.component';
import { CopyToClipboardComponent } from '@shared/components/copy-to-clipboard/copy-to-clipboard.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
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
    TooltipDirective,
    TabGroupComponent,
    CustomSliderComponent,
    RippleDirective,
    AuraComponent,
    TableComponent,
    TableCellDirective,
    PaginationComponent,
    CodeBlockComponent,
    FileUploadComponent,
    InputOtpComponent,
    DropdownMenuComponent,
    VoiceChatComponent,
    ProgressComponent,
    LanguageSelectorComponent,
    AvatarComponent,
    EmptyStateComponent,
    AlertComponent,
    DrawerComponent,
    StepperComponent,
    StatCardComponent,
    BreadcrumbComponent,
    DividerComponent,
    CopyToClipboardComponent,
    TranslatePipe
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
  private readonly modalService = inject(ModalService);
  public readonly today = CustomDatePickerComponent.todayString();
  public readonly Math = Math;
  
  public toAddress = signal('');
  public amount = signal('');
  public txHash = signal<string | null>(null);
  public txLoading = signal(false);
  public txError = signal<string | null>(null);

  private defaultMessage = this.translationService.t('showcase.welcome_message');
  public messageToSign = signal(this.defaultMessage);
  private readonly syncDefaultMessage = effect(() => {
    this.translationService.currentLang();
    const translatedDefault = this.translationService.t('showcase.welcome_message');
    if (!this.messageToSign() || this.messageToSign() === this.defaultMessage) {
      this.messageToSign.set(translatedDefault);
    }
    this.defaultMessage = translatedDefault;
  });
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
  public demoDatePickerShowPresets = signal(false);
  public demoAccordionMultiple = signal(false);

  public demoRangeValue = signal<DateTimeRangeValue>({ startDate: '2026-07-10', endDate: '2026-07-15' });
  public demoRangeWithTimeValue = signal<DateTimeRangeValue>({ startDate: '2026-07-10 09:00', endDate: '2026-07-12 18:30' });
  public demoRangeLimitValue = signal<DateTimeRangeValue>({ startDate: '2026-07-12', endDate: '2026-07-15' });

  public demoSliderVal1 = signal(60);
  public demoSliderVal2 = signal(30);

  public demoFileUploadSingle = signal<UploadFileItem[]>([]);
  public demoFileUploadMulti = signal<UploadFileItem[]>([]);
  public demoFileUploadAvatar = signal<UploadFileItem[]>([]);

  public demoTabValue = signal('wallet');
  public readonly demoTabOptions = computed<TabOption[]>(() => {
    this.translationService.currentLang();
    return [
      { value: 'wallet', label: this.translationService.t('cards.selects.opt_wallet'), icon: 'wallet', badge: 3 },
      { value: 'history', label: this.translationService.t('cards.selects.opt_history'), icon: 'link-chain' },
      { value: 'settings', label: this.translationService.t('cards.selects.opt_settings'), icon: 'settings' }
    ];
  });

  public demoProfileBirthday = signal('');
  public demoProfileGender = signal('male');
  public demoProfileWallet = signal('');
  public readonly genderOptions = computed<TabOption[]>(() => {
    this.translationService.currentLang();
    return [
      { value: 'male', label: this.translationService.t('cards.inputs.male') },
      { value: 'female', label: this.translationService.t('cards.inputs.female') }
    ];
  });

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
  public readonly demoMultiSelectOptions = computed(() => {
    this.translationService.currentLang();
    return [
      { id: 'cheese', name: this.translationService.t('showcase.toppings_cheese') },
      { id: 'mushroom', name: this.translationService.t('showcase.toppings_mushroom') },
      { id: 'onion', name: this.translationService.t('showcase.toppings_onion') },
      { id: 'pepperoni', name: this.translationService.t('showcase.toppings_pepperoni') },
      { id: 'sausage', name: this.translationService.t('showcase.toppings_sausage') },
      { id: 'tomato', name: this.translationService.t('showcase.toppings_tomato') }
    ];
  });

  public readonly demoRadioOptions = computed(() => {
    this.translationService.currentLang();
    return [
      { value: 'arbitrum', label: 'Arbitrum One', description: this.translationService.t('cards.controls.radio_arb_desc') },
      { value: 'ethereum', label: 'Ethereum', description: this.translationService.t('cards.controls.radio_eth_desc') },
      { value: 'bsc', label: 'BNB Chain', description: this.translationService.t('cards.controls.radio_bsc_desc') }
    ];
  });

  public copyAddress(event: Event) {
    event.stopPropagation();
    const address = this.stateService.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.stateService.showToast(this.translationService.t('common.copied_to_clipboard'), 'success');
    }
  }

  public async sendTransaction() {
    const to = String(this.toAddress() || '').trim();
    const val = String(this.amount() || '').trim();

    if (!to || !val) {
      this.stateService.showToast(this.translationService.t('home.toast_enter_fields'), 'error');
      return;
    }

    this.txLoading.set(true);
    this.txHash.set(null);
    this.txError.set(null);
    this.stateService.showToast(this.translationService.t('home.toast_sending_tx'), 'warning');

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
      this.stateService.showToast(this.translationService.t('home.toast_tx_sent'), 'warning');
      await tx.wait();
      await this.stateService.web3Service.updateBalanceAndNetwork();
      this.stateService.showToast(this.translationService.t('home.toast_tx_success'), 'success');

      this.toAddress.set('');
      this.amount.set('');
    } catch (err: any) {
      console.error('Error sending transaction:', err);
      const errMsg = err.reason || err.message || 'Error occurred.';
      this.txError.set(errMsg);
      this.stateService.showToast(this.translationService.t('home.toast_tx_failed') + errMsg, 'error');
    } finally {
      this.txLoading.set(false);
    }
  }

  public async signMessage() {
    const msg = String(this.messageToSign() || '').trim();
    if (!msg) {
      this.stateService.showToast(this.translationService.t('home.toast_enter_msg'), 'error');
      return;
    }

    this.signLoading.set(true);
    this.signature.set(null);
    this.signError.set(null);
    this.stateService.showToast(this.translationService.t('home.toast_signing_msg'), 'warning');

    try {
      const signer = await this.stateService.getSigner();
      const sig = await signer.signMessage(msg);
      this.signature.set(sig);
      this.stateService.showToast(this.translationService.t('home.toast_signed_success'), 'success');
    } catch (err: any) {
      console.error('Error signing message:', err);
      const errMsg = err.message || 'Error occurred while signing.';
      this.signError.set(errMsg);
      this.stateService.showToast(this.translationService.t('home.toast_signing_failed') + errMsg, 'error');
    } finally {
      this.signLoading.set(false);
    }
  }

  public copySignature() {
    if (this.signature()) {
      navigator.clipboard.writeText(this.signature()!);
      this.stateService.showToast(this.translationService.t('home.toast_copied_sig'), 'success');
    }
  }

  public openDemoModal(): void {
    const ref = this.modalService.open(DemoModalComponent, {
      title: this.translationService.t('showcase.demo_form_components'),
      size: 'xl',
      closeOnBackdropClick: true
    });

    ref.afterClosed$.subscribe(result => {
      if (result) {
        this.stateService.showToast(
          this.translationService.t('showcase.modal_result', {
            date: result.date || this.translationService.t('showcase.not_selected'),
            select: result.select || this.translationService.t('showcase.not_selected')
          }),
          'success'
        );
      }
    });
  }

  public readonly demoTableColumns = computed<TableColumn[]>(() => {
    this.translationService.currentLang();
    return [
      { key: 'txHash', label: this.translationService.t('cards.table.col_tx'), sortable: true },
      { key: 'method', label: this.translationService.t('cards.table.col_method'), sortable: true },
      { key: 'block', label: this.translationService.t('cards.table.col_block'), sortable: true, align: 'center' },
      { key: 'time', label: this.translationService.t('cards.table.col_time'), sortable: true },
      { key: 'from', label: this.translationService.t('cards.table.col_from'), sortable: false },
      { key: 'to', label: this.translationService.t('cards.table.col_to'), sortable: false },
      { key: 'value', label: this.translationService.t('cards.table.col_value'), sortable: true, align: 'right' },
      { key: 'status', label: this.translationService.t('cards.table.col_status'), sortable: true, align: 'center' }
    ];
  });

  public readonly tableStatusOptions = computed(() => {
    this.translationService.currentLang();
    return [
      { value: 'all', label: this.translationService.t('cards.table.status_all') },
      { value: 'success', label: this.translationService.t('cards.table.status_success') },
      { value: 'pending', label: this.translationService.t('cards.table.status_pending') },
      { value: 'failed', label: this.translationService.t('cards.table.status_failed') }
    ];
  });

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

  public readonly demoSingleCode = `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-web3-connect',
  standalone: true,
  template: \`<button (click)="connect()">Connect Wallet</button>\`
})
export class Web3ConnectComponent {
  readonly isConnected = signal(false);

  async connect(): Promise<void> {
    console.log('Connecting to Web3 Wallet...');
    this.isConnected.set(true);
  }
}`;

  public readonly demoMultiCodeFiles: CodeFile[] = [
    {
      name: 'web3.service.ts',
      language: 'typescript',
      highlightLines: [4, 9],
      code: `import { Injectable, signal } from '@angular/core';
import { BrowserProvider, Signer } from 'ethers';

@Injectable({ providedIn: 'root' })
export class Web3Service {
  readonly account = signal<string | null>(null);
  readonly chainId = signal<number | null>(null);

  async connectWallet(): Promise<string> {
    if (!window.ethereum) throw new Error('No crypto wallet found');
    const provider = new BrowserProvider(window.ethereum);
    const signer: Signer = await provider.getSigner();
    const address = await signer.getAddress();
    this.account.set(address);
    return address;
  }
}`
    },
    {
      name: 'wallet.component.html',
      language: 'html',
      code: `<div class="wallet-card border rounded-xl p-4 bg-slate-900">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold">{{ 'wallet.dashboard_title' | translate }}</h3>
    <span class="badge text-xs bg-emerald-500/20 text-emerald-400">Connected</span>
  </div>
  <p class="mt-2 text-mono text-xs text-slate-400">{{ account() }}</p>
</div>`
    },
    {
      name: 'styles.scss',
      language: 'scss',
      code: `.wallet-card {
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}`
    }
  ];

  public readonly demoCollapsibleCode = `// Config script example
const web3Config = {
  appName: 'Angular Web3 Wallet',
  version: '2.5.0',
  networks: [
    { id: 1, name: 'Ethereum Mainnet', rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo' },
    { id: 42161, name: 'Arbitrum One', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
    { id: 56, name: 'BNB Smart Chain', rpcUrl: 'https://bsc-dataseed.binance.org' },
    { id: 137, name: 'Polygon PoS', rpcUrl: 'https://polygon-rpc.com' },
    { id: 10, name: 'Optimism', rpcUrl: 'https://mainnet.optimism.io' }
  ],
  tokens: [
    { symbol: 'ETH', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
    { symbol: 'USDT', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
    { symbol: 'USDC', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }
  ],
  features: {
    enableGasEstimator: true,
    enableTxHistory: true,
    enableNFTViewer: false
  }
};

export function getNetworkRpc(chainId: number): string {
  const net = web3Config.networks.find(n => n.id === chainId);
  return net ? net.rpcUrl : '';
}`;

  public readonly demoOtpStandard = signal<string>('582910');
  public readonly demoOtpPin = signal<string>('1234');
  public readonly demoOtpAlpha = signal<string>('WEB3W7');
  public readonly demoOtpError = signal<string>('888');
  public readonly demoOtpDisabled = signal<string>('999111');
  public readonly demoOtpMaskToggle = signal<boolean>(false);
  public readonly demoOtpCountdown = signal<number>(45);

  public resendOtpDemo(): void {
    this.demoOtpStandard.set('');
    this.demoOtpCountdown.set(60);
  }

  public readonly demoDropdownLastAction = signal<string>(this.translationService.t('cards.dropdown.no_action_yet'));
  public readonly demoVoiceMuted = signal<boolean>(false);
  public readonly demoVoiceDeafened = signal<boolean>(false);
  public readonly demoVoiceScreenSharing = signal<boolean>(false);
  public readonly demoVoiceConnected = signal<boolean>(true);

  private readonly syncDropdownLanguage = effect(() => {
    this.translationService.currentLang();
    this.demoDropdownLastAction.set(this.translationService.t('cards.dropdown.no_action_yet'));
  });

  public readonly demoProfileHeader: DropdownMenuHeader = {
    title: 'Nguyễn Tiến Đạt',
    subtitle: '0x71C...39A2 • tiendat.eth',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    statusBadge: 'PRO'
  };

  public readonly demoProfileMenuItems = computed<DropdownMenuItem[]>(() => {
    this.translationService.currentLang();
    return [
      { type: 'header', label: this.translationService.t('cards.dropdown.header_dapp') },
      { id: 'profile', label: this.translationService.t('cards.dropdown.profile'), icon: 'user' },
      { id: 'wallet', label: this.translationService.t('cards.dropdown.connected_wallet'), icon: 'wallet', badge: this.translationService.t('showcase.active'), badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' },
      { id: 'settings', label: this.translationService.t('cards.dropdown.system_settings'), icon: 'settings' },
      { id: 'keyboard', label: this.translationService.t('cards.dropdown.keyboard_shortcuts'), icon: 'keyboard' },
      { type: 'separator' },
      { type: 'header', label: this.translationService.t('cards.dropdown.header_services') },
      { id: 'pro', label: this.translationService.t('cards.dropdown.upgrade_vip'), icon: 'sparkles', iconColor: 'text-amber-500', badge: 'PRO', badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50' },
      { id: 'team', label: this.translationService.t('cards.dropdown.manage_members'), icon: 'user-plus' },
      { id: 'referral', label: this.translationService.t('cards.dropdown.invite_friends'), icon: 'gift' },
      { type: 'separator' },
      { id: 'help', label: this.translationService.t('cards.dropdown.help_center'), icon: 'life-buoy' },
      { id: 'github', label: this.translationService.t('cards.dropdown.github_source'), icon: 'github' },
      { type: 'separator' },
      { id: 'logout', label: this.translationService.t('cards.dropdown.logout'), icon: 'logout', variant: 'danger' }
    ];
  });

  public readonly demoDisplayMenuItems = computed<DropdownMenuItem[]>(() => {
    this.translationService.currentLang();
    return [
      { type: 'header', label: this.translationService.t('cards.dropdown.header_ui') },
      { id: 'show-sidebar', label: this.translationService.t('cards.dropdown.show_sidebar'), type: 'checkbox', checked: true },
      { id: 'show-chart', label: this.translationService.t('cards.dropdown.show_chart'), type: 'checkbox', checked: false },
      { id: 'show-tx', label: this.translationService.t('cards.dropdown.tx_notif'), type: 'checkbox', checked: true },
      { type: 'separator' },
      { type: 'header', label: this.translationService.t('cards.dropdown.header_layout') },
      { id: 'layout-grid', label: this.translationService.t('cards.dropdown.grid_view'), type: 'radio', radioValue: 'grid' },
      { id: 'layout-list', label: this.translationService.t('cards.dropdown.list_view'), type: 'radio', radioValue: 'list' },
      { id: 'layout-compact', label: this.translationService.t('cards.dropdown.compact_view'), type: 'radio', radioValue: 'compact' }
    ];
  });

  public readonly demoWeb3ActionItems = computed<DropdownMenuItem[]>(() => {
    this.translationService.currentLang();
    return [
      { id: 'new-tx', label: this.translationService.t('cards.dropdown.new_tx'), icon: 'plus', iconColor: 'text-purple-500' },
      { id: 'copy-addr', label: this.translationService.t('cards.dropdown.copy_address'), icon: 'copy' },
      {
        id: 'share-wallet',
        label: this.translationService.t('cards.dropdown.share_wallet'),
        icon: 'share',
        type: 'sub',
        children: [
          { id: 'share-email', label: this.translationService.t('cards.dropdown.share_email'), icon: 'mail' },
          { id: 'share-qr', label: this.translationService.t('cards.dropdown.share_qr'), icon: 'qr-code' },
          { id: 'share-link', label: this.translationService.t('cards.dropdown.share_link'), icon: 'external-link' }
        ]
      },
      {
        id: 'permissions',
        label: this.translationService.t('cards.dropdown.permissions'),
        icon: 'shield',
        type: 'sub',
        children: [
          { id: 'perm-read', label: this.translationService.t('cards.dropdown.perm_read'), icon: 'eye' },
          { id: 'perm-multisig', label: this.translationService.t('cards.dropdown.perm_multisig'), icon: 'key' },
          { id: 'perm-admin', label: this.translationService.t('cards.dropdown.perm_admin'), icon: 'shield-check', iconColor: 'text-emerald-500' }
        ]
      },
      { type: 'separator' },
      { id: 'delete-cache', label: this.translationService.t('cards.dropdown.clear_cache'), icon: 'trash', variant: 'danger' }
    ];
  });

  public onDropdownSelect(item: DropdownMenuItem): void {
    const template = this.translationService.t('cards.dropdown.action_triggered');
    this.demoDropdownLastAction.set(template.replace('{label}', item.label || ''));
  }

  public readonly demoVoiceParticipants = computed(() => {
    this.translationService.currentLang();
    return [
      { id: '1', name: 'Nguyễn Tiến Đạt', role: this.translationService.t('showcase.role_host'), avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isSpeaking: true, isMuted: false },
      { id: '2', name: 'Elena Rostova', role: this.translationService.t('showcase.role_cohost'), avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', isSpeaking: false, isMuted: false },
      { id: '3', name: 'Marcus Vance', role: this.translationService.t('showcase.role_speaker'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', isSpeaking: false, isMuted: true },
      { id: '4', name: 'Sophia Chen', role: this.translationService.t('showcase.role_listener'), avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', isSpeaking: false, isMuted: true },
      { id: '5', name: 'Alexander Wright', role: this.translationService.t('showcase.role_listener'), avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', isSpeaking: false, isMuted: true },
      { id: '6', name: 'Liam Sterling', role: this.translationService.t('showcase.role_listener'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', isSpeaking: false, isMuted: true },
      { id: '7', name: 'Chloe Bennett', role: this.translationService.t('showcase.role_listener'), avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', isSpeaking: false, isMuted: true }
    ];
  });

  public toggleVoiceMic(): void {
    this.demoVoiceMuted.update(v => !v);
    const stateKey = this.demoVoiceMuted() ? 'cards.voice_chat.mic_muted' : 'cards.voice_chat.mic_unmuted';
    this.stateService.showToast(`${this.translationService.t('showcase.voice_chat')}: ${this.translationService.t(stateKey)}`, this.demoVoiceMuted() ? 'warning' : 'success');
  }

  public toggleVoiceSound(): void {
    this.demoVoiceDeafened.update(v => !v);
    const stateKey = this.demoVoiceDeafened() ? 'cards.voice_chat.deafened' : 'cards.voice_chat.undeafened';
    this.stateService.showToast(`${this.translationService.t('showcase.voice_chat')}: ${this.translationService.t(stateKey)}`, this.demoVoiceDeafened() ? 'warning' : 'success');
  }

  public toggleVoiceScreenShare(): void {
    this.demoVoiceScreenSharing.update(v => !v);
    const stateKey = this.demoVoiceScreenSharing() ? 'cards.voice_chat.sharing_screen' : 'cards.voice_chat.stopped_sharing';
    this.stateService.showToast(`${this.translationService.t('showcase.voice_chat')}: ${this.translationService.t(stateKey)}`, 'success');
  }

  public toggleVoiceConnection(): void {
    this.demoVoiceConnected.update(v => !v);
    const stateKey = this.demoVoiceConnected() ? 'cards.voice_chat.connected' : 'cards.voice_chat.disconnected';
    this.stateService.showToast(this.translationService.t(stateKey), this.demoVoiceConnected() ? 'success' : 'warning');
  }

  public readonly demoProgressValue = signal<number>(68);

  public readonly demoProgressSegments = computed<ProgressSegment[]>(() => {
    this.translationService.currentLang();
    return [
      { value: 40, color: 'bg-purple-500', label: this.translationService.t('showcase.dapps_data') },
      { value: 25, color: 'bg-emerald-500', label: this.translationService.t('showcase.tokens_segment') },
      { value: 15, color: 'bg-amber-500', label: this.translationService.t('showcase.nfts_segment') },
      { value: 20, color: 'bg-slate-300 dark:bg-slate-700', label: this.translationService.t('showcase.free_space') }
    ];
  });

  public adjustProgress(delta: number): void {
    this.demoProgressValue.update(v => Math.min(100, Math.max(0, v + delta)));
  }

  public readonly demoDrawerOpen = signal<boolean>(false);
  public readonly demoDrawerPosition = signal<'right' | 'left' | 'bottom'>('right');
  public readonly demoStepperActive = signal<number>(1);

  public readonly demoAvatarList: AvatarItem[] = [
    { name: 'Nguyễn Tiến Đạt', status: 'online', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Elena Rostova', status: 'online', src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    { name: 'Marcus Vance', status: 'busy', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Satoshi Nakamoto', status: 'offline' },
    { name: 'Vitalik Buterin', status: 'online' },
    { name: 'Alice Smith', status: 'away' }
  ];

  public readonly demoBreadcrumbItems = computed<BreadcrumbItem[]>(() => {
    this.translationService.currentLang();
    return [
      { label: this.translationService.t('showcase.breadcrumb_dashboard'), url: '/' },
      { label: this.translationService.t('showcase.breadcrumb_ui_kit'), url: '/' },
      { label: this.translationService.t('showcase.breadcrumb_new_components'), icon: 'sparkles' }
    ];
  });

  public readonly demoStepperSteps = computed<StepItem[]>(() => {
    this.translationService.currentLang();
    return [
      { label: this.translationService.t('showcase.step_approve'), subtitle: this.translationService.t('showcase.step_approve_description'), icon: 'key' },
      { label: this.translationService.t('showcase.step_deposit'), subtitle: this.translationService.t('showcase.step_deposit_description'), icon: 'wallet' },
      { label: this.translationService.t('showcase.step_mint'), subtitle: this.translationService.t('showcase.step_mint_description'), icon: 'sparkles' },
      { label: this.translationService.t('showcase.step_complete'), subtitle: this.translationService.t('showcase.step_complete_description') }
    ];
  });

  public openDemoDrawer(pos: 'right' | 'left' | 'bottom' = 'right'): void {
    this.demoDrawerPosition.set(pos);
    this.demoDrawerOpen.set(true);
  }
}

