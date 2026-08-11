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
import { TranslatePipe } from '@shared/pipes/translate.pipe';

export interface DateTimeRangeValue {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-custom-date-time-range',
  host: {
    '(document:click)': 'onClickOutside($event)'
  },
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, TranslatePipe],
  templateUrl: './custom-date-time-range.component.html',
  styleUrl: './custom-date-time-range.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDateTimeRangeComponent),
      multi: true
    }
  ]
})
export class CustomDateTimeRangeComponent implements ControlValueAccessor, AfterViewChecked, OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translationService = inject(TranslationService);

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
  @Input() showPresets: boolean = true;
  @Input() showTime: boolean = true;
  @Input() minDate: string = '';
  @Input() maxDate: string = '';

  @Output() valueChange = new EventEmitter<DateTimeRangeValue>();

  @ViewChild('triggerDiv', { static: false }) triggerDiv!: ElementRef<HTMLDivElement>;

  public readonly value = signal<DateTimeRangeValue>({ startDate: '', endDate: '' });
  public readonly isOpen = signal<boolean>(false);

  public readonly currentYear = signal<number>(new Date().getFullYear());
  public readonly currentMonth = signal<number>(new Date().getMonth());

  public readonly tempStartDate = signal<string>('');
  public readonly tempEndDate = signal<string>('');
  public readonly tempStartTime = signal<string>('00:00');
  public readonly tempEndTime = signal<string>('23:59');
  public readonly hoveredDate = signal<Date | null>(null);

  public readonly hoursArray = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  public readonly minutesArray = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  
  public readonly startHour = signal<string>('00');
  public readonly startMinute = signal<string>('00');
  public readonly endHour = signal<string>('23');
  public readonly endMinute = signal<string>('59');

  public readonly showStartHourDropdown = signal<boolean>(false);
  public readonly showStartMinuteDropdown = signal<boolean>(false);
  public readonly showEndHourDropdown = signal<boolean>(false);
  public readonly showEndMinuteDropdown = signal<boolean>(false);

  public readonly weekdays = computed(() => {
    return this.translationService.currentLang() === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  });

  public popoverStyle: { [key: string]: string } = {};

  public readonly presets = computed(() => {
    return [
      { label: this.translationService.t('date_picker_ui.today'), id: 'today' },
      { label: this.translationService.t('date_picker_ui.yesterday'), id: 'yesterday' },
      { label: this.translationService.t('date_picker_ui.last_7_days'), id: 'last_7_days' },
      { label: this.translationService.t('date_picker_ui.last_30_days'), id: 'last_30_days' },
      { label: this.translationService.t('date_picker_ui.this_month'), id: 'this_month' }
    ];
  });

  public readonly displayPlaceholder = computed(() => {
    if (this.placeholder) return this.placeholder;
    return this.translationService.t('date_picker_ui.select_range');
  });

  public readonly displayValue = computed(() => {
    const val = this.value();
    if (!val.startDate) return '';
    
    const formatStr = (str: string) => {
      if (!str) return '';
      const parts = str.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '';
      
      const dParts = datePart.split('-');
      if (dParts.length === 3) {
        const dateFormatted = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
        return timePart ? `${dateFormatted} ${timePart}` : dateFormatted;
      }
      return str;
    };

    const start = formatStr(val.startDate);
    const end = formatStr(val.endDate);

    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || '';
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
      const popover = document.querySelector('.date-time-range-popover');
      if (popover && popover.contains(event.target as Node)) return;
      if (this.isOpen()) {
        this.closeDropdowns();
        this.isOpen.set(false);
      }
    }
  }

  public toggleOpen(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      const current = this.value();
      let startDateStr = current.startDate ? current.startDate.split(' ')[0] : '';
      let endDateStr = current.endDate ? current.endDate.split(' ')[0] : '';

      this.tempStartDate.set(startDateStr);
      this.tempEndDate.set(endDateStr);

      if (this.showTime) {
        if (current.startDate && current.startDate.includes(' ')) {
          const time = current.startDate.split(' ')[1];
          const [h, m] = time.split(':');
          this.startHour.set(h || '00');
          this.startMinute.set(m || '00');
        } else {
          this.startHour.set('00');
          this.startMinute.set('00');
        }

        if (current.endDate && current.endDate.includes(' ')) {
          const time = current.endDate.split(' ')[1];
          const [h, m] = time.split(':');
          this.endHour.set(h || '23');
          this.endMinute.set(m || '59');
        } else {
          this.endHour.set('23');
          this.endMinute.set('59');
        }
      }

      const baseDateStr = startDateStr || this.formatDate(new Date());
      const baseDate = this.parseDate(baseDateStr) || new Date();
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
    const popoverHeight = 440;
    const margin = 8;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + margin;

    if (rect.bottom + popoverHeight + margin > viewportHeight) {
      top = rect.top - popoverHeight - margin;
      if (top < margin) {
        top = Math.max(margin, viewportHeight - popoverHeight - margin);
      }
    }

    const popoverWidth = Math.min(Math.max(rect.width, 320), 340);
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

  public closeDropdowns(): void {
    this.showStartHourDropdown.set(false);
    this.showStartMinuteDropdown.set(false);
    this.showEndHourDropdown.set(false);
    this.showEndMinuteDropdown.set(false);
  }

  public toggleDropdown(type: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', event: MouseEvent): void {
    event.stopPropagation();
    const states = {
      startHour: this.showStartHourDropdown(),
      startMinute: this.showStartMinuteDropdown(),
      endHour: this.showEndHourDropdown(),
      endMinute: this.showEndMinuteDropdown()
    };

    this.closeDropdowns();

    if (!states[type]) {
      if (type === 'startHour') this.showStartHourDropdown.set(true);
      if (type === 'startMinute') this.showStartMinuteDropdown.set(true);
      if (type === 'endHour') this.showEndHourDropdown.set(true);
      if (type === 'endMinute') this.showEndMinuteDropdown.set(true);
    }
  }

  public selectTimeValue(type: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', val: string, event: MouseEvent): void {
    event.stopPropagation();
    if (type === 'startHour') this.startHour.set(val);
    if (type === 'startMinute') this.startMinute.set(val);
    if (type === 'endHour') this.endHour.set(val);
    if (type === 'endMinute') this.endMinute.set(val);

    this.closeDropdowns();
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
    this.closeDropdowns();

    if (this.isDateDisabled(date)) return;

    const formatted = this.formatDate(date);
    const start = this.tempStartDate();
    const end = this.tempEndDate();

    if (!start || (start && end)) {
      this.tempStartDate.set(formatted);
      this.tempEndDate.set('');
    } else if (start && !end) {
      const startDate = this.parseDate(start);
      if (startDate && date < startDate) {
        this.tempStartDate.set(formatted);
        this.tempEndDate.set('');
      } else {
        this.tempEndDate.set(formatted);
      }
    }
  }

  public onDateHover(date: Date): void {
    if (this.tempStartDate() && !this.tempEndDate()) {
      this.hoveredDate.set(date);
    } else {
      this.hoveredDate.set(null);
    }
  }

  public selectPreset(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.closeDropdowns();

    const today = new Date();
    let startD = new Date();
    let endD = new Date();

    if (id === 'today') {
      startD = today;
      endD = today;
    } else if (id === 'yesterday') {
      startD = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      endD = startD;
    } else if (id === 'last_7_days') {
      startD = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
      endD = today;
    } else if (id === 'last_30_days') {
      startD = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
      endD = today;
    } else if (id === 'this_month') {
      startD = new Date(today.getFullYear(), today.getMonth(), 1);
      endD = today;
    }

    const startStr = this.formatDate(startD);
    const endStr = this.formatDate(endD);

    this.tempStartDate.set(startStr);
    this.tempEndDate.set(endStr);

    if (this.showTime) {
      this.startHour.set('00');
      this.startMinute.set('00');
      this.endHour.set('23');
      this.endMinute.set('59');
    }

    this.apply(event);
  }

  public apply(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeDropdowns();

    const startStr = this.tempStartDate();
    let endStr = this.tempEndDate() || startStr;

    if (!startStr) return;

    let finalStart = startStr;
    let finalEnd = endStr;

    if (this.showTime) {
      const startTime = `${this.startHour()}:${this.startMinute()}`;
      const endTime = `${this.endHour()}:${this.endMinute()}`;

      finalStart = `${startStr} ${startTime}`;
      finalEnd = `${endStr} ${endTime}`;
    }

    const val: DateTimeRangeValue = { startDate: finalStart, endDate: finalEnd };

    this.value.set(val);
    this.onChange(val);
    this.onTouched();
    this.valueChange.emit(val);
    this.isOpen.set(false);
  }

  public cancel(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeDropdowns();
    this.isOpen.set(false);
  }

  public clear(event: MouseEvent): void {
    event.stopPropagation();
    this.closeDropdowns();
    const val: DateTimeRangeValue = { startDate: '', endDate: '' };
    this.tempStartDate.set('');
    this.tempEndDate.set('');
    this.value.set(val);
    this.onChange(val);
    this.onTouched();
    this.valueChange.emit(val);
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

  public isStartDate(date: Date): boolean {
    if (!this.tempStartDate()) return false;
    const start = this.parseDate(this.tempStartDate());
    if (!start) return false;
    return (
      date.getDate() === start.getDate() &&
      date.getMonth() === start.getMonth() &&
      date.getFullYear() === start.getFullYear()
    );
  }

  public isEndDate(date: Date): boolean {
    if (!this.tempEndDate()) return false;
    const end = this.parseDate(this.tempEndDate());
    if (!end) return false;
    return (
      date.getDate() === end.getDate() &&
      date.getMonth() === end.getMonth() &&
      date.getFullYear() === end.getFullYear()
    );
  }

  public isInRange(date: Date): boolean {
    const startStr = this.tempStartDate();
    const endStr = this.tempEndDate();
    const hover = this.hoveredDate();

    if (!startStr) return false;
    const start = this.parseDate(startStr);
    if (!start) return false;

    const targetTime = date.getTime();
    const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

    if (endStr) {
      const end = this.parseDate(endStr);
      if (!end) return false;
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      return targetTime > startTime && targetTime < endTime;
    } else if (hover) {
      const hoverTime = new Date(hover.getFullYear(), hover.getMonth(), hover.getDate()).getTime();
      if (hoverTime > startTime) {
        return targetTime > startTime && targetTime < hoverTime;
      }
    }

    return false;
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

  private onChange: (val: DateTimeRangeValue) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: DateTimeRangeValue): void {
    if (val && typeof val === 'object') {
      this.value.set({
        startDate: val.startDate || '',
        endDate: val.endDate || ''
      });
    } else {
      this.value.set({ startDate: '', endDate: '' });
    }
  }

  registerOnChange(fn: (val: DateTimeRangeValue) => void): void {
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
    const parts = str.split(' ')[0].split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
  }
}
