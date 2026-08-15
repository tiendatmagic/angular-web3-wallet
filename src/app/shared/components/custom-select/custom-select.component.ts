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
  effect,
  forwardRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { DropdownService } from '../../../core/services/dropdown.service';

export interface SelectOption {
  [key: string]: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
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
      multi: true},
  ],
})
export class CustomSelectComponent implements ControlValueAccessor, AfterViewChecked, OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translationService = inject(TranslationService);
  private readonly dropdownService = inject(DropdownService);
  public readonly instanceId = 'custom_select_' + Math.random().toString(36).substring(2, 9);
  private scrollListener: any;

  ngOnInit(): void {
    this.scrollListener = () => {
      if (this.isOpen()) {
        this.updateDropdownPosition();
        this.cdr.detectChanges();
      }
    };
    window.addEventListener('scroll', this.scrollListener, true);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();

  @Input() options: any[] = [];
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
    }
  });

  public dropdownStyle: { [key: string]: string } = {};
  public resolvedPlacement: 'top' | 'bottom' = 'bottom';

  public get effectivePlaceholder(): string {
    return this.placeholder || this.translationService.t('showcase.select_placeholder');
  }

  public onClickOutside(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }

  public toggleOpen(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    if (nextState) {
      this.searchQuery.set('');
      this.updateDropdownPosition();
      this.dropdownService.open(this.instanceId);
    } else {
      this.dropdownService.close(this.instanceId);
    }
    this.isOpen.set(nextState);
  }

  private updateDropdownPosition(): void {
    const triggerEl = this.triggerBtn?.nativeElement;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
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
        top: `${rect.bottom + gap}px`,
        left: `${left}px`,
        width: `${selectWidth}px`,
        maxHeight: `${Math.min(dropdownMaxHeight, Math.max(80, spaceBelow))}px`,
        zIndex: '9999',
      };
    } else {
      this.dropdownStyle = {
        position: 'fixed',
        top: `${rect.top - gap}px`,
        left: `${left}px`,
        width: `${selectWidth}px`,
        maxHeight: `${Math.min(dropdownMaxHeight, Math.max(80, spaceAbove))}px`,
        transform: 'translateY(-100%)',
        zIndex: '9999',
      };
    }
  }

  ngAfterViewChecked(): void {
    if (this.isOpen() && this.triggerBtn) {
      this.updateDropdownPosition();
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange(): void {
    if (this.isOpen()) {
      this.updateDropdownPosition();
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
    } else {
      this.value = val;
      this.valueChange.emit(val);
      this.onChange(val);
      this.onTouched();
      this.isOpen.set(false);
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
    const opts = this.options || [];
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
}
