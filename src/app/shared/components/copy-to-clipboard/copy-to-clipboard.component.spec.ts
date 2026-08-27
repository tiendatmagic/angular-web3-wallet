import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyToClipboardComponent } from './copy-to-clipboard.component';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CopyToClipboardComponent', () => {
  let component: CopyToClipboardComponent;
  let fixture: ComponentFixture<CopyToClipboardComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyToClipboardComponent],
      providers: [ToastService, TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(CopyToClipboardComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
  });

  it('should create the component with default inputs', () => {
    component.textToCopy = '0x123456';
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.copied).toBe(false);
    expect(component.size).toBe('md');
    expect(component.showToast).toBe(true);
  });

  it('should render label when label input is provided', () => {
    component.textToCopy = '0x123456';
    component.label = 'Sao chép ví';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sao chép ví');
  });

  it('should copy text to clipboard and trigger success toast', async () => {
    component.textToCopy = '0xabcdef123456';
    fixture.detectChanges();

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    const toastSpy = vi.spyOn(toastService, 'success');

    await component.copy();

    expect(mockWriteText).toHaveBeenCalledWith('0xabcdef123456');
    expect(component.copied).toBe(true);
    expect(toastSpy).toHaveBeenCalled();
  });

  it('should not copy if textToCopy is empty', async () => {
    component.textToCopy = '';
    fixture.detectChanges();

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    await component.copy();

    expect(mockWriteText).not.toHaveBeenCalled();
    expect(component.copied).toBe(false);
  });

  it('should apply custom successMessage if provided', async () => {
    component.textToCopy = '0x999';
    component.successMessage = 'Custom copied message';
    fixture.detectChanges();

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    const toastSpy = vi.spyOn(toastService, 'success');

    await component.copy();

    expect(toastSpy).toHaveBeenCalledWith('Custom copied message');
  });
});
