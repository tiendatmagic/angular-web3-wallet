import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { TabGroupComponent, TabOption } from '@shared/components/tab-group/tab-group.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, TabGroupComponent],
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Giao diện</span>
        <span
          [class.text-amber-500]="stateService.themeMode() === 'light'"
          [class.text-indigo-500]="stateService.themeMode() === 'dark'"
          [class.text-purple-500]="stateService.themeMode() === 'auto'"
          class="text-[10px] font-black uppercase tracking-wider"
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
      
      <app-tab-group
        [options]="themeOptions"
        [activeValue]="stateService.themeMode()"
        (valueChange)="stateService.setThemeMode($event)"
      ></app-tab-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]})
export class ThemeSwitcherComponent {
  public stateService = inject(StateService);

  public readonly themeOptions: TabOption[] = [
    { value: 'light', label: 'Sáng', icon: 'sun' },
    { value: 'auto', label: 'Tự động', icon: 'auto' },
    { value: 'dark', label: 'Tối', icon: 'moon' }
  ];
}
