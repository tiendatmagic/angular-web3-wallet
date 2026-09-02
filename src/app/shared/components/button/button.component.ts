import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'button[app-button], a[app-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  templateUrl: './button.component.html',
  host: {
    '[class]': 'hostClasses',
    '[attr.disabled]': '(disabled || loading) ? "" : null',
    '[class.pointer-events-none]': 'loading || disabled',
  },
})
export class ButtonComponent {
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'danger-light'
    | 'cancel'
    | 'ghost'
    | 'info'
    | 'reload'
    | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() loading = false;
  @Input() disabled = false;

  get hostClasses(): string {
    return `btn btn-${this.variant} btn-${this.size}`;
  }
}
