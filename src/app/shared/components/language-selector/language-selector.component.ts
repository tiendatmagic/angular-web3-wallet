import { Component, Input, signal, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@core/services/translation.service';
import { StateService } from '@core/services/state.service';
import { SupportedLang, LanguageOption } from '@core/i18n/i18n.types';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { SafeHtmlPipe } from '@shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe, SafeHtmlPipe],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {
  @Input() variant: 'compact' | 'full' = 'compact';
  @Input() direction: 'up' | 'down' = 'down';

  public translationService = inject(TranslationService);
  private stateService = inject(StateService);
  private elementRef = inject(ElementRef);

  public isOpen = signal(false);

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((prev) => !prev);
  }

  public selectLanguage(code: SupportedLang, event: Event): void {
    event.stopPropagation();
    if (this.translationService.currentLang() !== code) {
      this.translationService.setLanguage(code);
      const msg = code === 'vi' ? 'Đã chuyển đổi sang Tiếng Việt!' : 'Switched language to English!';
      this.stateService.showToast(msg, 'success');
    }
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
