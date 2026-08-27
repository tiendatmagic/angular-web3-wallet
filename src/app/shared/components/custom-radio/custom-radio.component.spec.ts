import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomRadioComponent } from './custom-radio.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CustomRadioComponent', () => {
  let component: CustomRadioComponent;
  let fixture: ComponentFixture<CustomRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRadioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomRadioComponent);
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
    component.label = 'Ethereum Mainnet';
    component.description = 'Chain ID: 1';
    fixture.detectChanges();

    const labelText = fixture.nativeElement.querySelector('p.font-semibold');
    const descText = fixture.nativeElement.querySelector('p.text-slate-400');

    expect(labelText?.textContent?.trim()).toBe('Ethereum Mainnet');
    expect(descText?.textContent?.trim()).toBe('Chain ID: 1');
  });

  it('should emit select and checkedChange on select', () => {
    component.value = 'eth';
    let selectedVal: any;
    let checkedVal: boolean | undefined;

    component.select.subscribe((val) => (selectedVal = val));
    component.checkedChange.subscribe((val) => (checkedVal = val));

    component.onSelect();

    expect(component.checked()).toBe(true);
    expect(selectedVal).toBe('eth');
    expect(checkedVal).toBe(true);
  });

  it('should not select when disabled', () => {
    component.value = 'eth';
    component.disabled = true;
    component.onSelect();
    expect(component.checked()).toBe(false);
  });

  it('should work with ControlValueAccessor', () => {
    component.value = 'polygon';
    component.writeValue('polygon');
    expect(component.checked()).toBe(true);

    component.writeValue('bsc');
    expect(component.checked()).toBe(false);

    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });
});
