import {
  Component,
  Input,
  signal,
  inject,
  ElementRef,
  HostListener,
  effect,
  ViewChild,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';
import { DropdownService } from '@core/services/dropdown.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ShortAddressPipe } from '@shared/pipes/short-address.pipe';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { POPULAR_CHAINS } from '@core/utils/blockchain.utils';
import { getContainingBlockOffset } from '@core/utils/dom.utils';

@Component({
  selector: 'app-account-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, BadgeComponent, ShortAddressPipe, TranslatePipe],
  templateUrl: './account-dropdown.component.html',
  host: {
    'class': 'block',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class AccountDropdownComponent implements AfterViewChecked, OnInit, OnDestroy {
  @Input() avatarUrl?: string;
  @Input() statusBadge?: string;

  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  public readonly instanceId = 'account_dropdown_' + Math.random().toString(36).substring(2, 9);
  private scrollListener: any;

  @ViewChild('triggerBtn') triggerBtn?: ElementRef<HTMLElement>;
  public dropdownStyle: Record<string, string> = {};

  public isOpen = signal(false);

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
    }
  });

  ngOnInit(): void {
    this.scrollListener = () => {
      if (this.isOpen()) {
        this.updateDropdownPosition();
        this.cdr.detectChanges();
      }
    };
    window.addEventListener('scroll', this.scrollListener, true);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    if (newState) {
      this.dropdownService.open(this.instanceId);
      this.updateDropdownPosition();
    } else {
      this.dropdownService.close(this.instanceId);
    }
  }

  public updateDropdownPosition(): void {
    const trigger = this.triggerBtn?.nativeElement || this.elementRef.nativeElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const offset = getContainingBlockOffset(trigger);
    const gap = 6;

    if (window.innerWidth < 640) {
      this.dropdownStyle = {
        position: 'fixed',
        top: '3.75rem',
        left: '12px',
        right: '12px',
        zIndex: '200',
      };
      return;
    }

    const popoverWidth = 288; // w-72
    let left = triggerRect.right - popoverWidth;
    if (left < 8) left = 8;

    const spaceBelow = window.innerHeight - triggerRect.bottom - gap - 12;
    const spaceAbove = triggerRect.top - gap - 12;
    const estimatedHeight = 360;

    let placeBottom = true;
    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      placeBottom = false;
    }

    if (placeBottom) {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${triggerRect.bottom + gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: `${Math.max(160, spaceBelow)}px`,
        transform: 'none',
        overflowY: 'auto',
        zIndex: '200',
      };
    } else {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${triggerRect.top - gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: `${Math.max(160, spaceAbove)}px`,
        transform: 'translateY(-100%)',
        overflowY: 'auto',
        zIndex: '200',
      };
    }
  }

  ngAfterViewChecked(): void {
    if (this.isOpen()) {
      this.updateDropdownPosition();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen()) {
      this.updateDropdownPosition();
    }
  }

  public connectWallet(): void {
    this.stateService.connectWallet();
  }

  public copyAddress(event: Event): void {
    event.stopPropagation();
    const address = this.stateService.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.stateService.showToast(this.translationService.t('header.copied_address_toast'), 'success');
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }

  public openAccountModal(event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    setTimeout(async () => {
      await this.stateService.openAccountModal();
    }, 100);
  }

  public viewOnExplorer(event: Event): void {
    event.stopPropagation();
    const address = this.stateService.address();
    const chainId = this.stateService.chainId();
    if (!address) return;

    const activeChain = POPULAR_CHAINS.find((c) => Number(c.chainId) === Number(chainId));
    const explorerUrl = activeChain ? activeChain.explorerUrl : 'https://etherscan.io';
    window.open(`${explorerUrl}/address/${address}`, '_blank');
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
  }

  public async disconnectWallet(event: Event): Promise<void> {
    event.stopPropagation();
    await this.stateService.disconnectWallet();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }
}
