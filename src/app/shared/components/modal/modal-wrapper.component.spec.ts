import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalWrapperComponent } from './modal-wrapper.component';
import { ModalRef } from '@core/services/modal-ref';
import { TranslationService } from '@core/services/translation.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('ModalWrapperComponent', () => {
  let component: ModalWrapperComponent;
  let fixture: ComponentFixture<ModalWrapperComponent>;
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockClose = vi.fn();
    const mockModalRef = { close: mockClose } as unknown as ModalRef;

    await TestBed.configureTestingModule({
      imports: [ModalWrapperComponent],
      providers: [
        TranslationService,
        { provide: ModalRef, useValue: mockModalRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render dialog with animate-modal-in and backdrop with animate-modal-backdrop-in', () => {
    component.title = 'Dynamic Wrapper Modal';
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.animate-modal-backdrop-in');
    expect(backdrop).toBeTruthy();
    expect(backdrop?.classList.contains('bg-black/40')).toBe(true);

    const dialog = fixture.nativeElement.querySelector('.glass-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog?.classList.contains('animate-modal-in')).toBe(true);
    expect(dialog?.classList.contains('rounded-[15px]')).toBe(true);
  });

  it('should trigger close on backdrop click when closeOnBackdropClick is true', () => {
    component.closeOnBackdropClick = true;
    fixture.detectChanges();

    component.onBackdropClick();
    expect(mockClose).toHaveBeenCalled();
  });

  it('should not trigger close on backdrop click when closeOnBackdropClick is false', () => {
    component.closeOnBackdropClick = false;
    fixture.detectChanges();

    component.onBackdropClick();
    expect(mockClose).not.toHaveBeenCalled();
  });
});
