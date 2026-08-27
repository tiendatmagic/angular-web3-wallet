import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteConfirmModalComponent } from './delete-confirm-modal.component';
import { TranslationService } from '@core/services/translation.service';
import { MODAL_DATA, ModalRef } from '@core/services/modal-ref';
import { DeleteConfirmModalData } from './delete-confirm-modal.types';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('DeleteConfirmModalComponent', () => {
  let component: DeleteConfirmModalComponent;
  let fixture: ComponentFixture<DeleteConfirmModalComponent>;
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockClose = vi.fn();
    const mockModalRef = { close: mockClose } as unknown as ModalRef;

    const testModalData: DeleteConfirmModalData = {
      title: 'Xác Nhận Xóa Dữ Liệu',
      itemName: 'Smart Contract NFT #1024',
      itemType: 'ERC-721 Token',
      requireConfirmationText: true,
      confirmationKeyword: 'CONFIRM_DELETE'
    };

    await TestBed.configureTestingModule({
      imports: [DeleteConfirmModalComponent],
      providers: [
        TranslationService,
        { provide: ModalRef, useValue: mockModalRef },
        { provide: MODAL_DATA, useValue: testModalData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.isDynamic).toBe(true);
    expect(component.itemName()).toBe('Smart Contract NFT #1024');
  });

  it('should validate confirmation keyword', () => {
    expect(component.requireConfirmationText()).toBe(true);
    expect(component.isKeywordMatched()).toBe(false);
    expect(component.isValid()).toBe(false);

    component.confirmInputText.set('wrong_keyword');
    expect(component.isKeywordMatched()).toBe(false);
    expect(component.isValid()).toBe(false);

    component.confirmInputText.set('CONFIRM_DELETE');
    expect(component.isKeywordMatched()).toBe(true);
    expect(component.isValid()).toBe(true);
  });

  it('should close with null on cancel', () => {
    component.cancel();
    expect(mockClose).toHaveBeenCalled();
  });

  it('should apply form-label class to keyword label and target item label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const targetItemLabel = compiled.querySelector('.form-label');
    expect(targetItemLabel).toBeTruthy();

    const keywordLabel = compiled.querySelector('label.form-label');
    expect(keywordLabel).toBeTruthy();
    expect(keywordLabel?.classList.contains('form-label')).toBe(true);
  });
});
