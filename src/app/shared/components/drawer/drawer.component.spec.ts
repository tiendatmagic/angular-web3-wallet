import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { DrawerComponent } from './drawer.component';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('DrawerComponent', () => {
  let component: DrawerComponent;
  let fixture: ComponentFixture<DrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not render drawer DOM when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const backdropEl = fixture.nativeElement.querySelector('.drawer-backdrop');
    expect(backdropEl).toBeNull();
  });

  it('should render drawer with z-[60] and correct classes when isOpen changes to true', () => {
    component.isOpen = true;
    component.title = 'Web3 Transaction Drawer';
    component.subtitle = '0x1234...5678';
    component.position = 'right';
    component.ngOnChanges({
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const backdropContainer = fixture.nativeElement.querySelector('.drawer-backdrop');
    expect(backdropContainer).toBeTruthy();
    expect(backdropContainer?.classList.contains('z-[60]')).toBe(true);
    expect(backdropContainer?.classList.contains('justify-end')).toBe(true);

    const backdropOverlay = fixture.nativeElement.querySelector('.bg-black\\/40');
    expect(backdropOverlay).toBeTruthy();
    expect(backdropOverlay?.classList.contains('animate-drawer-backdrop')).toBe(true);

    const panel = fixture.nativeElement.querySelector('.glass-dialog');
    expect(panel).toBeTruthy();
    expect(panel?.classList.contains('animate-drawer-right')).toBe(true);

    const titleEl = fixture.nativeElement.querySelector('h3');
    expect(titleEl?.textContent?.trim()).toBe('Web3 Transaction Drawer');

    const subtitleEl = fixture.nativeElement.querySelector('p');
    expect(subtitleEl?.textContent?.trim()).toBe('0x1234...5678');
  });

  it('should render left positioned drawer correctly', () => {
    component.isOpen = true;
    component.position = 'left';
    component.ngOnChanges({
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const backdropContainer = fixture.nativeElement.querySelector('.drawer-backdrop');
    expect(backdropContainer?.classList.contains('justify-start')).toBe(true);

    const panel = fixture.nativeElement.querySelector('.glass-dialog');
    expect(panel?.classList.contains('animate-drawer-left')).toBe(true);
    expect(component.positionContainerClass).toBe('justify-start');
    expect(component.panelPositionClass).toContain('animate-drawer-left');
  });

  it('should render bottom positioned drawer correctly', () => {
    component.isOpen = true;
    component.position = 'bottom';
    component.ngOnChanges({
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const backdropContainer = fixture.nativeElement.querySelector('.drawer-backdrop');
    expect(backdropContainer?.classList.contains('items-end')).toBe(true);
    expect(backdropContainer?.classList.contains('justify-center')).toBe(true);

    const panel = fixture.nativeElement.querySelector('.glass-dialog');
    expect(panel?.classList.contains('animate-drawer-bottom')).toBe(true);
    expect(component.positionContainerClass).toBe('items-end justify-center');
    expect(component.panelPositionClass).toContain('animate-drawer-bottom');
  });

  it('should compute size classes correctly', () => {
    component.position = 'right';

    component.size = 'sm';
    expect(component.panelPositionClass).toContain('sm:w-80');

    component.size = 'md';
    expect(component.panelPositionClass).toContain('sm:w-[450px]');

    component.size = 'lg';
    expect(component.panelPositionClass).toContain('sm:w-[600px]');

    component.size = 'full';
    expect(component.panelPositionClass).toContain('w-full');
  });

  it('should emit close event and trigger closing animation when close button is clicked', () => {
    vi.useFakeTimers();
    let closed = false;
    let isOpenEmittedValue: boolean | undefined;

    component.close.subscribe(() => {
      closed = true;
    });
    component.isOpenChange.subscribe((val: boolean) => {
      isOpenEmittedValue = val;
    });

    component.isOpen = true;
    component.ngOnChanges({
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.btn-close');
    closeBtn?.click();
    fixture.detectChanges();

    expect(closed).toBe(true);
    expect(isOpenEmittedValue).toBe(false);
    expect(component.isClosing).toBe(true);

    const backdropOverlay = fixture.nativeElement.querySelector('.bg-black\\/40');
    expect(backdropOverlay?.classList.contains('animate-drawer-backdrop-out')).toBe(true);

    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(component.isRendered).toBe(false);
    expect(component.isClosing).toBe(false);
  });
});
