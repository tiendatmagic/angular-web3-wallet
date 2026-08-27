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
  HostListener,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { DropdownService } from '@core/services/dropdown.service';
import { getContainingBlockOffset } from '@core/utils/dom.utils';

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
    class: 'inline-block',
    '(document:click)': 'onClickOutside($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class DropdownMenuComponent implements AfterViewChecked {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dropdownService = inject(DropdownService);
  public readonly instanceId = 'dropdown_menu_' + Math.random().toString(36).substring(2, 9);

  @ViewChild('triggerWrapper') triggerWrapper?: ElementRef<HTMLElement>;
  @ViewChild('popoverEl') popoverEl?: ElementRef<HTMLElement>;
  @ViewChild('submenuEl') submenuEl?: ElementRef<HTMLElement>;

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

  public popoverStyle: Record<string, string> = {};
  public submenuStyle: Record<string, string> = {};

  private activeSubmenuTriggerEl: HTMLElement | null = null;

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
      this.activeSubmenuId.set(null);
      this.activeSubmenuTriggerEl = null;
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
      this.updateMenuPosition();
    } else {
      this.dropdownService.close(this.instanceId);
      this.activeSubmenuId.set(null);
      this.activeSubmenuTriggerEl = null;
    }
    this.openChange.emit(newState);
  }

  public open(): void {
    if (this.disabled || this.isOpen()) return;
    this.isOpen.set(true);
    this.dropdownService.open(this.instanceId);
    this.updateMenuPosition();
    this.openChange.emit(true);
  }

  public close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    this.activeSubmenuId.set(null);
    this.activeSubmenuTriggerEl = null;
    this.openChange.emit(false);
  }

  public onClickOutside(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node;
    const isInsideHost = this.elementRef.nativeElement.contains(target);
    const isInsidePopover = this.popoverEl?.nativeElement?.contains(target);
    const isInsideSubmenu = this.submenuEl?.nativeElement?.contains(target);

    if (!isInsideHost && !isInsidePopover && !isInsideSubmenu) {
      this.close();
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  public onItemHover(item: DropdownMenuItem): void {
    if (item.type !== 'sub' && this.activeSubmenuId()) {
      this.activeSubmenuId.set(null);
      this.activeSubmenuTriggerEl = null;
    }
  }

  public onItemClick(item: DropdownMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;

    if (item.type === 'sub') {
      const current = this.activeSubmenuId();
      if (current === (item.id || item.label)) {
        this.activeSubmenuId.set(null);
        this.activeSubmenuTriggerEl = null;
      } else {
        this.openSubmenu(item, event);
      }
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
      this.activeSubmenuTriggerEl = null;
    } else {
      this.openSubmenu(item, event);
    }
  }

  public openSubmenu(item: DropdownMenuItem, event: MouseEvent): void {
    if (item.disabled || !item.children?.length) return;

    this.activeSubmenuTriggerEl = event.currentTarget as HTMLElement;
    this.activeSubmenuId.set(item.id || item.label || '');
    this.updateSubmenuPosition();
  }

  public onSubmenuMouseEnter(): void {}

  public onPopoverScroll(): void {
    if (this.activeSubmenuId()) {
      this.updateSubmenuPosition();
    }
  }

  public activeSubmenu(): DropdownMenuItem | null {
    const activeId = this.activeSubmenuId();
    if (!activeId) return null;

    return this.items.find((item) => (item.id || item.label) === activeId) ?? null;
  }

  private parseWidthClass(widthStr: string): number {
    if (!widthStr) return 256;
    if (widthStr.includes('w-48')) return 192;
    if (widthStr.includes('w-56')) return 224;
    if (widthStr.includes('w-60')) return 240;
    if (widthStr.includes('w-64')) return 256;
    if (widthStr.includes('w-72')) return 288;
    if (widthStr.includes('w-80')) return 320;
    if (widthStr.includes('w-96')) return 384;
    const match = widthStr.match(/\[(\d+)px\]/);
    if (match) return parseInt(match[1], 10);
    return 256;
  }

  public updateMenuPosition(): void {
    const trigger = this.triggerWrapper?.nativeElement || this.elementRef.nativeElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const gap = 6;

    let popoverWidth = this.popoverEl?.nativeElement?.offsetWidth || 0;
    if (!popoverWidth) {
      popoverWidth = this.parseWidthClass(this.width);
    }
    popoverWidth = Math.max(popoverWidth, 220);

    const itemCount = this.items.length || 4;
    const estimatedHeight = (this.header ? 72 : 0) + itemCount * 38 + 24;

    const spaceBelow = window.innerHeight - triggerRect.bottom - gap - 12;
    const spaceAbove = triggerRect.top - gap - 12;

    let placeBottom = true;
    if (this.placement.startsWith('top')) {
      if (spaceAbove < estimatedHeight && spaceBelow > spaceAbove) {
        placeBottom = true;
      } else {
        placeBottom = false;
      }
    } else {
      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        placeBottom = false;
      } else {
        placeBottom = true;
      }
    }

    let left = triggerRect.left;

    if (this.placement.endsWith('right')) {
      left = triggerRect.right - popoverWidth;
    } else if (this.placement.endsWith('center')) {
      left = triggerRect.left + (triggerRect.width - popoverWidth) / 2;
    } else {
      left = triggerRect.left;
    }

    if (left + popoverWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - popoverWidth);
    }
    if (left < 8) left = 8;

    const offset = getContainingBlockOffset(trigger);

    if (placeBottom) {
      this.popoverStyle = {
        position: 'fixed',
        top: `${triggerRect.bottom + gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: `${Math.max(160, spaceBelow)}px`,
        transform: 'none',
        overflowY: 'auto',
        zIndex: '9999',
      };
    } else {
      this.popoverStyle = {
        position: 'fixed',
        top: `${triggerRect.top - gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: `${Math.max(160, spaceAbove)}px`,
        transform: 'translateY(-100%)',
        overflowY: 'auto',
        zIndex: '9999',
      };
    }
  }

  public updateSubmenuPosition(): void {
    if (!this.activeSubmenuTriggerEl || !this.activeSubmenuId()) return;

    if (!document.body.contains(this.activeSubmenuTriggerEl)) {
      this.activeSubmenuId.set(null);
      this.activeSubmenuTriggerEl = null;
      return;
    }

    const triggerRect = this.activeSubmenuTriggerEl.getBoundingClientRect();
    const offset = getContainingBlockOffset(this.activeSubmenuTriggerEl);

    if (triggerRect.bottom <= 0 || triggerRect.top >= window.innerHeight || triggerRect.width === 0) {
      this.activeSubmenuId.set(null);
      this.activeSubmenuTriggerEl = null;
      return;
    }

    let subWidth = this.submenuEl?.nativeElement?.offsetWidth || 0;
    if (!subWidth) {
      subWidth = this.parseWidthClass(this.width);
    }
    subWidth = Math.max(subWidth, 200);

    const currentSub = this.activeSubmenu();
    const subItemCount = currentSub?.children?.length ?? 2;
    const subEstimatedHeight = subItemCount * 38 + 16;

    let subLeft = triggerRect.right + 4;
    if (subLeft + subWidth > window.innerWidth - 8) {
      subLeft = triggerRect.left - subWidth - 4;
    }
    if (subLeft < 8) subLeft = 8;
    if (subLeft + subWidth > window.innerWidth - 8) {
      subLeft = Math.max(8, window.innerWidth - 8 - subWidth);
    }

    const spaceBelow = window.innerHeight - triggerRect.top - 12;
    const spaceAbove = triggerRect.bottom - 12;
    const placeBottom = spaceBelow >= subEstimatedHeight || spaceBelow >= spaceAbove;

    let subTop = triggerRect.top;
    let transform = 'none';
    let maxHeight = Math.max(120, spaceBelow);

    if (!placeBottom) {
      subTop = triggerRect.bottom;
      transform = 'translateY(-100%)';
      maxHeight = Math.max(120, spaceAbove);
    }

    this.submenuStyle = {
      position: 'fixed',
      left: `${subLeft - offset.left}px`,
      top: `${subTop - offset.top}px`,
      width: `${subWidth}px`,
      maxWidth: 'calc(100vw - 16px)',
      maxHeight: `${maxHeight}px`,
      transform: transform,
      overflowY: 'auto',
      zIndex: '10000',
    };
  }

  ngAfterViewChecked(): void {
    if (this.isOpen()) {
      this.updateMenuPosition();
      if (this.activeSubmenuId()) {
        this.updateSubmenuPosition();
      }
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange(): void {
    if (this.isOpen()) {
      this.updateMenuPosition();
      if (this.activeSubmenuId()) {
        this.updateSubmenuPosition();
      }
    }
  }
}
