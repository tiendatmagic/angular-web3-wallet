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
import { TranslationService } from '@core/services/translation.service';
import { DropdownService } from '@core/services/dropdown.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { getContainingBlockOffset } from '@core/utils/dom.utils';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '(document:click)': 'onClickOutside($event)',
    '(document:keydown.escape)': 'onEscape()'
  },
  imports: [CommonModule, FormsModule, IconComponent, TranslatePipe],
  templateUrl: './custom-date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true
    }
  ],
})
export class CustomDatePickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly lang = inject(TranslationService);
  private readonly dropdownService = inject(DropdownService);
  private readonly ngZone = inject(NgZone);
  public readonly instanceId = 'date_picker_' + Math.random().toString(36).substring(2, 9);
  private scrollListener: any;
  private rafId: number | null = null;

  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Input() showPresets: boolean = true;
  @Input() enableTime: boolean = false;
  @Input() placement: 'auto' | 'top' | 'bottom' = 'auto';
  @Input() clearable: boolean = true;

  @Input('value') set valueInput(val: any) {
    this.writeValue(val);
  }
  get valueInput(): string {
    return this.value();
  }

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('triggerDiv', { static: false }) triggerDiv!: ElementRef<HTMLDivElement>;

  public readonly value = signal<string>('');
  public readonly isOpen = signal<boolean>(false);
  public resolvedPlacement: 'top' | 'bottom' = 'bottom';

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
      this.detachListeners();
      this.cdr.markForCheck();
    }
  });

  public readonly currentYear = signal<number>(new Date().getFullYear());
  public readonly currentMonth = signal<number>(new Date().getMonth());
  public readonly selectedHour = signal<number>(0);
  public readonly selectedMinute = signal<number>(0);

  public readonly hours = Array.from({ length: 24 }, (_, i) => i);
  public readonly minutes = Array.from({ length: 60 }, (_, i) => i);

  public pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  public get weekdays(): string[] {
    return [
      'date.mon_short',
      'date.tue_short',
      'date.wed_short',
      'date.thu_short',
      'date.fri_short',
      'date.sat_short',
      'date.sun_short'
    ].map(key => this.lang.translate(key));
  }

  public popoverStyle: { [key: string]: string } = {};

  public get presets() {
    return [
      { label: this.lang.translate('date.today'), days: 0 },
      { label: this.lang.translate('date.yesterday'), days: -1 },
      { label: this.lang.translate('date.last_7_days'), days: -7 },
      { label: this.lang.translate('date.last_30_days'), days: -30 },
      { label: this.lang.translate('date.this_month'), days: -31 }
    ];
  }

  public readonly displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    const parts = val.split(/[ T]/);
    const dateParts = parts[0].split('-');
    if (dateParts.length === 3) {
      const dateFormatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      if (this.enableTime && parts[1]) {
        return `${dateFormatted} ${parts[1].substring(0, 5)}`;
      }
      return dateFormatted;
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
    this.lang.currentLang();
    return new Intl.DateTimeFormat(this.lang.currentLang(), { month: 'long' })
      .format(new Date(this.currentYear(), this.currentMonth(), 1));
  });

  private attachListeners(): void {
    if (this.scrollListener || typeof window === 'undefined') return;
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = () => {
        if (!this.rafId) {
          this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            if (this.isOpen()) {
              this.updatePopoverPosition();
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
      const popover = document.querySelector('.date-picker-popover');
      if (popover && popover.contains(event.target as Node)) return;
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
      const dateVal = this.parseDate(this.value());
      const baseDate = dateVal || new Date();
      this.currentYear.set(baseDate.getFullYear());
      this.currentMonth.set(baseDate.getMonth());
      if (this.enableTime) {
        if (dateVal) {
          this.selectedHour.set(dateVal.getHours());
          this.selectedMinute.set(dateVal.getMinutes());
        }
      }
      this.dropdownService.open(this.instanceId);
      this.attachListeners();
      this.updatePopoverPosition();
    } else {
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
    }
    this.cdr.markForCheck();
  }

  public clear(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.value.set('');
    this.valueChange.emit('');
    this.onChange('');
    this.onTouched();
    this.selectedPresetDays.set(null);
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    this.detachListeners();
    this.cdr.markForCheck();
  }

  public readonly selectedPresetDays = signal<number | null>(null);

  private updatePopoverPosition(): void {
    const triggerEl = this.triggerDiv?.nativeElement;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const offset = getContainingBlockOffset(triggerEl);
    const estimatedHeight = this.enableTime
      ? this.showPresets
        ? 420
        : 380
      : this.showPresets
        ? 370
        : 330;
    const popoverWidth = Math.min(320, window.innerWidth - 16);
    const gap = 6;

    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;

    let placeFinal: 'top' | 'bottom';
    if (this.placement === 'top') {
      placeFinal = 'top';
    } else if (this.placement === 'bottom') {
      placeFinal = 'bottom';
    } else {
      if (spaceBelow >= estimatedHeight) {
        placeFinal = 'bottom';
      } else if (spaceAbove >= estimatedHeight) {
        placeFinal = 'top';
      } else {
        placeFinal = spaceBelow >= spaceAbove ? 'bottom' : 'top';
      }
    }

    this.resolvedPlacement = placeFinal;

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - popoverWidth);
    }
    if (left < 8) left = 8;

    if (placeFinal === 'bottom') {
      this.popoverStyle = {
        position: 'fixed',
        top: `${rect.bottom + gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: `${Math.max(220, spaceBelow)}px`,
        transform: 'none',
        overflowY: 'auto',
        zIndex: '9999',
      };
    } else {
      this.popoverStyle = {
        position: 'fixed',
        top: `${rect.top - gap - offset.top}px`,
        left: `${left - offset.left}px`,
        width: `${popoverWidth}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: `${Math.max(220, spaceAbove)}px`,
        transform: 'translateY(-100%)',
        overflowY: 'auto',
        zIndex: '9999',
      };
    }
  }

  public prevMonth(event: Event): void {
    event.stopPropagation();
    const current = this.currentMonth();
    if (current === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.set(current - 1);
    }
    this.cdr.markForCheck();
  }

  public nextMonth(event: Event): void {
    event.stopPropagation();
    const current = this.currentMonth();
    if (current === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.set(current + 1);
    }
    this.cdr.markForCheck();
  }

  public selectDate(date: Date, event: Event): void {
    event.stopPropagation();
    if (this.isDateDisabled(date)) return;

    this.selectedPresetDays.set(null);

    if (this.enableTime) {
      const formattedDate = this.formatDateOnly(date);
      const h = this.pad2(this.selectedHour());
      const m = this.pad2(this.selectedMinute());
      const formatted = `${formattedDate} ${h}:${m}`;
      this.value.set(formatted);
      this.valueChange.emit(formatted);
      this.onChange(formatted);
      this.onTouched();
    } else {
      const formatted = this.formatDateOnly(date);
      this.value.set(formatted);
      this.valueChange.emit(formatted);
      this.onChange(formatted);
      this.onTouched();
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
    }
    this.cdr.markForCheck();
  }

  public onHourChange(hVal: any): void {
    const h = parseInt(hVal, 10);
    if (!isNaN(h)) {
      this.selectedHour.set(h);
      this.updateDateTimeValue();
      this.cdr.markForCheck();
    }
  }

  public onMinuteChange(mVal: any): void {
    const m = parseInt(mVal, 10);
    if (!isNaN(m)) {
      this.selectedMinute.set(m);
      this.updateDateTimeValue();
      this.cdr.markForCheck();
    }
  }

  public confirmSelection(event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    this.detachListeners();
    this.cdr.markForCheck();
  }

  private updateDateTimeValue(): void {
    if (!this.enableTime) return;
    const val = this.value();
    const dateStr = val ? val.split(/[ T]/)[0] : this.formatDateOnly(new Date());
    const h = this.pad2(this.selectedHour());
    const m = this.pad2(this.selectedMinute());
    const formatted = `${dateStr} ${h}:${m}`;
    this.value.set(formatted);
    this.valueChange.emit(formatted);
    this.onChange(formatted);
    this.onTouched();
  }

  public selectPreset(days: number, event: Event): void {
    event.stopPropagation();
    this.selectedPresetDays.set(days);
    const target = new Date();
    if (days === -31) {
      target.setDate(1);
    } else {
      target.setDate(target.getDate() + days);
    }
    this.currentYear.set(target.getFullYear());
    this.currentMonth.set(target.getMonth());
    if (this.enableTime) {
      const formattedDate = this.formatDateOnly(target);
      const h = this.pad2(this.selectedHour());
      const m = this.pad2(this.selectedMinute());
      const formatted = `${formattedDate} ${h}:${m}`;
      this.value.set(formatted);
      this.valueChange.emit(formatted);
      this.onChange(formatted);
      this.onTouched();
    } else {
      const formatted = this.formatDateOnly(target);
      this.value.set(formatted);
      this.valueChange.emit(formatted);
      this.onChange(formatted);
      this.onTouched();
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
      this.detachListeners();
    }
    this.cdr.markForCheck();
  }

  public isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  public isSelected(date: Date): boolean {
    const val = this.value();
    if (!val) return false;
    const datePart = val.split(/[ T]/)[0];
    return datePart === this.formatDateOnly(date);
  }

  public isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth();
  }

  public isDateDisabled(date: Date): boolean {
    if (this.minDate) {
      const min = this.parseDate(this.minDate);
      if (min) {
        const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
        const checkDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (checkDay.getTime() < minDay.getTime()) return true;
      }
    }
    if (this.maxDate) {
      const max = this.parseDate(this.maxDate);
      if (max) {
        const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
        const checkDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (checkDay.getTime() > maxDay.getTime()) return true;
      }
    }
    return false;
  }

  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(str: string): Date | null {
    if (!str) return null;
    const parts = str.split(/[ T]/);
    const dateParts = parts[0].split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      let hour = 0;
      let min = 0;
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        if (timeParts.length >= 2) {
          hour = parseInt(timeParts[0], 10) || 0;
          min = parseInt(timeParts[1], 10) || 0;
        }
      }
      const d = new Date(year, month, day, hour, min);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  public static todayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: any): void {
    const strVal = value ? String(value) : '';
    this.value.set(strVal);
    if (this.enableTime && strVal) {
      const dateObj = this.parseDate(strVal);
      if (dateObj) {
        this.selectedHour.set(dateObj.getHours());
        this.selectedMinute.set(dateObj.getMinutes());
      }
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
