import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-theme-switcher',
  
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 leading-tight select-none">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Giao diện</span>
        <span
          [class.text-amber-500]="stateService.themeMode() === 'light'"
          [class.text-indigo-500]="stateService.themeMode() === 'dark'"
          [class.text-purple-500]="stateService.themeMode() === 'auto'"
          class="text-[11px] font-bold"
        >
          {{
            stateService.themeMode() === 'light'
              ? 'Sáng'
              : stateService.themeMode() === 'dark'
                ? 'Tối'
                : 'Tự động'
          }}
        </span>
      </div>
      <div
        class="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-full border border-slate-200/40 dark:border-slate-800/40"
      >
        <button
          (click)="stateService.setThemeMode('light')"
          [class.bg-white]="stateService.themeMode() === 'light'"
          [class.dark:bg-slate-800]="stateService.themeMode() === 'light'"
          [class.text-amber-500]="stateService.themeMode() === 'light'"
          [class.shadow-sm]="stateService.themeMode() === 'light'"
          class="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
          title="Giao diện sáng"
        >
          <app-icon name="sun" class="w-3.5 h-3.5" />
        </button>
        <button
          (click)="stateService.setThemeMode('auto')"
          [class.bg-white]="stateService.themeMode() === 'auto'"
          [class.dark:bg-slate-800]="stateService.themeMode() === 'auto'"
          [class.text-purple-500]="stateService.themeMode() === 'auto'"
          [class.shadow-sm]="stateService.themeMode() === 'auto'"
          class="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
          title="Tự động theo hệ thống"
        >
          <app-icon name="auto" class="w-3.5 h-3.5" />
        </button>
        <button
          (click)="stateService.setThemeMode('dark')"
          [class.bg-white]="stateService.themeMode() === 'dark'"
          [class.dark:bg-slate-800]="stateService.themeMode() === 'dark'"
          [class.text-indigo-500]="stateService.themeMode() === 'dark'"
          [class.shadow-sm]="stateService.themeMode() === 'dark'"
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
  })
export class ThemeSwitcherComponent {
  public stateService = inject(StateService);
}
