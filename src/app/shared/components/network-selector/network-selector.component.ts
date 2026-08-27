import {
  Component,
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
import { DropdownService } from '@core/services/dropdown.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { getContainingBlockOffset } from '@core/utils/dom.utils';

@Component({
  selector: 'app-network-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './network-selector.component.html',
  host: {
    'class': 'block',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class NetworkSelectorComponent implements AfterViewChecked, OnInit, OnDestroy {
  public stateService = inject(StateService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  public readonly instanceId = 'network_selector_' + Math.random().toString(36).substring(2, 9);
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

    const popoverWidth = 256; // w-64
    let left = triggerRect.right - popoverWidth;
    if (left < 8) left = 8;

    const spaceBelow = window.innerHeight - triggerRect.bottom - gap - 12;
    const spaceAbove = triggerRect.top - gap - 12;
    const estimatedHeight = 320;

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

  public switchNetwork(chainId: number, event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    setTimeout(async () => {
      await this.stateService.switchNetwork(chainId);
    }, 100);
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
