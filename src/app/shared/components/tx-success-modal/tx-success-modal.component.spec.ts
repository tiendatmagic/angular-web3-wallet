import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSuccessModalComponent } from './tx-success-modal.component';
import { TranslationService } from '@core/services/translation.service';
import { MODAL_DATA, ModalRef } from '@core/services/modal-ref';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TxSuccessModalComponent', () => {
  let component: TxSuccessModalComponent;
  let fixture: ComponentFixture<TxSuccessModalComponent>;
  let mockModalRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockModalRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TxSuccessModalComponent],
      providers: [
        TranslationService,
        { provide: ModalRef, useValue: mockModalRef },
        {
          provide: MODAL_DATA,
          useValue: {
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            amount: '0.01',
            symbol: 'tBNB',
            toAddress: '0x81Ff13bc4f510789a865C413ccE547169f984D7e',
            chainId: 97,
            networkName: 'BNB Smart Chain Testnet'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TxSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data from MODAL_DATA correctly', () => {
    expect(component.txHash()).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    expect(component.amount()).toBe('0.01');
    expect(component.symbol()).toBe('tBNB');
    expect(component.toAddress()).toBe('0x81Ff13bc4f510789a865C413ccE547169f984D7e');
    expect(component.networkName()).toBe('BNB Smart Chain Testnet');
  });

  it('should render transaction hash and details in DOM', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('0.01');
    expect(compiled.textContent).toContain('tBNB');
    expect(compiled.textContent).toContain('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  });

  it('should close the modal when close() is invoked', () => {
    component.close();
    expect(mockModalRef.close).toHaveBeenCalled();
  });

  it('should trigger copyTxHash and set isCopied state', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
    component.copyTxHash();
    await Promise.resolve();
    expect(component.isCopied()).toBe(true);
  });
});
