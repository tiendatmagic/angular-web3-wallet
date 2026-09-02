import { Component, Input, Output, EventEmitter, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-switch.component.html',
  host: {
    '[class.inline-flex]': 'type === "compact"',
    '[class.items-center]': 'type === "compact"',
    '[class.block]': 'type === "full"',
    '[class.w-full]': 'type === "full"',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSwitchComponent),
      multi: true
    }
  ]
})
export class CustomSwitchComponent implements ControlValueAccessor {
  public readonly checkedSignal = signal<boolean>(false);

  @Input() set checked(value: boolean) {
    this.checkedSignal.set(!!value);
  }
  get checked(): boolean {
    return this.checkedSignal();
  }

  @Input() label: string = '';
  @Input() description: string = '';
  @Input() disabled: boolean = false;
  @Input() type: 'compact' | 'full' = 'compact';

  @Output() checkedChange = new EventEmitter<boolean>();

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  public onToggle(event: Event): void {
    if (this.disabled) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checkedSignal.set(isChecked);
    this.checkedChange.emit(isChecked);
    this.onChange(isChecked);
    this.onTouched();
  }

  public writeValue(value: any): void {
    this.checkedSignal.set(!!value);
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
