import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public readonly themeMode = signal<'light' | 'dark' | 'auto'>('auto');
  public readonly isDarkMode = signal<boolean>(false);
  private mediaQueryList: MediaQueryList | null = null;

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('theme_mode') as 'light' | 'dark' | 'auto' | null;
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryList.addEventListener('change', this.handleSystemThemeChange);

    const mode = savedTheme || 'auto';
    this.themeMode.set(mode);
    const isDark = mode === 'dark' || (mode === 'auto' && this.mediaQueryList.matches);
    
    this.applyDarkClass(isDark, true);
  }

  public applyDarkClass(dark: boolean, isInitial = false) {
    this.isDarkMode.set(dark);
    if (typeof document !== 'undefined') {
      const htmlEl = document.documentElement;
      const bodyEl = document.body;

      if (!isInitial) {
        htmlEl.classList.add('theme-transition-disabled');
      }

      if (dark) {
        htmlEl.classList.add('dark');
        bodyEl.classList.add('dark');
      } else {
        htmlEl.classList.remove('dark');
        bodyEl.classList.remove('dark');
      }

      if (!isInitial) {
        void htmlEl.offsetHeight;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            htmlEl.classList.remove('theme-transition-disabled');
          });
        });
      }
    }
  }

  public setThemeMode(mode: 'light' | 'dark' | 'auto') {
    this.themeMode.set(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme_mode', mode);
    }

    if (mode === 'auto') {
      if (this.mediaQueryList) {
        this.applyDarkClass(this.mediaQueryList.matches);
      }
    } else {
      this.applyDarkClass(mode === 'dark');
    }
  }

  public toggleTheme() {
    const current = this.themeMode();
    if (current === 'light') {
      this.setThemeMode('dark');
    } else if (current === 'dark') {
      this.setThemeMode('auto');
    } else {
      this.setThemeMode('light');
    }
  }

  private handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (this.themeMode() === 'auto') {
      this.applyDarkClass(e.matches);
    }
  };
}
