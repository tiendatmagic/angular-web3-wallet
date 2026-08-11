import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() variant: 'soft' | 'bordered' | 'accent' = 'soft';
  @Input() title?: string;
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() iconName?: string;

  @Output() close = new EventEmitter<void>();

  isDismissed: boolean = false;

  get defaultIcon(): string {
    if (this.iconName) return this.iconName;
    switch (this.type) {
      case 'success':
        return 'check';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close';
      case 'info':
      default:
        return 'info';
    }
  }

  handleClose(): void {
    this.isDismissed = true;
    this.close.emit();
  }
}
