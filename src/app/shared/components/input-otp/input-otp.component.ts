import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  forwardRef,
  signal,
  computed,
  ChangeDetectionStrategy,
  AfterViewInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslationService } from '../../../core/services/translation.service';

export type OtpInputType = 'numeric' | 'alphanumeric' | 'any';
export type OtpInputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input-otp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-otp.component.html',
  host: { 'class': 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputOtpComponent),
      multi: true
    }
  ]
})
export class InputOtpComponent implements ControlValueAccessor, AfterViewInit {
  @Input() length: number = 6;
  @Input() groupSize: number = 3;
  @Input() showSeparator: boolean = true;
  @Input() mask: boolean = false;
  @Input() type: OtpInputType = 'numeric';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() invalid: boolean = false;
  @Input() size: OtpInputSize = 'md';
  @Input() autoFocus: boolean = false;
  @Input() placeholder: string = '';
  @Input() ariaLabel: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() completed = new EventEmitter<string>();

  @ViewChild('hiddenInput') hiddenInputRef!: ElementRef<HTMLInputElement>;

  valueSignal = signal<string>('');
  isFocusedSignal = signal<boolean>(false);
  focusedIndexSignal = signal<number>(0);

  slotsSignal = computed(() => Array.from({ length: this.length }, (_, i) => i));
  private readonly translationService = inject(TranslationService);

  get effectiveAriaLabel(): string {
    return this.ariaLabel || this.translationService.t('showcase.otp_code');
  }

  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (this.autoFocus && !this.disabled && !this.readonly) {
      setTimeout(() => this.focusInput(), 100);
    }
  }

  writeValue(val: string | null | undefined): void {
    const sanitized = this.cleanValue(val || '');
    this.valueSignal.set(sanitized);
    this.updateFocusedIndexAfterValueChange(sanitized.length);
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  focusInput(): void {
    if (this.disabled || this.readonly) return;
    if (this.hiddenInputRef?.nativeElement) {
      this.hiddenInputRef.nativeElement.focus();
      this.syncSelection();
    }
  }

  onSlotClick(index: number): void {
    if (this.disabled || this.readonly) return;
    const currentLen = this.valueSignal().length;
    const targetIndex = Math.min(index, currentLen);
    this.focusedIndexSignal.set(targetIndex);
    this.focusInput();
  }

  onInputFocus(): void {
    if (this.disabled || this.readonly) return;
    this.isFocusedSignal.set(true);
    const currentLen = this.valueSignal().length;
    const targetIndex = Math.min(this.focusedIndexSignal(), currentLen);
    this.focusedIndexSignal.set(targetIndex);
    this.syncSelection();
  }

  onInputBlur(): void {
    this.isFocusedSignal.set(false);
    this.onTouched();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawVal = input.value;
    const cleaned = this.cleanValue(rawVal);

    this.updateValue(cleaned);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled || this.readonly) return;

    const key = event.key;
    const currentVal = this.valueSignal();
    const curIdx = this.focusedIndexSignal();

    if (key === 'ArrowLeft') {
      event.preventDefault();
      if (curIdx > 0) {
        this.focusedIndexSignal.set(curIdx - 1);
        this.syncSelection();
      }
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      if (curIdx < Math.min(currentVal.length, this.length - 1)) {
        this.focusedIndexSignal.set(curIdx + 1);
        this.syncSelection();
      }
    } else if (key === 'Backspace') {
      if (currentVal.length > 0 && curIdx > 0 && curIdx === currentVal.length) {
        const newVal = currentVal.slice(0, -1);
        this.updateValue(newVal);
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (this.disabled || this.readonly) return;

    const pastedData = event.clipboardData?.getData('text') || '';
    const cleaned = this.cleanValue(pastedData);
    if (cleaned) {
      this.updateValue(cleaned);
    }
  }

  getSlotChar(index: number): string {
    const val = this.valueSignal();
    if (index < val.length) {
      return this.mask ? '●' : val[index];
    }
    return '';
  }

  hasValueAt(index: number): boolean {
    return index < this.valueSignal().length;
  }

  isSlotFocused(index: number): boolean {
    return this.isFocusedSignal() && this.focusedIndexSignal() === index;
  }

  isCaretVisible(index: number): boolean {
    return this.isSlotFocused(index) && !this.hasValueAt(index);
  }

  shouldShowSeparatorAfter(index: number): boolean {
    if (!this.showSeparator || this.groupSize <= 0) return false;
    return (index + 1) % this.groupSize === 0 && index < this.length - 1;
  }

  private cleanValue(val: string): string {
    if (!val) return '';
    let filtered = val;
    if (this.type === 'numeric') {
      filtered = val.replace(/[^0-9]/g, '');
    } else if (this.type === 'alphanumeric') {
      filtered = val.replace(/[^a-zA-Z0-9]/g, '');
    }
    return filtered.slice(0, this.length);
  }

  private updateValue(newVal: string): void {
    const prevVal = this.valueSignal();
    this.valueSignal.set(newVal);

    if (this.hiddenInputRef?.nativeElement) {
      this.hiddenInputRef.nativeElement.value = newVal;
    }

    this.updateFocusedIndexAfterValueChange(newVal.length);

    if (newVal !== prevVal) {
      this.onChange(newVal);
      this.valueChange.emit(newVal);

      if (newVal.length === this.length) {
        this.completed.emit(newVal);
      }
    }
  }

  private updateFocusedIndexAfterValueChange(length: number): void {
    const nextIndex = Math.min(length, this.length - 1);
    this.focusedIndexSignal.set(nextIndex);
    this.syncSelection();
  }

  private syncSelection(): void {
    setTimeout(() => {
      if (this.hiddenInputRef?.nativeElement && this.isFocusedSignal()) {
        const idx = this.focusedIndexSignal();
        try {
          this.hiddenInputRef.nativeElement.setSelectionRange(idx, idx);
        } catch {
          // Skip if input type doesn't support selectionRange
        }
      }
    }, 0);
  }
}

