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
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './drawer.component.html',
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

  get positionContainerClass(): string {
    switch (this.position) {
      case 'left':
        return 'justify-start';
      case 'bottom':
        return 'items-end justify-center';
      case 'right':
      default:
        return 'justify-end';
    }
  }

  get panelPositionClass(): string {
    if (this.position === 'bottom') {
      const anim = this.isClosing ? 'animate-drawer-bottom-out' : 'animate-drawer-bottom';
      return `w-full max-w-2xl border-t rounded-t-[15px] max-h-[85vh] ${anim}`;
    }

    const border = this.position === 'left' ? 'border-r' : 'border-l';
    const anim =
      this.position === 'left'
        ? this.isClosing
          ? 'animate-drawer-left-out'
          : 'animate-drawer-left'
        : this.isClosing
          ? 'animate-drawer-right-out'
          : 'animate-drawer-right';

    const sizeClass =
      this.size === 'sm'
        ? 'w-full sm:w-80'
        : this.size === 'lg'
          ? 'w-full sm:w-[600px]'
          : this.size === 'full'
            ? 'w-full'
            : 'w-full sm:w-[450px]';

    return `h-full ${border} ${sizeClass} ${anim}`;
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
