import {
  Component,
  inject,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  signal,
  effect,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService, ThemeMode } from '@core/services/state.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './theme-switcher.component.html',
  host: {
    'class': 'block',
    '(window:resize)': 'onResize()'
  },
})
export class ThemeSwitcherComponent implements AfterViewInit, OnDestroy {
  public stateService = inject(StateService);

  @ViewChild('containerEl') containerEl!: ElementRef<HTMLDivElement>;
  @ViewChildren('themeBtn') themeButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  public readonly sliderStyle = signal<{ left: string; width: string; ready: boolean }>({
    left: '0px',
    width: '0px',
    ready: false
  });

  private resizeObserver?: ResizeObserver;
  private readonly modes: ThemeMode[] = ['light', 'auto', 'dark'];

  constructor() {
    effect(() => {
      this.stateService.themeMode();
      setTimeout(() => this.updateSliderPosition(), 0);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateSliderPosition(), 20);
    setTimeout(() => this.updateSliderPosition(), 100);

    if (this.themeButtons) {
      this.themeButtons.changes.subscribe(() => {
        this.updateSliderPosition();
      });
    }

    if (typeof ResizeObserver !== 'undefined' && this.containerEl) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateSliderPosition();
      });
      this.resizeObserver.observe(this.containerEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  onResize(): void {
    this.updateSliderPosition();
  }

  public setTheme(mode: ThemeMode): void {
    this.stateService.setThemeMode(mode);
    this.updateSliderPosition();
  }

  public updateSliderPosition(): void {
    if (!this.themeButtons || !this.containerEl) return;

    const buttons = this.themeButtons.toArray();
    const currentMode = this.stateService.themeMode();
    const activeIdx = this.modes.indexOf(currentMode);

    if (activeIdx !== -1 && buttons[activeIdx]) {
      const activeEl = buttons[activeIdx].nativeElement;
      const nextLeft = `${activeEl.offsetLeft}px`;
      const nextWidth = `${activeEl.offsetWidth}px`;

      const current = this.sliderStyle();
      if (current.left !== nextLeft || current.width !== nextWidth || !current.ready) {
        this.sliderStyle.set({ left: nextLeft, width: nextWidth, ready: true });
      }
    }
  }
}



