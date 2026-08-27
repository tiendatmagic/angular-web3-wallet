import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';

describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;
  let stateService: StateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeSwitcherComponent],
      providers: [StateService, TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(StateService);
    fixture.detectChanges();
  });

  it('renders 3 theme toggle buttons and the sliding pill', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);

    const pill = fixture.nativeElement.querySelector('.theme-switcher-pill');
    expect(pill).toBeTruthy();
    expect(pill.classList.contains('transform-gpu')).toBe(true);
  });

  it('computes correct transform for each theme mode', () => {
    stateService.setThemeMode('light');
    fixture.detectChanges();
    expect(component.pillTransform()).toBe('translateX(0%)');

    stateService.setThemeMode('auto');
    fixture.detectChanges();
    expect(component.pillTransform()).toBe('translateX(100%)');

    stateService.setThemeMode('dark');
    fixture.detectChanges();
    expect(component.pillTransform()).toBe('translateX(200%)');
  });

  it('updates theme mode when buttons are clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');

    buttons[0].click();
    fixture.detectChanges();
    expect(stateService.themeMode()).toBe('light');

    buttons[1].click();
    fixture.detectChanges();
    expect(stateService.themeMode()).toBe('auto');

    buttons[2].click();
    fixture.detectChanges();
    expect(stateService.themeMode()).toBe('dark');
  });

  it('highlights the active button with primary color and heavier stroke', () => {
    stateService.setThemeMode('light');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].classList.contains('text-primary')).toBe(true);
    expect(buttons[1].classList.contains('text-slate-400')).toBe(true);
    expect(buttons[2].classList.contains('text-slate-400')).toBe(true);
  });
});
