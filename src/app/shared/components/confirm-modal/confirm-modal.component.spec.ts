import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { TranslationService } from '@core/services/translation.service';
import { MODAL_DATA, ModalRef } from '@core/services/modal-ref';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  describe('Non-dynamic template mode', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ConfirmModalComponent],
        providers: [
          TranslationService,
          { provide: ModalRef, useValue: null },
          { provide: MODAL_DATA, useValue: null }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ConfirmModalComponent);
      component = fixture.componentInstance;
    });

    it('should create the component in non-dynamic mode', () => {
      expect(component).toBeTruthy();
      expect(component.isDynamic).toBe(false);
    });

    it('should render modal with animate-modal-in and animate-modal-backdrop-in when isOpen is true', () => {
      component.isOpen = true;
      component.title = 'Xác nhận hành động';
      component.description = 'Bạn có chắc chắn muốn thực hiện?';
      fixture.detectChanges();

      const backdrop = fixture.nativeElement.querySelector('.animate-modal-backdrop-in');
      expect(backdrop).toBeTruthy();

      const dialog = fixture.nativeElement.querySelector('.glass-dialog');
      expect(dialog).toBeTruthy();
      expect(dialog?.classList.contains('animate-modal-in')).toBe(true);
      expect(dialog?.classList.contains('rounded-[15px]')).toBe(true);
    });

    it('should emit confirm and cancel events on user action', () => {
      let confirmed = false;
      let cancelled = false;

      component.confirm.subscribe(() => (confirmed = true));
      component.cancel.subscribe(() => (cancelled = true));

      component.isOpen = true;
      fixture.detectChanges();

      component.onConfirm();
      expect(confirmed).toBe(true);

      component.onCancel();
      expect(cancelled).toBe(true);
    });
  });

  describe('Dynamic modal mode', () => {
    let mockClose: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      mockClose = vi.fn();
      const mockModalRef = { close: mockClose } as unknown as ModalRef<boolean>;

      await TestBed.configureTestingModule({
        imports: [ConfirmModalComponent],
        providers: [
          TranslationService,
          { provide: ModalRef, useValue: mockModalRef },
          {
            provide: MODAL_DATA,
            useValue: {
              title: 'Dynamic Confirm Title',
              description: 'Dynamic Confirm Description',
              confirmButtonClass: 'btn-danger'
            }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ConfirmModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize with dynamic modal data', () => {
      expect(component.isDynamic).toBe(true);
      expect(component.title).toBe('Dynamic Confirm Title');
      expect(component.confirmVariant).toBe('danger');
    });

    it('should close ModalRef with true on confirm', () => {
      component.onConfirm();
      expect(mockClose).toHaveBeenCalledWith(true);
    });

    it('should close ModalRef with false on cancel', () => {
      component.onCancel();
      expect(mockClose).toHaveBeenCalledWith(false);
    });
  });
});
