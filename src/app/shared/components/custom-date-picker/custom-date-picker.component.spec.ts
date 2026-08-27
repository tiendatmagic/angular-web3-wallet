import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDatePickerComponent } from './custom-date-picker.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CustomDatePickerComponent', () => {
  let component: CustomDatePickerComponent;
  let fixture: ComponentFixture<CustomDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDatePickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDatePickerComponent);
    component = fixture.componentInstance;
  });

  it('should create the component with default state', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.value()).toBe('');
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

  it('should select date when clicking a calendar day', () => {
    fixture.detectChanges();
    let emittedValue = '';
    component.valueChange.subscribe(val => (emittedValue = val));

    const testDate = new Date(2026, 6, 15);
    const mockEvent = new MouseEvent('click');

    component.selectDate(testDate, mockEvent);

    expect(component.value()).toBe('2026-07-15');
    expect(emittedValue).toBe('2026-07-15');
    expect(component.isOpen()).toBe(false);
  });

  it('should clear value when clear method is called', () => {
    component.writeValue('2026-07-15');
    fixture.detectChanges();

    expect(component.value()).toBe('2026-07-15');

    const mockEvent = new MouseEvent('click');
    component.clear(mockEvent);

    expect(component.value()).toBe('');
    expect(component.isOpen()).toBe(false);
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

  it('should select preset days', () => {
    fixture.detectChanges();
    let emitted = '';
    component.valueChange.subscribe(v => (emitted = v));

    const mockEvent = new MouseEvent('click');
    component.selectPreset(0, mockEvent);

    expect(component.value()).toBeTruthy();
    expect(emitted).toBeTruthy();
    expect(component.isOpen()).toBe(false);
  });
});
