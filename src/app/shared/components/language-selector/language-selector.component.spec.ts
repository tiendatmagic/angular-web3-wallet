import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LanguageSelectorComponent } from './language-selector.component';
import { TranslationService } from '@core/services/translation.service';
import { StateService } from '@core/services/state.service';
import { DropdownService } from '@core/services/dropdown.service';
import { Web3Service } from '@core/services/web3.service';
import { describe, it, expect, beforeEach } from 'vitest';

const web3ServiceMock = {
  isEnabled: false,
  address: signal<string | null>(null),
  chainId: signal<number | null>(null),
  isConnected: signal(false),
  balance: signal('0.0000'),
  networkName: signal(''),
  isWrongChain: signal(false),
  chainSymbol: signal('ETH'),
  txSpeed: signal<'default' | 'fast' | 'custom'>('default'),
  gasMultiplier: signal(2),
  showWrongChainModal: signal(false),
  configuredChainId: signal('42161'),
  POPULAR_CHAINS: [],
  connect: async () => {},
  openNetworkModal: async () => {},
  openAccountModal: async () => {},
  disconnect: async () => {},
  switchNetwork: async () => {},
  getSigner: async () => null,
  getProvider: () => null,
  getGasOverrides: async () => ({})
};

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let translationService: TranslationService;
  let dropdownService: DropdownService;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
      })
    });

    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent],
      providers: [
        TranslationService,
        StateService,
        DropdownService,
        { provide: Web3Service, useValue: web3ServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    translationService = TestBed.inject(TranslationService);
    dropdownService = TestBed.inject(DropdownService);
  });

  it('should create the component with default compact variant', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.variant).toBe('compact');
    expect(component.isOpen()).toBe(false);

    const container = fixture.nativeElement.querySelector('div');
    expect(container.classList.contains('inline-block')).toBe(true);

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should render full variant with w-full layout and native language name', () => {
    component.variant = 'full';
    fixture.detectChanges();

    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.classList.contains('w-full')).toBe(true);

    const container = hostElement.querySelector('div');
    expect(container?.classList.contains('w-full')).toBe(true);

    const button = hostElement.querySelector('button');
    expect(button?.classList.contains('w-full')).toBe(true);

    const currentNativeName = translationService.getCurrentLanguageOption().nativeName;
    expect(button?.textContent).toContain(currentNativeName);
  });

  it('should toggle dropdown on button click and show popover menu', () => {
    component.variant = 'full';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.dropdown-menu-popover')).toBeNull();

    button.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    const popover = fixture.nativeElement.querySelector('.dropdown-menu-popover');
    expect(popover).toBeTruthy();
    expect(popover.classList.contains('min-w-[220px]')).toBe(true);
  });

  it('should change language and close dropdown when an option is selected', () => {
    translationService.currentLang.set('vi');
    component.variant = 'full';
    fixture.detectChanges();

    component.toggleDropdown(new MouseEvent('click'));
    fixture.detectChanges();

    const optionButtons = fixture.nativeElement.querySelectorAll('.dropdown-menu-popover button') as NodeListOf<HTMLButtonElement>;
    expect(optionButtons.length).toBeGreaterThanOrEqual(2);

    optionButtons[1].click();
    fixture.detectChanges();

    expect(translationService.currentLang()).toBe('en');
    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.dropdown-menu-popover')).toBeNull();
  });

  it('should close dropdown on escape key press', () => {
    component.isOpen.set(true);
    dropdownService.open(component.instanceId);
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    component.onEscape();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });
});
