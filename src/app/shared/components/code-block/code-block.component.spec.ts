import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeBlockComponent, CodeFile } from './code-block.component';
import { TranslationService } from '../../../core/services/translation.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CodeBlockComponent', () => {
  let component: CodeBlockComponent;
  let fixture: ComponentFixture<CodeBlockComponent>;

  const mockFiles: CodeFile[] = [
    {
      name: 'web3.service.ts',
      language: 'typescript',
      code: `const service = "web3";`,
      highlightLines: [1]
    },
    {
      name: 'wallet.component.html',
      language: 'html',
      code: `<div class="wallet"></div>`
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBlockComponent],
      providers: [TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeBlockComponent);
    component = fixture.componentInstance;
  });

  it('should create the component for single code file', () => {
    component.code = 'const greeting = "hello";';
    component.fileName = 'main.ts';
    component.language = 'typescript';
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentFileName()).toBe('main.ts');
    expect(component.currentLanguage()).toBe('typescript');
    expect(component.lineList().length).toBe(1);
  });

  it('should handle multi-file tabs and switch active file correctly', () => {
    component.files = mockFiles;
    fixture.detectChanges();

    expect(component.activeIndex()).toBe(0);
    expect(component.currentFileName()).toBe('web3.service.ts');
    expect(component.currentCode()).toBe('const service = "web3";');

    component.selectTab(1);
    fixture.detectChanges();

    expect(component.activeIndex()).toBe(1);
    expect(component.currentFileName()).toBe('wallet.component.html');
    expect(component.currentCode()).toBe('<div class="wallet"></div>');
    expect(component.currentLanguage()).toBe('html');
  });

  it('should toggle wrap lines and collapse state', () => {
    expect(component.isWrapped()).toBe(false);
    component.toggleWrap();
    expect(component.isWrapped()).toBe(true);

    expect(component.isCollapsed()).toBe(false);
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
  });

  it('should trigger copied state when copyCode is called', () => {
    component.code = 'const x = 10;';
    fixture.detectChanges();

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    component.copyCode();
    expect(component.copied()).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('const x = 10;');
  });
});
