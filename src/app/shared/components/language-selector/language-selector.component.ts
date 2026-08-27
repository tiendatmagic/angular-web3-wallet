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
import { TranslationService } from '@core/services/translation.service';
import { StateService } from '@core/services/state.service';
import { DropdownService } from '@core/services/dropdown.service';
import { SupportedLang } from '@core/i18n/i18n.types';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { getContainingBlockOffset } from '@core/utils/dom.utils';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './language-selector.component.html',
  host: {
    '[class.w-full]': 'variant === "full"',
    '[class.block]': 'variant === "full"',
    '[class.inline-block]': 'variant === "compact"',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class LanguageSelectorComponent implements AfterViewChecked, OnInit, OnDestroy {
  @Input() variant: 'compact' | 'full' = 'compact';
  @Input() direction: 'up' | 'down' = 'down';

  public translationService = inject(TranslationService);
  private stateService = inject(StateService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  public readonly instanceId = 'lang_selector_' + Math.random().toString(36).substring(2, 9);
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

    if (this.variant === 'compact') {
      if (window.innerWidth < 640) {
        this.dropdownStyle = {
          position: 'fixed',
          top: '3.75rem',
          left: '12px',
          right: '12px',
          zIndex: '250',
        };
        return;
      }

      const popoverWidth = 208; // w-52
      let left = triggerRect.right - popoverWidth;
      if (left < 8) left = 8;

      const spaceBelow = window.innerHeight - triggerRect.bottom - gap - 12;
      const spaceAbove = triggerRect.top - gap - 12;
      const estimatedHeight = 140;

      let placeBottom = this.direction !== 'up';
      if (placeBottom && spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        placeBottom = false;
      } else if (!placeBottom && spaceAbove < estimatedHeight && spaceBelow > spaceAbove) {
        placeBottom = true;
      }

      if (placeBottom) {
        this.dropdownStyle = {
          position: 'fixed',
          top: `${triggerRect.bottom + gap - offset.top}px`,
          left: `${left - offset.left}px`,
          width: `${popoverWidth}px`,
          maxWidth: 'calc(100vw - 16px)',
          maxHeight: `${Math.max(120, spaceBelow)}px`,
          transform: 'none',
          overflowY: 'auto',
          zIndex: '250',
        };
      } else {
        this.dropdownStyle = {
          position: 'fixed',
          top: `${triggerRect.top - gap - offset.top}px`,
          left: `${left - offset.left}px`,
          width: `${popoverWidth}px`,
          maxWidth: 'calc(100vw - 16px)',
          maxHeight: `${Math.max(120, spaceAbove)}px`,
          transform: 'translateY(-100%)',
          overflowY: 'auto',
          zIndex: '250',
        };
      }
    } else {
      // variant === 'full'
      const popoverWidth = Math.max(triggerRect.width, 220);
      let left = triggerRect.left;
      if (left + popoverWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - 8 - popoverWidth);
      }
      if (left < 8) left = 8;

      const spaceBelow = window.innerHeight - triggerRect.bottom - gap - 12;
      const spaceAbove = triggerRect.top - gap - 12;
      const estimatedHeight = 140;

      let placeBottom = this.direction !== 'up';
      if (placeBottom && spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        placeBottom = false;
      } else if (!placeBottom && spaceAbove < estimatedHeight && spaceBelow > spaceAbove) {
        placeBottom = true;
      }

      if (placeBottom) {
        this.dropdownStyle = {
          position: 'fixed',
          top: `${triggerRect.bottom + gap - offset.top}px`,
          left: `${left - offset.left}px`,
          width: `${popoverWidth}px`,
          maxWidth: 'calc(100vw - 16px)',
          maxHeight: `${Math.max(120, spaceBelow)}px`,
          transform: 'none',
          overflowY: 'auto',
          zIndex: '250',
        };
      } else {
        this.dropdownStyle = {
          position: 'fixed',
          top: `${triggerRect.top - gap - offset.top}px`,
          left: `${left - offset.left}px`,
          width: `${popoverWidth}px`,
          maxWidth: 'calc(100vw - 16px)',
          maxHeight: `${Math.max(120, spaceAbove)}px`,
          transform: 'translateY(-100%)',
          overflowY: 'auto',
          zIndex: '250',
        };
      }
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

  public selectLanguage(code: SupportedLang, event: Event): void {
    event.stopPropagation();
    if (this.translationService.currentLang() !== code) {
      this.translationService.setLanguage(code);
      const msg = this.translationService.t('language.change_success');
      this.stateService.showToast(msg, 'success');
    }
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
