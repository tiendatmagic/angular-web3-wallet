import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';
import { TranslationService } from '../../../core/services/translation.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  it('should create the component with default inputs', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.type).toBe('info');
    expect(component.variant).toBe('soft');
    expect(component.size).toBe('md');
    expect(component.dismissible).toBe(true);
    expect(component.isDismissed).toBe(false);
  });

  it('should render title and message properly', () => {
    component.title = 'Test Title';
    component.message = 'Test message content';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Title');
    expect(compiled.textContent).toContain('Test message content');
  });

  it('should support size sm and md with appropriate classes', () => {
    component.size = 'sm';
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    let contentDiv = compiled.querySelector('.flex-1');
    expect(contentDiv?.classList.contains('text-xs')).toBe(true);

    component.size = 'md';
    fixture.detectChanges();

    contentDiv = compiled.querySelector('.flex-1');
    expect(contentDiv?.classList.contains('text-xs')).toBe(true);
  });

  it('should return correct defaultIcon for each type', () => {
    component.type = 'info';
    expect(component.defaultIcon).toBe('info');

    component.type = 'success';
    expect(component.defaultIcon).toBe('check');

    component.type = 'warning';
    expect(component.defaultIcon).toBe('warning');

    component.type = 'error';
    expect(component.defaultIcon).toBe('close');

    component.iconName = 'custom-icon';
    expect(component.defaultIcon).toBe('custom-icon');
  });

  it('should handle dismiss close button click', () => {
    const closeSpy = vi.spyOn(component.close, 'emit');
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('button[aria-label]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.click();
    fixture.detectChanges();

    expect(component.isDismissed).toBe(true);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should not render dismiss button when dismissible is false', () => {
    component.dismissible = false;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('button');
    expect(closeBtn).toBeNull();
  });
});
