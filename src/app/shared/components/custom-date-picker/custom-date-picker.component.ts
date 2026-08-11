import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  signal,
  computed,
  forwardRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-custom-date-picker',
  host: {
    '(document:click)': 'onClickOutside($event)'
  },
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './custom-date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true
    }
  ],
  styles: [
    `
      :host {
        display: block;
      }
      .date-picker-popover {
        position: fixed;
        z-index: 99999;
        width: 320px;
        box-sizing: border-box;
      }
    `
  ]
})
export class CustomDatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewChecked {
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private translationService = inject(TranslationService);

  private scrollListener: (() => void) | null = null;

  ngOnInit(): void {
    this.scrollListener = () => {
      if (this.isOpen()) {
        this.updatePosition();
      }
    };
    window.addEventListener('scroll', this.scrollListener, true);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Input() showPresets: boolean = true;

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('triggerDiv', { static: false }) triggerDiv!: ElementRef<HTMLDivElement>;

  public readonly value = signal<string>('');
  public readonly isOpen = signal<boolean>(false);

  public readonly currentYear = signal<number>(new Date().getFullYear());
  public readonly currentMonth = signal<number>(new Date().getMonth());

  public readonly weekdays = computed(() => {
    return this.translationService.currentLang() === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  });

  public popoverStyle: { [key: string]: string } = {};

  public readonly presets = computed(() => {
    const isEn = this.translationService.currentLang() === 'en';
    return [
      { label: isEn ? '7 days' : '7 ngày', days: 7 },
      { label: isEn ? '1 month' : '1 tháng', days: 30 },
      { label: isEn ? '3 months' : '3 tháng', days: 90 },
      { label: isEn ? '6 months' : '6 tháng', days: 180 },
      { label: isEn ? '1 year' : '1 năm', days: 365 },
    ];
  });

  public readonly displayPlaceholder = computed(() => {
    if (this.placeholder) return this.placeholder;
    return this.translationService.t('date_picker_ui.select_date');
  });

  public readonly displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  });

  public readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const startDate = new Date(year, month, 1 - offset);

    const daysArray: Date[] = [];
    for (let i = 0; i < 42; i++) {
      daysArray.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
    }
    return daysArray;
  });

  public readonly currentMonthName = computed(() => {
    const isEn = this.translationService.currentLang() === 'en';
    const monthNamesEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesVi = [
      'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
      'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return isEn ? monthNamesEn[this.currentMonth()] : monthNamesVi[this.currentMonth()];
  });

  public onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      const popover = document.querySelector('.date-picker-popover');
      if (popover && popover.contains(event.target as Node)) return;
      this.isOpen.set(false);
    }
  }

  public toggleOpen(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      const dateVal = this.parseDate(this.value());
      const baseDate = dateVal || new Date();
      this.currentYear.set(baseDate.getFullYear());
      this.currentMonth.set(baseDate.getMonth());
      this.updatePosition();
    }
  }

  ngAfterViewChecked(): void {
    if (this.isOpen()) {
      this.updatePosition();
    }
  }

  private updatePosition(): void {
    if (!this.triggerDiv || !this.triggerDiv.nativeElement) return;
    const rect = this.triggerDiv.nativeElement.getBoundingClientRect();
    const popoverHeight = 350;
    const margin = 8;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + margin;

    if (rect.bottom + popoverHeight + margin > viewportHeight) {
      top = rect.top - popoverHeight - margin;
      if (top < margin) {
        top = Math.max(margin, viewportHeight - popoverHeight - margin);
      }
    }

    const popoverWidth = Math.min(Math.max(rect.width, 280), 320);
    const left = rect.width > popoverWidth ? rect.right - popoverWidth : rect.left;

    const newStyle = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`
    };

    if (JSON.stringify(this.popoverStyle) !== JSON.stringify(newStyle)) {
      this.popoverStyle = newStyle;
      this.cdr.detectChanges();
    }
  }

  public prevMonth(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  public nextMonth(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  public selectDate(date: Date, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDateDisabled(date)) return;
    const formatted = this.formatDate(date);
    this.value.set(formatted);
    this.onChange(formatted);
    this.onTouched();
    this.valueChange.emit(formatted);
    this.isOpen.set(false);
  }

  public selectPreset(days: number, event: MouseEvent): void {
    event.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() + days);
    const formatted = this.formatDate(d);
    this.value.set(formatted);
    this.onChange(formatted);
    this.onTouched();
    this.valueChange.emit(formatted);
    this.isOpen.set(false);
  }

  public isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth();
  }

  public isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  public isSelected(date: Date): boolean {
    if (!this.value()) return false;
    const selected = this.parseDate(this.value());
    if (!selected) return false;
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  }

  public isDateDisabled(date: Date): boolean {
    const targetTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    if (this.minDate) {
      const min = this.parseDate(this.minDate);
      if (min) {
        const minTime = new Date(min.getFullYear(), min.getMonth(), min.getDate()).getTime();
        if (targetTime < minTime) return true;
      }
    }

    if (this.maxDate) {
      const max = this.parseDate(this.maxDate);
      if (max) {
        const maxTime = new Date(max.getFullYear(), max.getMonth(), max.getDate()).getTime();
        if (targetTime > maxTime) return true;
      }
    }

    return false;
  }

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val || '');
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

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(str: string): Date | null {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
  }

  public static todayString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
