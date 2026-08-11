import { Component, Input, signal, inject, ElementRef, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@core/services/translation.service';
import { StateService } from '@core/services/state.service';
import { DropdownService } from '@core/services/dropdown.service';
import { SupportedLang, LanguageOption } from '@core/i18n/i18n.types';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './language-selector.component.html',
  host: {
    'class': 'block',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class LanguageSelectorComponent {
  @Input() variant: 'compact' | 'full' = 'compact';
  @Input() direction: 'up' | 'down' = 'down';

  public translationService = inject(TranslationService);
  private stateService = inject(StateService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  public readonly instanceId = 'lang_selector_' + Math.random().toString(36).substring(2, 9);

  public isOpen = signal(false);

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
    }
  });

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    if (newState) {
      this.dropdownService.open(this.instanceId);
    } else {
      this.dropdownService.close(this.instanceId);
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

