import { Component, inject, signal, computed } from '@angular/core';
import { DropdownMenuComponent, DropdownMenuItem, DropdownMenuHeader } from '@shared/components/dropdown-menu/dropdown-menu.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalRef } from '@core/services/modal-ref';
import { TranslationService } from '@core/services/translation.service';
import { CustomDatePickerComponent } from '@shared/components/custom-date-picker/custom-date-picker.component';
import { CustomSelectComponent } from '@shared/components/custom-select/custom-select.component';
import { CustomSwitchComponent } from '@shared/components/custom-switch/custom-switch.component';
import { CustomRadioComponent } from '@shared/components/custom-radio/custom-radio.component';
import { CustomCheckboxComponent } from '@shared/components/custom-checkbox/custom-checkbox.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CustomInputComponent } from '@shared/components/custom-input/custom-input.component';
import { AccordionComponent } from '@shared/components/accordion/accordion.component';
import { AccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { KbdComponent } from '@shared/components/kbd/kbd.component';
import { TooltipDirective } from '@shared/components/tooltip/tooltip.directive';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TabGroupComponent, TabOption } from '@shared/components/tab-group/tab-group.component';
import { CustomSliderComponent } from '@shared/components/custom-slider/custom-slider.component';
import { CustomDateTimeRangeComponent, DateTimeRangeValue } from '@shared/components/custom-date-time-range/custom-date-time-range.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-demo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomDatePickerComponent,
    CustomSelectComponent,
    CustomSwitchComponent,
    CustomRadioComponent,
    CustomCheckboxComponent,
    IconComponent,
    ButtonComponent,
    CustomInputComponent,
    AccordionComponent,
    AccordionItemComponent,
    KbdComponent,
    TooltipDirective,
    BadgeComponent,
    TabGroupComponent,
    CustomSliderComponent,
    CustomDateTimeRangeComponent,
    DropdownMenuComponent,
    TranslatePipe
  ],
  templateUrl: './demo-modal.component.html',
  host: {
    class: 'block'
  }
})
export class DemoModalComponent {
  private readonly modalRef = inject(ModalRef);
  private readonly translationService = inject(TranslationService);

  public modalDateValue = signal('');
  public modalRangeValue = signal<DateTimeRangeValue>({ startDate: '', endDate: '' });
  public modalSelectValue = signal<string | null>(null);
  public modalSwitchValue = signal(false);
  public modalRadioValue = signal('arbitrum');
  public modalCheckboxValue = signal(false);
  public modalSliderValue = signal(3);

  public modalDropdownLastAction = signal('');

  public modalTabValue = signal('bsc');
  public readonly modalTabOptions: TabOption[] = [
    { value: 'ethereum', label: 'Ethereum', dotClass: 'bg-blue-500' },
    { value: 'arbitrum', label: 'Arbitrum', dotClass: 'bg-indigo-500' },
    { value: 'bsc', label: 'BNB Chain', dotClass: 'bg-amber-500' }
  ];

  public readonly today = CustomDatePickerComponent.todayString();
  public limitDatePicker = signal(true);
  public demoDatePickerMinDate = signal(this.today);
  public limitDatePickerMax = signal(false);
  public demoDatePickerMaxDate = signal('2026-07-25');
  public demoDatePickerShowPresets = signal(true);

  public readonly demoChainOptions = [
    { value: '1',     label: 'Ethereum Mainnet' },
    { value: '42161', label: 'Arbitrum One' },
    { value: '56',    label: 'BNB Smart Chain' },
    { value: '421614',label: 'Arbitrum Sepolia' },
    { value: '97',    label: 'BSC Testnet' },
  ];

  public readonly demoRadioOptions = computed(() => {
    this.translationService.currentLang();
    return [
      { value: 'arbitrum', label: 'Arbitrum One', description: this.translationService.t('cards.controls.radio_arb_desc') },
      { value: 'ethereum', label: 'Ethereum', description: this.translationService.t('cards.controls.radio_eth_desc') },
      { value: 'bsc', label: 'BNB Chain', description: this.translationService.t('cards.controls.radio_bsc_desc') }
    ];
  });

  public readonly modalDropdownHeader: DropdownMenuHeader = {
    title: 'Nguyễn Tiến Đạt',
    subtitle: '0x71C...39A2 • tiendat.eth',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    statusBadge: 'PRO'
  };

  public readonly modalDropdownProfileItems = computed<DropdownMenuItem[]>(() => {
    this.translationService.currentLang();
    return [
      { type: 'header', label: this.translationService.t('cards.dropdown.header_dapp') },
      { id: 'profile', label: this.translationService.t('cards.dropdown.profile'), icon: 'user' },
      { id: 'wallet', label: this.translationService.t('cards.dropdown.connected_wallet'), icon: 'wallet', badge: this.translationService.t('showcase.active'), badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' },
      { id: 'settings', label: this.translationService.t('cards.dropdown.system_settings'), icon: 'settings' },
      { type: 'separator' },
      { id: 'logout', label: this.translationService.t('cards.dropdown.logout'), icon: 'logout', variant: 'danger' }
    ];
  });

  public readonly modalDropdownActionItems = computed<DropdownMenuItem[]>(() => {
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
      { type: 'separator' },
      { id: 'delete-cache', label: this.translationService.t('cards.dropdown.clear_cache'), icon: 'trash', variant: 'danger' }
    ];
  });

  public onDropdownSelect(item: DropdownMenuItem): void {
    const template = this.translationService.t('cards.dropdown.action_triggered');
    this.modalDropdownLastAction.set(template.replace('{label}', item.label || ''));
  }

  public cancel(): void {
    this.modalRef.close();
  }

  public confirm(): void {
    this.modalRef.close({
      date: this.modalDateValue(),
      select: this.modalSelectValue(),
      switch: this.modalSwitchValue(),
      radio: this.modalRadioValue(),
      checkbox: this.modalCheckboxValue(),
      tab: this.modalTabValue(),
      slider: this.modalSliderValue(),
      range: this.modalRangeValue()
    });
  }
}
