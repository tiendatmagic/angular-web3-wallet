import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '@core/services/state.service';
import { TabGroupComponent, TabOption } from '@shared/components/tab-group/tab-group.component';

@Component({
  selector: 'app-tx-speed-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, TabGroupComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tốc độ giao dịch</span>
        @if (stateService.txSpeed() === 'fast') {
          <span class="text-[10px] font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-md">1.5x Phí</span>
        } @else if (stateService.txSpeed() === 'custom') {
          <span class="text-[10px] font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-md">{{ stateService.gasMultiplier() }}x Phí</span>
        }
      </div>
      
      <!-- Segmented Control sử dụng Tab Group -->
      <app-tab-group
        [options]="speedOptions"
        [activeValue]="stateService.txSpeed()"
        (valueChange)="stateService.txSpeed.set($event)"
      ></app-tab-group>

      <!-- Trường nhập hệ số nhân -->
      @if (stateService.txSpeed() === 'custom') {
        <div class="mt-3 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl px-4 py-2.5 text-xs font-bold">
          <span class="text-slate-400 uppercase tracking-wider">Hệ số nhân:</span>
          <div class="flex items-center gap-1">
            <input 
              type="number" 
              step="0.1"
              min="1"
              max="10"
              [ngModel]="stateService.gasMultiplier()"
              (ngModelChange)="stateService.gasMultiplier.set($event)"
              class="w-12 bg-transparent text-right font-black focus:outline-none text-slate-800 dark:text-white"
            />
            <span class="text-slate-400">x</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]})
export class TxSpeedSelectorComponent {
  public stateService = inject(StateService);

  public readonly speedOptions: TabOption[] = [
    { value: 'default', label: 'Mặc định' },
    { value: 'fast', label: 'Nhanh' },
    { value: 'custom', label: 'Tùy chọn' }
  ];
}
