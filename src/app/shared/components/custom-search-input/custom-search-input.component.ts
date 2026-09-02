import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  OnDestroy,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-custom-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './custom-search-input.component.html',
  host: { 'class': 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSearchInputComponent),
      multi: true
    },
  ],
})
export class CustomSearchInputComponent implements ControlValueAccessor, OnDestroy {
  public translationService = inject(TranslationService);
  public readonly val = signal<string>('');

  @Input() placeholder?: string;
  @Input() disabled: boolean = false;
  @Input() clearable: boolean = true;
  @Input() containerClass: string = 'w-full';

  get effectivePlaceholder(): string {
    if (this.placeholder !== undefined) return this.placeholder;
    return this.translationService.translate('common.search');
  }
  @Input() inputClass: string = 'w-full search-input';
  @Input() debounce: number = 0;
  @Input() loading: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  private readonly valueSubject = new Subject<string>();
  private valueSubscription: Subscription | null = null;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.valueSubscription = this.valueSubject
      .pipe(debounceTime(this.debounce || 0))
      .subscribe((v) => {
        this.valueChange.emit(v);
      });
  }

  public onInput(event: Event): void {
    if (this.disabled) return;
    const value = (event.target as HTMLInputElement).value;
    this.updateValue(value);
  }

  public onClear(): void {
    if (this.disabled) return;
    this.updateValue('');
  }

  private updateValue(value: string): void {
    this.val.set(value);
    this.onChange(value);
    this.onTouched();
    this.valueSubject.next(value);
  }

  public writeValue(value: any): void {
    this.val.set(value || '');
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
    if (this.valueSubscription) {
      this.valueSubscription.unsubscribe();
    }
  }
}
