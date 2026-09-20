import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render with default variant and size classes', () => {
    expect(component).toBeTruthy();
    expect(element.classList.contains('btn')).toBe(true);
    expect(element.classList.contains('btn-primary')).toBe(true);
    expect(element.classList.contains('btn-md')).toBe(true);
    expect(element.hasAttribute('disabled')).toBe(false);
    expect(element.classList.contains('pointer-events-none')).toBe(false);
  });

  it('should update classes when variant changes', () => {
    const variants = [
      'secondary',
      'danger',
      'danger-light',
      'cancel',
      'ghost',
      'success',
      'info',
      'reload',
      'outline',
    ] as const;

    for (const variant of variants) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      expect(element.classList.contains(`btn-${variant}`)).toBe(true);
    }
  });

  it('should update classes when size changes', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(element.classList.contains('btn-sm')).toBe(true);

    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(element.classList.contains('btn-lg')).toBe(true);
  });

  it('should handle disabled state properly', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(element.hasAttribute('disabled')).toBe(true);
    expect(element.classList.contains('pointer-events-none')).toBe(true);
  });

  it('should handle loading state and render spinner', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(element.hasAttribute('disabled')).toBe(true);
    expect(element.classList.contains('pointer-events-none')).toBe(true);

    const spinner = element.querySelector('app-icon');
    expect(spinner).toBeTruthy();
  });
});
