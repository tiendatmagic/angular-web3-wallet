import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  signal,
  computed,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

/**
 * Custom Date Picker Component chất lượng cao đồng bộ màu thương hiệu dApp.
 * 
 * Sử dụng:
 *   <app-custom-date-picker [(ngModel)]="selectedDate" label="Ngày giao dịch" />
 */
@Component({
  selector: 'app-custom-date-picker',
  host: {
    '(document:click)': 'onClickOutside($event)'
  },
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
    `
  ]
})
export class CustomDatePickerComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  @Input() label: string = '';
  @Input() placeholder: string = 'Chọn ngày...';
  @Input() disabled: boolean = false;
  @Input() minDate: string = ''; // Định dạng: YYYY-MM-DD
  @Input() maxDate: string = ''; // Định dạng: YYYY-MM-DD

  @Output() valueChange = new EventEmitter<string>();

  public readonly value = signal<string>(''); // Lưu trữ dạng: YYYY-MM-DD
  public readonly isOpen = signal<boolean>(false);
  
  public readonly currentYear = signal<number>(new Date().getFullYear());
  public readonly currentMonth = signal<number>(new Date().getMonth());

  public readonly weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Chuyển đổi định dạng hiển thị ra input (DD/MM/YYYY)
  public readonly displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  });

  // Tính toán ma trận 42 ngày (6 tuần) hiển thị trên lưới lịch
  public readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();

    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1);
    
    // Thứ của ngày đầu tiên (0: Chủ nhật, 1: Thứ hai, ..., 6: Thứ bảy)
    const startDayOfWeek = firstDay.getDay();

    // Quy đổi tuần bắt đầu từ Thứ Hai: Thứ Hai = 0, ..., Chủ Nhật = 6
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Ngày bắt đầu vẽ (có thể lùi về tháng trước)
    const startDate = new Date(year, month, 1 - offset);

    const daysArray: Date[] = [];
    for (let i = 0; i < 42; i++) {
      daysArray.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
    }
    return daysArray;
  });

  // Tên tháng tiếng Việt hiển thị trên header lịch
  public readonly currentMonthName = computed(() => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return monthNames[this.currentMonth()];
  });

  public onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  public toggleOpen(): void {
    if (this.disabled) return;
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      // Khi mở lịch, chuyển khung ngắm về tháng của giá trị hiện có hoặc tháng hiện tại
      const dateVal = this.parseDate(this.value());
      const baseDate = dateVal || new Date();
      this.currentYear.set(baseDate.getFullYear());
      this.currentMonth.set(baseDate.getMonth());
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
  }

  public selectDate(date: Date, event: Event): void {
    event.stopPropagation();
    if (this.isDisabled(date)) return;

    const formatted = this.formatDate(date);
    this.value.set(formatted);
    this.valueChange.emit(formatted);
    this.onChange(formatted);
    this.onTouched();
    this.isOpen.set(false);
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
    return val === this.formatDate(date);
  }

  public isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth();
  }

  public isDisabled(date: Date): boolean {
    const time = date.getTime();
    if (this.minDate) {
      const min = this.parseDate(this.minDate);
      if (min && time < min.getTime()) return true;
    }
    if (this.maxDate) {
      const max = this.parseDate(this.maxDate);
      if (max && time > max.getTime()) return true;
    }
    return false;
  }

  // Format Date -> YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Parse YYYY-MM-DD -> Date
  private parseDate(str: string): Date | null {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  // ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: any): void {
    if (value) {
      this.value.set(String(value));
    } else {
      this.value.set('');
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
