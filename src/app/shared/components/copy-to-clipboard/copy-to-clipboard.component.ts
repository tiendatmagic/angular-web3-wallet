import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-copy-to-clipboard',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './copy-to-clipboard.component.html',
  styleUrl: './copy-to-clipboard.component.css',
})
export class CopyToClipboardComponent {
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);

  @Input() textToCopy: string = '';
  @Input() label?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showToast: boolean = true;
  @Input() successMessage?: string;

  copied: boolean = false;

  async copy(): Promise<void> {
    if (!this.textToCopy) return;

    try {
      await navigator.clipboard.writeText(this.textToCopy);
      this.copied = true;

      if (this.showToast) {
        const msg = this.successMessage || (this.translationService.currentLang() === 'vi' ? 'Đã sao chép vào bộ nhớ tạm!' : 'Copied to clipboard!');
        this.toastService.success(msg);
      }

      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
