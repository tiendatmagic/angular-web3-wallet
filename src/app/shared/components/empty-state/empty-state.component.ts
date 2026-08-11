import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: './empty-state.component.html',
  host: { 'class': 'block w-full' },
})
export class EmptyStateComponent {
  public translationService = inject(TranslationService);

  @Input() iconName: string = 'search';
  @Input() title?: string;
  @Input() description?: string;
  @Input() actionText?: string;
  @Input() secondaryActionText?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() action = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  get displayTitle(): string {
    if (this.title !== undefined) return this.title;
    return this.translationService.translate('table_ui.empty_title');
  }

  get displayDescription(): string {
    if (this.description !== undefined) return this.description;
    return this.translationService.translate('table_ui.empty_desc');
  }
}

