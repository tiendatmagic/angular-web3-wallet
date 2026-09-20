import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSelectComponent } from './custom-select.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CustomSelectComponent', () => {
  let component: CustomSelectComponent;
  let fixture: ComponentFixture<CustomSelectComponent>;

  const mockOptions = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSelectComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    component.valueKey = 'value';
    component.labelKey = 'label';
  });

  it('should create the component with closed state by default', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle open and close state on toggleOpen', () => {
    fixture.detectChanges();
    component.toggleOpen();
    expect(component.isOpen()).toBe(true);

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it('should render popover with p-2 and rounded-[15px] classes when open', () => {
    fixture.detectChanges();
    component.toggleOpen();
    fixture.detectChanges();

    const popover = fixture.nativeElement.querySelector('.dropdown-menu-popover');
    expect(popover).toBeTruthy();
    expect(popover.classList.contains('p-2')).toBe(true);
    expect(popover.classList.contains('rounded-[15px]')).toBe(true);
  });

  it('should render option buttons with text-sm, font-semibold and rounded-[11px]', () => {
    fixture.detectChanges();
    component.toggleOpen();
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.dropdown-menu-popover button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(3);
    expect(buttons[0].classList.contains('rounded-[11px]')).toBe(true);
    expect(buttons[0].classList.contains('text-sm')).toBe(true);
    expect(buttons[0].classList.contains('font-semibold')).toBe(true);
  });

  it('should select single option and close popover', () => {
    fixture.detectChanges();
    let selectedVal: any = null;
    component.valueChange.subscribe((val) => (selectedVal = val));

    component.toggleOpen();
    fixture.detectChanges();

    component.selectOption(mockOptions[0]);
    fixture.detectChanges();

    expect(selectedVal).toBe('opt1');
    expect(component.value).toBe('opt1');
    expect(component.isOpen()).toBe(false);
  });

  it('should handle multi-select and keep popover open', () => {
    component.multiple = true;
    fixture.detectChanges();
    let selectedVal: any = null;
    component.valueChange.subscribe((val) => (selectedVal = val));

    component.toggleOpen();
    fixture.detectChanges();

    component.selectOption(mockOptions[0]);
    expect(selectedVal).toEqual(['opt1']);
    expect(component.isOpen()).toBe(true);

    component.selectOption(mockOptions[1]);
    expect(selectedVal).toEqual(['opt1', 'opt2']);

    component.selectOption(mockOptions[0]);
    expect(selectedVal).toEqual(['opt2']);
  });

  it('should filter options by search query and clear query with clearSearch', () => {
    component.showSearch = true;
    fixture.detectChanges();
    component.toggleOpen();
    fixture.detectChanges();

    component.searchQuery.set('Option 2');
    fixture.detectChanges();

    expect(component.filteredOptions().length).toBe(1);
    expect(component.filteredOptions()[0].value).toBe('opt2');

    component.clearSearch();
    fixture.detectChanges();

    expect(component.searchQuery()).toBe('');
    expect(component.filteredOptions().length).toBe(3);
  });

  it('should implement ControlValueAccessor correctly', () => {
    component.writeValue('opt2');
    expect(component.value).toBe('opt2');
    expect(component.selectedLabel).toBe('Option 2');

    component.setDisabledState(true);
    expect(component.disabled).toBe(true);

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it('should have proper ARIA attributes on trigger and options', () => {
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button');
    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    component.toggleOpen();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const listbox = fixture.nativeElement.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();

    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);
  });

  it('should select first filtered option on onSearchEnter', () => {
    component.showSearch = true;
    fixture.detectChanges();
    component.toggleOpen();
    fixture.detectChanges();

    component.searchQuery.set('Option 3');
    fixture.detectChanges();

    component.onSearchEnter();
    fixture.detectChanges();

    expect(component.value).toBe('opt3');
    expect(component.isOpen()).toBe(false);
  });

  it('should have !border-primary and ring-1 classes when open and in search box', () => {
    component.showSearch = true;
    fixture.detectChanges();
    component.toggleOpen();
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button');
    expect(trigger.classList.contains('!border-primary')).toBe(true);
    expect(trigger.classList.contains('ring-1')).toBe(true);

    const searchBox = fixture.nativeElement.querySelector('.dropdown-menu-popover input').parentElement;
    expect(searchBox.classList.contains('focus-within:!border-primary')).toBe(true);
    expect(searchBox.classList.contains('focus-within:ring-1')).toBe(true);
  });
});
