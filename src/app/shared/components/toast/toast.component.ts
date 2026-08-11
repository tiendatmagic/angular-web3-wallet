import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-toast',
  
  imports: [CommonModule, IconComponent],
  
  templateUrl: './toast.component.html',
  host: { 'class': 'block' },
})
export class ToastComponent {
  public readonly toastService = inject(ToastService);
}
