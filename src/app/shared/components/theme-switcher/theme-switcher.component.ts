import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@core/services/theme.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 leading-tight select-none">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Giao diện</span>
        <span
          [class.text-amber-500]="themeService.themeMode() === 'light'"
          [class.text-indigo-500]="themeService.themeMode() === 'dark'"
          [class.text-purple-500]="themeService.themeMode() === 'auto'"
          class="text-[11px] font-bold"
        >
          {{
            themeService.themeMode() === 'light'
              ? 'Sáng'
              : themeService.themeMode() === 'dark'
                ? 'Tối'
                : 'Tự động'
          }}
        </span>
      </div>
      <div
        class="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-full border border-slate-200/40 dark:border-slate-800/40"
      >
        <button
          (click)="themeService.setThemeMode('light')"
          [class.bg-white]="themeService.themeMode() === 'light'"
          [class.dark:bg-slate-800]="themeService.themeMode() === 'light'"
          [class.text-amber-500]="themeService.themeMode() === 'light'"
          [class.shadow-sm]="themeService.themeMode() === 'light'"
          class="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
          title="Giao diện sáng"
        >
          <app-icon name="sun" class="w-3.5 h-3.5" />
        </button>
        <button
          (click)="themeService.setThemeMode('auto')"
          [class.bg-white]="themeService.themeMode() === 'auto'"
          [class.dark:bg-slate-800]="themeService.themeMode() === 'auto'"
          [class.text-purple-500]="themeService.themeMode() === 'auto'"
          [class.shadow-sm]="themeService.themeMode() === 'auto'"
          class="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
          title="Tự động theo hệ thống"
        >
          <app-icon name="auto" class="w-3.5 h-3.5" />
        </button>
        <button
          (click)="themeService.setThemeMode('dark')"
          [class.bg-white]="themeService.themeMode() === 'dark'"
          [class.dark:bg-slate-800]="themeService.themeMode() === 'dark'"
          [class.text-indigo-500]="themeService.themeMode() === 'dark'"
          [class.shadow-sm]="themeService.themeMode() === 'dark'"
          class="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
          title="Giao diện tối"
        >
          <app-icon name="moon" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitcherComponent {
  public themeService = inject(ThemeService);
}
