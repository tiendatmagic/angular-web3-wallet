import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal DOM when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const modalEl = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalEl).toBeNull();
  });

  it('should render modal with animate-modal-in and animate-modal-backdrop-in when isOpen is true', () => {
    component.isOpen = true;
    component.title = 'Test Modal Dialog';
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.animate-modal-backdrop-in');
    expect(backdrop).toBeTruthy();
    expect(backdrop?.classList.contains('bg-black/40')).toBe(true);

    const dialog = fixture.nativeElement.querySelector('.glass-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog?.classList.contains('animate-modal-in')).toBe(true);
    expect(dialog?.classList.contains('rounded-[15px]')).toBe(true);

    const titleEl = fixture.nativeElement.querySelector('h3');
    expect(titleEl?.textContent?.trim()).toBe('Test Modal Dialog');
  });

  it('should apply correct size class based on size input', () => {
    expect(component.getSizeClass()).toBe('max-w-md');

    component.size = 'lg';
    expect(component.getSizeClass()).toBe('max-w-lg');

    component.size = 'xl';
    expect(component.getSizeClass()).toBe('max-w-xl');

    component.size = 'sm';
    expect(component.getSizeClass()).toBe('max-w-sm');

    component.size = '2xl';
    expect(component.getSizeClass()).toBe('max-w-2xl');
  });

  it('should emit close event when clicking close button or backdrop', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.isOpen = true;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.btn-close');
    closeBtn?.click();
    expect(closed).toBe(true);
  });
});
