import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  signal,
  computed,
  effect,
  forwardRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { DropdownService } from '../../../core/services/dropdown.service';
import { getContainingBlockOffset } from '../../../core/utils/dom.utils';

export interface SelectOption {
  [key: string]: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '(document:click)': 'onClickOutside($event)',
    '(document:keydown.escape)': 'onEscape()'
  },
  imports: [CommonModule, FormsModule, IconComponent, TranslatePipe],
  templateUrl: './custom-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translationService = inject(TranslationService);
  private readonly dropdownService = inject(DropdownService);
  private readonly ngZone = inject(NgZone);
  public readonly instanceId = 'custom_select_' + Math.random().toString(36).substring(2, 9);
  private scrollListener: any;
  private rafId: number | null = null;

  private _value: any = null;
  public readonly valueSignal = signal<any>(null);
  @Input() set value(val: any) {
    this._value = val;
    this.valueSignal.set(val);
    this.cdr.markForCheck();
  }
  get value(): any {
    return this._value;
  }

  @Output() valueChange = new EventEmitter<any>();

  private _options: any[] = [];
  public readonly optionsSignal = signal<any[]>([]);
  @Input() set options(val: any[]) {
    this._options = val || [];
    this.optionsSignal.set(val || []);
    this.cdr.markForCheck();
  }
  get options(): any[] {
    return this._options;
  }

  @Input() valueKey: string = '';
  @Input() labelKey: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() placement: 'bottom' | 'top' | 'auto' = 'auto';
  @Input() showSearch: boolean = false;
  @Input() multiple: boolean = false;
  @Input() containerClass: string = 'w-full';
  @Input() triggerClass: string = 'w-full form-input';

  @ViewChild('triggerBtn', { static: false }) triggerBtn!: ElementRef<HTMLButtonElement>;

  public readonly isOpen = signal<boolean>(false);
  public readonly searchQuery = signal<string>('');

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  });

  public dropdownStyle: { [key: string]: string } = {};
  public resolvedPlacement: 'top' | 'bottom' = 'bottom';

  public get effectivePlaceholder(): string {
    return this.placeholder || this.translationService.t('showcase.select_placeholder');
  }

  private attachListeners(): void {
    if (this.scrollListener || typeof window === 'undefined') return;
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = () => {
        if (!this.rafId) {
          this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            if (this.isOpen()) {
              this.updateDropdownPosition();
              this.cdr.markForCheck();
            }
          });
        }
      };
      window.addEventListener('scroll', this.scrollListener, { capture: true, passive: true });
      window.addEventListener('resize', this.scrollListener, { passive: true });
    });
  }

  private detachListeners(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
      window.removeEventListener('resize', this.scrollListener);
      this.scrollListener = null;
    }
  }

  ngOnDestroy(): void {
    this.detachListeners();
  }

  public onClickOutside(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }

  public toggleOpen(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      this.searchQuery.set('');
      this.dropdownService.open(this.instanceId);
      this.attachListeners();
      this.updateDropdownPosition();
    } else {
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
    }
    this.cdr.markForCheck();
  }

  private updateDropdownPosition(): void {
    const triggerEl = this.triggerBtn?.nativeElement;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const offset = getContainingBlockOffset(triggerEl);
    const dropdownMaxHeight = 280;
    const gap = 6;

    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;

    let placeFinal: 'top' | 'bottom';
    if (this.placement === 'top') {
      placeFinal = 'top';
    } else if (this.placement === 'bottom') {
      placeFinal = 'bottom';
    } else {
      if (spaceBelow >= dropdownMaxHeight) {
        placeFinal = 'bottom';
      } else if (spaceAbove >= dropdownMaxHeight) {
        placeFinal = 'top';
      } else {
        placeFinal = spaceBelow >= spaceAbove ? 'bottom' : 'top';
      }
    }

    this.resolvedPlacement = placeFinal;

    let left = rect.left;
    let selectWidth = rect.width;
    if (left + selectWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - selectWidth);
    }
    if (left < 8) left = 8;

    if (placeFinal === 'bottom') {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${rect.bottom + gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${selectWidth}px`,
        maxHeight: `${Math.min(dropdownMaxHeight, Math.max(80, spaceBelow))}px`,
        zIndex: '9999',
      };
    } else {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${rect.top - gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${selectWidth}px`,
        maxHeight: `${Math.min(dropdownMaxHeight, Math.max(80, spaceAbove))}px`,
        transform: 'translateY(-100%)',
        zIndex: '9999',
      };
    }
  }

  public selectOption(option: any): void {
    const val = this.getOptionValue(option);
    if (this.multiple) {
      const currentVal = Array.isArray(this.value) ? [...this.value] : [];
      const index = currentVal.findIndex((v: any) => String(v) === String(val));
      if (index > -1) {
        currentVal.splice(index, 1);
      } else {
        currentVal.push(val);
      }
      this.value = currentVal;
      this.valueChange.emit(currentVal);
      this.onChange(currentVal);
      this.onTouched();
      this.cdr.markForCheck();
    } else {
      this.value = val;
      this.valueChange.emit(val);
      this.onChange(val);
      this.onTouched();
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  }

  public isSelected(option: any): boolean {
    const optVal = this.getOptionValue(option);
    if (this.multiple) {
      return Array.isArray(this.value) && this.value.some((v: any) => String(v) === String(optVal));
    }
    return String(optVal) === String(this.value);
  }

  public get selectedLabel(): string {
    if (this.multiple) {
      if (!Array.isArray(this.value) || this.value.length === 0) return '';
      const selectedOpts = this.options.filter((opt) => {
        const optVal = this.getOptionValue(opt);
        return this.value.some((v: any) => String(v) === String(optVal));
      });
      return selectedOpts.map((opt) => this.getOptionLabel(opt)).join(', ');
    } else {
      const selected = this.options.find((opt) => {
        const optVal = this.getOptionValue(opt);
        return String(optVal) === String(this.value);
      });
      return selected !== undefined ? this.getOptionLabel(selected) : '';
    }
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
    const opts = this.optionsSignal() || [];
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return opts;
    return opts.filter((opt) => {
      const label = String(this.getOptionLabel(opt)).toLowerCase();
      return label.includes(query);
    });
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: any): void {
    if (this.multiple) {
      this.value = Array.isArray(value) ? value : [];
    } else {
      this.value = value;
    }
    this.cdr.markForCheck();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
