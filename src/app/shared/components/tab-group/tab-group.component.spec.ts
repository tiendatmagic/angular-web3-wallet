import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabGroupComponent, TabOption } from './tab-group.component';

describe('TabGroupComponent', () => {
  let component: TabGroupComponent;
  let fixture: ComponentFixture<TabGroupComponent>;

  const mockOptions: TabOption[] = [
    { value: 'tab1', label: 'Tab 1', icon: 'wallet', badge: 'New' },
    { value: 'tab2', label: 'Tab 2', dotClass: 'bg-emerald-500' },
    { value: 'tab3', label: 'Tab 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabGroupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    component.activeValue = 'tab1';
    fixture.detectChanges();
  });

  it('creates the component and renders tabs', () => {
    expect(component).toBeTruthy();
    const buttons = fixture.nativeElement.querySelectorAll('.tab-item');
    expect(buttons.length).toBe(3);
  });

  it('renders tab-group-pill with dark mode elevation classes', () => {
    const pill = fixture.nativeElement.querySelector('.tab-group-pill');
    expect(pill).toBeTruthy();
    expect(pill.classList.contains('bg-white')).toBe(true);
    expect(pill.classList.contains('dark:bg-slate-800')).toBe(true);
    expect(pill.classList.contains('dark:border-slate-700/50')).toBe(true);
  });

  it('computes activeIndex correctly', () => {
    expect(component.activeIndex).toBe(0);
    component.activeValue = 'tab2';
    expect(component.activeIndex).toBe(1);
    component.activeValue = 'non-existent';
    expect(component.activeIndex).toBe(-1);
  });

  it('emits valueChange when a tab is clicked', () => {
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.tab-item');

    buttons[1].click();
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith('tab2');
    expect(component.activeValue).toBe('tab2');
  });

  it('does not re-emit if the currently active tab is clicked', () => {
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.tab-item');

    buttons[0].click();
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('renders badge and icon if defined in option', () => {
    const firstTab = fixture.nativeElement.querySelectorAll('.tab-item')[0];
    const icon = firstTab.querySelector('app-icon');
    expect(icon).toBeTruthy();

    const badge = firstTab.querySelector('span.text-\\[10px\\]');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('New');
  });
});
