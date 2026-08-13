import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  signal,
  effect,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { DropdownService } from '@core/services/dropdown.service';

export interface DropdownMenuItem {
  id?: string;
  label?: string;
  icon?: string;
  iconColor?: string;
  shortcut?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  badge?: string;
  badgeColor?: string;
  type?: 'item' | 'checkbox' | 'radio' | 'separator' | 'header' | 'sub';
  checked?: boolean;
  radioValue?: any;
  groupName?: string;
  description?: string;
  children?: DropdownMenuItem[];
  action?: (item: DropdownMenuItem) => void;
}

export interface DropdownMenuHeader {
  title: string;
  subtitle?: string;
  avatar?: string;
  statusBadge?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './dropdown-menu.component.html',
  host: {
    class: 'block',
    '(document:click)': 'onClickOutside($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class DropdownMenuComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dropdownService = inject(DropdownService);
  public readonly instanceId = 'dropdown_menu_' + Math.random().toString(36).substring(2, 9);

  @Input() items: DropdownMenuItem[] = [];
  @Input() header: DropdownMenuHeader | null = null;
  @Input() triggerText: string = 'Menu';
  @Input() leadingIcon: string = '';
  @Input() triggerIcon: string = 'chevron-down';
  @Input() showChevron: boolean = true;
  @Input() triggerVariant:
    'default' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'avatar' | 'icon' = 'outline';
  @Input() triggerSize: 'sm' | 'md' | 'lg' = 'md';
  @Input() avatarUrl: string = '';
  @Input() placement:
    'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center' =
    'bottom-left';
  @Input() width: string = 'w-64';
  @Input() disabled: boolean = false;
  @Input() closeOnSelect: boolean = true;
  @Input() customTrigger: boolean = false;
  @Input() activeRadioValue: any = null;

  @Output() itemClick = new EventEmitter<DropdownMenuItem>();
  @Output() checkboxChange = new EventEmitter<{ item: DropdownMenuItem; checked: boolean }>();
  @Output() radioChange = new EventEmitter<{ item: DropdownMenuItem; value: any }>();
  @Output() openChange = new EventEmitter<boolean>();

  public readonly isOpen = signal<boolean>(false);
  public readonly activeSubmenuId = signal<string | null>(null);
  public readonly submenuPosition = signal({ left: 0, top: 0 });

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
      this.activeSubmenuId.set(null);
      this.openChange.emit(false);
    }
  });

  public toggleOpen(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.disabled) return;
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    if (newState) {
      this.dropdownService.open(this.instanceId);
    } else {
      this.dropdownService.close(this.instanceId);
      this.activeSubmenuId.set(null);
    }
    this.openChange.emit(newState);
  }

  public open(): void {
    if (this.disabled || this.isOpen()) return;
    this.isOpen.set(true);
    this.dropdownService.open(this.instanceId);
    this.openChange.emit(true);
  }

  public close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    this.activeSubmenuId.set(null);
    this.openChange.emit(false);
  }

  public onClickOutside(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  public onItemClick(item: DropdownMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;

    if (item.type === 'sub') {
      const current = this.activeSubmenuId();
      this.activeSubmenuId.set(current === item.id ? null : item.id || item.label || 'sub');
      return;
    }

    if (item.type === 'checkbox') {
      item.checked = !item.checked;
      this.checkboxChange.emit({ item, checked: item.checked });
      return;
    }

    if (item.type === 'radio') {
      this.activeRadioValue = item.radioValue;
      this.radioChange.emit({ item, value: item.radioValue });
      if (this.closeOnSelect) {
        this.close();
      }
      return;
    }

    this.itemClick.emit(item);
    if (item.action) {
      item.action(item);
    }

    if (this.closeOnSelect) {
      this.close();
    }
  }

  public toggleSubmenu(item: DropdownMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;
    const itemId = item.id || item.label || '';
    if (this.activeSubmenuId() === itemId) {
      this.activeSubmenuId.set(null);
    } else {
      this.openSubmenu(item, event);
    }
  }

  public openSubmenu(item: DropdownMenuItem, event: MouseEvent): void {
    if (item.disabled || !item.children?.length) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const triggerRect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    this.submenuPosition.set({
      left: triggerRect.right - hostRect.left + 8,
      top: triggerRect.top - hostRect.top,
    });
    this.activeSubmenuId.set(item.id || item.label || '');
  }

  public activeSubmenu(): DropdownMenuItem | null {
    const activeId = this.activeSubmenuId();
    if (!activeId) return null;

    return this.items.find((item) => (item.id || item.label) === activeId) ?? null;
  }

  public getPlacementClasses(): string {
    switch (this.placement) {
      case 'bottom-right':
        return 'top-full right-0 mt-2 origin-top-right';
      case 'top-left':
        return 'bottom-full left-0 mb-2 origin-bottom-left';
      case 'top-right':
        return 'bottom-full right-0 mb-2 origin-bottom-right';
      case 'top-center':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom';
      case 'bottom-center':
        return 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top';
      case 'bottom-left':
      default:
        return 'top-full left-0 mt-2 origin-top-left';
    }
  }
}
