import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
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
export class DrawerComponent implements OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private closeTimer?: ReturnType<typeof setTimeout>;

  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() position: 'right' | 'left' | 'bottom' = 'right';
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() hasFooter: boolean = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  public isRendered = false;
  public isClosing = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen']) return;

    if (this.isOpen) {
      this.cancelPendingClose();
      this.isRendered = true;
      this.isClosing = false;
    } else if (this.isRendered && !this.isClosing) {
      this.startCloseAnimation();
    }
  }

  ngOnDestroy(): void {
    this.cancelPendingClose();
  }

  closeDrawer(): void {
    if (this.isClosing) return;

    this.startCloseAnimation();
    this.isOpenChange.emit(false);
    this.close.emit();
  }

  private startCloseAnimation(): void {
    this.isClosing = true;
    this.closeTimer = setTimeout(() => {
      this.isRendered = false;
      this.isClosing = false;
      this.closeTimer = undefined;
      this.cdr.markForCheck();
    }, 300);
  }

  private cancelPendingClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }
}
