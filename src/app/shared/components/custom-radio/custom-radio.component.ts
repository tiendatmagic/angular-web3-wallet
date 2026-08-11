import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-radio',
  
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-radio.component.html',
  host: { 'class': 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomRadioComponent),
      multi: true},
  ],
})
export class CustomRadioComponent implements ControlValueAccessor {
  public readonly checked = signal<boolean>(false);

  @Input() value: any;
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() description: string = '';
  @Input() disabled: boolean = false;

  @Input('checked') set setChecked(value: boolean) {
    this.checked.set(!!value);
  }

  @Output() checkedChange = new EventEmitter<boolean>();
  @Output() select = new EventEmitter<any>();

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  public onSelect(): void {
    if (this.disabled) return;
    this.checked.set(true);
    this.checkedChange.emit(true);
    this.select.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  public writeValue(value: any): void {
    this.checked.set(value === this.value);
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
