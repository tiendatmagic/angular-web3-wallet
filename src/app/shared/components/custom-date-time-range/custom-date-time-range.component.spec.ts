import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDateTimeRangeComponent, DateTimeRangeValue } from './custom-date-time-range.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CustomDateTimeRangeComponent', () => {
  let component: CustomDateTimeRangeComponent;
  let fixture: ComponentFixture<CustomDateTimeRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDateTimeRangeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDateTimeRangeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component with default state', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.value()).toEqual({ startDate: '', endDate: '' });
    expect(component.resolvedPlacement).toBe('bottom');
  });

  it('should toggle popover open and close', () => {
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);

    component.toggleOpen();
    expect(component.isOpen()).toBe(true);

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it('should select date range and apply value', () => {
    fixture.detectChanges();
    let emittedVal: DateTimeRangeValue | null = null;
    component.valueChange.subscribe(val => (emittedVal = val));

    component.toggleOpen();

    const dateStart = new Date(2026, 6, 10);
    const dateEnd = new Date(2026, 6, 15);
    const mockEvent = new MouseEvent('click');

    component.selectDate(dateStart, mockEvent);
    component.selectDate(dateEnd, mockEvent);

    expect(component.tempStartDate()).toBe('2026-07-10');
    expect(component.tempEndDate()).toBe('2026-07-15');

    component.apply(mockEvent);

    expect(component.value()).toEqual({
      startDate: '2026-07-10',
      endDate: '2026-07-15'
    });
    expect(emittedVal).toEqual({
      startDate: '2026-07-10',
      endDate: '2026-07-15'
    });
    expect(component.isOpen()).toBe(false);
  });

  it('should clear date range on clear method', () => {
    component.writeValue({ startDate: '2026-07-10', endDate: '2026-07-15' });
    fixture.detectChanges();

    const mockEvent = new MouseEvent('click');
    component.clear(mockEvent);

    expect(component.value()).toEqual({ startDate: '', endDate: '' });
    expect(component.isOpen()).toBe(false);
  });

  it('should handle time values when showTime is true', () => {
    component.showTime = true;
    component.toggleOpen();
    fixture.detectChanges();

    component.selectTimeValue('startHour', '08');
    component.selectTimeValue('startMinute', '30');
    component.selectTimeValue('endHour', '17');
    component.selectTimeValue('endMinute', '45');

    expect(component.startHour()).toBe('08');
    expect(component.startMinute()).toBe('30');
    expect(component.endHour()).toBe('17');
    expect(component.endMinute()).toBe('45');

    component.tempStartDate.set('2026-07-10');
    component.tempEndDate.set('2026-07-15');

    component.apply();

    expect(component.value().startDate).toBe('2026-07-10 08:30');
    expect(component.value().endDate).toBe('2026-07-15 17:45');
  });

  it('should compute resolvedPlacement correctly for top and bottom', () => {
    component.placement = 'top';
    fixture.detectChanges();
    component.toggleOpen();

    expect(component.resolvedPlacement).toBe('top');
    expect(component.popoverStyle['transform']).toBe('translateY(-100%)');

    component.placement = 'bottom';
    component.toggleOpen();
    component.toggleOpen();

    expect(component.resolvedPlacement).toBe('bottom');
    expect(component.popoverStyle['transform']).toBe('none');
  });

  it('should select preset and automatically apply', () => {
    fixture.detectChanges();
    const mockEvent = new MouseEvent('click');

    component.selectPreset('today', mockEvent);

    expect(component.value().startDate).toBeTruthy();
    expect(component.value().endDate).toBeTruthy();
    expect(component.isOpen()).toBe(false);
  });
});
