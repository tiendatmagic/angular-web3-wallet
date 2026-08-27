import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomCheckboxComponent } from './custom-checkbox.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CustomCheckboxComponent', () => {
  let component: CustomCheckboxComponent;
  let fixture: ComponentFixture<CustomCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomCheckboxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomCheckboxComponent);
    component = fixture.componentInstance;
  });

  it('should create the component with default values', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.checked()).toBe(false);
    expect(component.disabled).toBe(false);

    const labelElement = fixture.nativeElement.querySelector('label');
    expect(labelElement.classList.contains('items-center')).toBe(true);
    expect(labelElement.classList.contains('select-none')).toBe(true);
  });

  it('should render label and description properly', () => {
    component.label = 'Agree to terms';
    component.description = 'You must agree before continuing';
    fixture.detectChanges();

    const labelText = fixture.nativeElement.querySelector('p.font-semibold');
    const descText = fixture.nativeElement.querySelector('p.text-slate-400');

    expect(labelText?.textContent?.trim()).toBe('Agree to terms');
    expect(descText?.textContent?.trim()).toBe('You must agree before continuing');
  });

  it('should toggle checked state on toggleChecked() when not disabled', () => {
    let emittedValue: boolean | undefined;
    component.checkedChange.subscribe((val) => (emittedValue = val));

    expect(component.checked()).toBe(false);
    component.toggleChecked();
    expect(component.checked()).toBe(true);
    expect(emittedValue).toBe(true);

    component.toggleChecked();
    expect(component.checked()).toBe(false);
    expect(emittedValue).toBe(false);
  });

  it('should not toggle when disabled', () => {
    component.disabled = true;
    component.toggleChecked();
    expect(component.checked()).toBe(false);
  });

  it('should integrate with ControlValueAccessor correctly', () => {
    let formValue: any;
    component.registerOnChange((val: any) => (formValue = val));

    component.writeValue(true);
    expect(component.checked()).toBe(true);

    component.toggleChecked();
    expect(component.checked()).toBe(false);
    expect(formValue).toBe(false);

    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });
});
