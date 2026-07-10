import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  inject,
  signal,
  computed,
  OnDestroy,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface SelectOption {
  [key: string]: any;
}

/**
 * Custom Select Dropdown thông minh với smart placement, tìm kiếm nội bộ.
 *
 * Sử dụng:
 *   <app-custom-select [options]="list" valueKey="id" labelKey="name" [(value)]="selected" />
 *   <app-custom-select [options]="list" [showSearch]="true" placement="auto" label="Chọn mạng lưới" />
 */
@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './custom-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class CustomSelectComponent implements ControlValueAccessor, OnDestroy {
  private readonly elementRef = inject(ElementRef);

  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();

  @Input() options: any[] = [];
  @Input() valueKey: string = '';
  @Input() labelKey: string = '';
  @Input() placeholder: string = 'Chọn...';
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() placement: 'bottom' | 'top' | 'auto' = 'auto';
  @Input() showSearch: boolean = false;
  @Input() containerClass: string = 'w-full';
  @Input() triggerClass: string = 'w-full form-input';

  public readonly isOpen = signal<boolean>(false);
  public readonly searchQuery = signal<string>('');
  public readonly dropdownStyle = signal<{ [key: string]: string }>({});

  private scrollListener: (() => void) | null = null;

  /** Đóng dropdown khi click ra ngoài component */
  @HostListener('document:click', ['$event'])
  public onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.removeScrollListeners();
    }
  }

  /** Tính toán vị trí dropdown tránh bị che khuất viewport */
  public updateDropdownPosition(): void {
    const trigger = this.elementRef.nativeElement.querySelector('button');
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 280;

    let resolvedPlacement: 'top' | 'bottom' = 'bottom';
    if (this.placement === 'auto') {
      resolvedPlacement = (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) ? 'top' : 'bottom';
    } else {
      resolvedPlacement = this.placement as 'top' | 'bottom';
    }

    const dropdownMinWidth = Math.max(160, rect.width);
    let left = rect.left;
    if (left + dropdownMinWidth > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - dropdownMinWidth - 16);
    }

    const styles: { [key: string]: string } = {
      position: 'fixed',
      left: `${left}px`,
      minWidth: `${dropdownMinWidth}px`,
      width: 'max-content',
      maxWidth: '320px',
      zIndex: '9999',
    };

    if (resolvedPlacement === 'bottom') {
      styles['top'] = `${rect.bottom + 6}px`;
      styles['max-height'] = `${Math.min(dropdownHeight, spaceBelow - 16)}px`;
    } else {
      styles['bottom'] = `${viewportHeight - rect.top + 6}px`;
      styles['max-height'] = `${Math.min(dropdownHeight, spaceAbove - 16)}px`;
    }

    this.dropdownStyle.set(styles);
  }

  private addScrollListeners(): void {
    this.removeScrollListeners();
    const updatePos = () => {
      if (this.isOpen()) this.updateDropdownPosition();
    };
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos, true);
    this.scrollListener = updatePos;
  }

  private removeScrollListeners(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
      window.removeEventListener('resize', this.scrollListener, true);
      this.scrollListener = null;
    }
  }

  public toggleOpen(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    if (nextState) {
      this.searchQuery.set('');
      this.updateDropdownPosition();
      this.isOpen.set(true);
      this.addScrollListeners();
    } else {
      this.isOpen.set(false);
      this.removeScrollListeners();
    }
  }

  public selectOption(option: any): void {
    const val = this.getOptionValue(option);
    this.value = val;
    this.valueChange.emit(val);
    this.onChange(val);
    this.onTouched();
    this.isOpen.set(false);
    this.removeScrollListeners();
  }

  public get selectedLabel(): string {
    const selected = this.options.find((opt) => {
      const optVal = this.getOptionValue(opt);
      return String(optVal) === String(this.value);
    });
    return selected !== undefined ? this.getOptionLabel(selected) : '';
  }

  public getOptionValue(option: any): any {
    if (option && typeof option === 'object' && this.valueKey) {
      return option[this.valueKey];
    }
    return option;
  }

  public getOptionLabel(option: any): string {
    if (option && typeof option === 'object' && this.labelKey) {
      return option[this.labelKey];
    }
    return option;
  }

  public compareValues(val1: any, val2: any): boolean {
    if (val1 === null || val1 === undefined) return val2 === null || val2 === undefined;
    if (val2 === null || val2 === undefined) return false;
    return String(val1) === String(val2);
  }

  public readonly filteredOptions = computed(() => {
    const opts = this.options || [];
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return opts;
    return opts.filter((opt) => {
      const label = String(this.getOptionLabel(opt)).toLowerCase();
      return label.includes(query);
    });
  });

  // ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: any): void {
    this.value = value;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy(): void {
    this.removeScrollListeners();
  }
}
