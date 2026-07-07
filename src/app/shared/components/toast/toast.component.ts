import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  public readonly toastService = inject(ToastService);

  public get successMessage() {
    return this.toastService.successMessage;
  }

  public get errorMessage() {
    return this.toastService.errorMessage;
  }
}
