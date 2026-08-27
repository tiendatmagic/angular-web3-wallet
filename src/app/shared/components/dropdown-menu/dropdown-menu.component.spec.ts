import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownMenuComponent, DropdownMenuItem } from './dropdown-menu.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DropdownMenuComponent', () => {
  let component: DropdownMenuComponent;
  let fixture: ComponentFixture<DropdownMenuComponent>;

  const mockItems: DropdownMenuItem[] = [
    { id: '1', label: 'Item 1', icon: 'check' },
    { id: '2', label: 'Item 2', icon: 'close' },
    { id: '3', label: 'Checkbox Item', type: 'checkbox', checked: false },
    { id: '4', label: 'Radio Item', type: 'radio', radioValue: 'val1' },
    {
      id: '5',
      label: 'Submenu Item',
      type: 'sub',
      children: [
        { id: '5-1', label: 'Child 1' },
        { id: '5-2', label: 'Child 2' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMenuComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownMenuComponent);
    component = fixture.componentInstance;
    component.items = mockItems;
  });

  it('should create the component with closed state by default', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle open and close on toggleOpen call', () => {
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);

    component.toggleOpen();
    expect(component.isOpen()).toBe(true);

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it('should emit itemClick when a regular item is clicked', () => {
    fixture.detectChanges();
    let clickedItem: DropdownMenuItem | null = null;
    component.itemClick.subscribe((item) => (clickedItem = item));

    const mockEvent = new MouseEvent('click');
    component.onItemClick(mockItems[0], mockEvent);

    expect(clickedItem).toEqual(mockItems[0]);
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle checkbox item and emit checkboxChange', () => {
    fixture.detectChanges();
    let changeResult: { item: DropdownMenuItem; checked: boolean } | null = null;
    component.checkboxChange.subscribe((res) => (changeResult = res));

    const checkboxItem = mockItems[2];
    const mockEvent = new MouseEvent('click');
    component.onItemClick(checkboxItem, mockEvent);

    expect(checkboxItem.checked).toBe(true);
    expect(changeResult).toEqual({ item: checkboxItem, checked: true });
  });

  it('should compute transform translateY(-100%) for top placement when space above is sufficient', () => {
    component.placement = 'top-left';
    fixture.detectChanges();

    const triggerEl = component.triggerWrapper?.nativeElement || fixture.nativeElement;
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 540,
      left: 100,
      right: 200,
      width: 100,
      height: 40,
      x: 100,
      y: 500,
      toJSON: () => ({})
    });

    component.toggleOpen();

    expect(component.popoverStyle['transform']).toBe('translateY(-100%)');
  });

  it('should compute transform none for bottom placement when space below is sufficient', () => {
    component.placement = 'bottom-left';
    fixture.detectChanges();

    const triggerEl = component.triggerWrapper?.nativeElement || fixture.nativeElement;
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 100,
      right: 200,
      width: 100,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => ({})
    });

    component.toggleOpen();

    expect(component.popoverStyle['transform']).toBe('none');
  });

  it('should auto-flip to top when bottom placement has insufficient space below', () => {
    component.placement = 'bottom-left';
    fixture.detectChanges();

    const triggerEl = component.triggerWrapper?.nativeElement || fixture.nativeElement;
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      bottom: 740,
      left: 100,
      right: 200,
      width: 100,
      height: 40,
      x: 100,
      y: 700,
      toJSON: () => ({})
    });

    component.toggleOpen();

    expect(component.popoverStyle['transform']).toBe('translateY(-100%)');
  });

  it('should open and close submenu on toggleSubmenu', () => {
    fixture.detectChanges();
    component.toggleOpen();

    const subItem = mockItems[4];
    const mockEvent = new MouseEvent('click');
    component.openSubmenu(subItem, mockEvent);

    expect(component.activeSubmenuId()).toBe('5');
    expect(component.activeSubmenu()).toEqual(subItem);
  });
});
