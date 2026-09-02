import {
  Component,
  Input,
  signal,
  inject,
  ElementRef,
  HostListener,
  effect,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class AccountDropdownComponent implements OnDestroy {
  @Input() avatarUrl?: string;
  @Input() statusBadge?: string;

  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  public readonly instanceId = 'account_dropdown_' + Math.random().toString(36).substring(2, 9);
  private scrollListener: any;
  private rafId: number | null = null;

  @ViewChild('triggerBtn') triggerBtn?: ElementRef<HTMLElement>;
  public dropdownStyle: Record<string, string> = {};

  public isOpen = signal(false);

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  });

  private attachListeners(): void {
    if (this.scrollListener || typeof window === 'undefined') return;
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = () => {
        if (!this.rafId) {
          this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            if (this.isOpen()) {
              this.updateDropdownPosition();
              this.cdr.markForCheck();
            }
          });
        }
      };
      window.addEventListener('scroll', this.scrollListener, { capture: true, passive: true });
      window.addEventListener('resize', this.scrollListener, { passive: true });
    });
  }

  private detachListeners(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
      window.removeEventListener('resize', this.scrollListener);
      this.scrollListener = null;
    }
  }

  ngOnDestroy(): void {
    this.detachListeners();
  }

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    if (newState) {
      this.dropdownService.open(this.instanceId);
      this.attachListeners();
      this.updateDropdownPosition();
      this.cdr.markForCheck();
    } else {
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }

  public updateDropdownPosition(): void {
    const trigger = this.triggerBtn?.nativeElement || this.elementRef.nativeElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const offset = getContainingBlockOffset(trigger);
    const gap = 6;

    const isMobile = window.innerWidth < 640;
    let popoverWidth: number;
    let left: number;

    if (isMobile) {
      popoverWidth = window.innerWidth - 32;
      left = 16;
    } else {
      popoverWidth = 320;
      left = triggerRect.right - popoverWidth;
    }

    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - 16 - popoverWidth);
    }
    if (left < 16 && isMobile) left = 16;

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
        maxWidth: isMobile ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)',
        maxHeight: `${Math.max(160, spaceBelow)}px`,
        transform: 'none',
        overflowY: 'auto',
        zIndex: '9999',
      };
    } else {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${triggerRect.top - gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: isMobile ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)',
        maxHeight: `${Math.max(160, spaceAbove)}px`,
        transform: 'translateY(-100%)',
        overflowY: 'auto',
        zIndex: '9999',
      };
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
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }

  public openAccountModal(event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    this.detachListeners();
    this.cdr.markForCheck();
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
    this.detachListeners();
    this.cdr.markForCheck();
  }

  public async disconnectWallet(event: Event): Promise<void> {
    event.stopPropagation();
    await this.stateService.disconnectWallet();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    this.detachListeners();
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }
}
