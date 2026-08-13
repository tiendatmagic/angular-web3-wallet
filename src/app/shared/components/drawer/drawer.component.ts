import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  host: { class: 'block' },
})
export class DrawerComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() position: 'right' | 'left' | 'bottom' = 'right';
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  closeDrawer(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.close.emit();
  }
}
