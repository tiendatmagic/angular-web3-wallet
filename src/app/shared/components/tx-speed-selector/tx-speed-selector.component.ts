import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-tx-speed-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tốc độ giao dịch</span>
        @if (web3Service.txSpeed() === 'fast') {
          <span class="text-[10px] font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-md">1.5x Phí</span>
        } @else if (web3Service.txSpeed() === 'custom') {
          <span class="text-[10px] font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-md">{{ web3Service.gasMultiplier() }}x Phí</span>
        }
      </div>
      
      <!-- Segmented Control -->
      <div class="grid grid-cols-3 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
        <button
          (click)="web3Service.txSpeed.set('default')"
          [class.bg-white]="web3Service.txSpeed() === 'default'"
          [class.dark:bg-slate-800]="web3Service.txSpeed() === 'default'"
          [class.text-slate-800]="web3Service.txSpeed() === 'default'"
          [class.dark:text-white]="web3Service.txSpeed() === 'default'"
          [class.shadow-sm]="web3Service.txSpeed() === 'default'"
          class="py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer text-xs font-bold"
        >
          Mặc định
        </button>
        <button
          (click)="web3Service.txSpeed.set('fast')"
          [class.bg-white]="web3Service.txSpeed() === 'fast'"
          [class.dark:bg-slate-800]="web3Service.txSpeed() === 'fast'"
          [class.text-slate-800]="web3Service.txSpeed() === 'fast'"
          [class.dark:text-white]="web3Service.txSpeed() === 'fast'"
          [class.shadow-sm]="web3Service.txSpeed() === 'fast'"
          class="py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer text-xs font-bold"
        >
          Nhanh
        </button>
        <button
          (click)="web3Service.txSpeed.set('custom')"
          [class.bg-white]="web3Service.txSpeed() === 'custom'"
          [class.dark:bg-slate-800]="web3Service.txSpeed() === 'custom'"
          [class.text-slate-800]="web3Service.txSpeed() === 'custom'"
          [class.dark:text-white]="web3Service.txSpeed() === 'custom'"
          [class.shadow-sm]="web3Service.txSpeed() === 'custom'"
          class="py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer text-xs font-bold"
        >
          Tùy chọn
        </button>
      </div>

      <!-- Trường nhập hệ số nhân -->
      @if (web3Service.txSpeed() === 'custom') {
        <div class="mt-3 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl px-4 py-2.5 text-xs font-bold">
          <span class="text-slate-400 uppercase tracking-wider">Hệ số nhân:</span>
          <div class="flex items-center gap-1">
            <input 
              type="number" 
              step="0.1"
              min="1"
              max="10"
              [ngModel]="web3Service.gasMultiplier()"
              (ngModelChange)="web3Service.gasMultiplier.set($event)"
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TxSpeedSelectorComponent {
  public web3Service = inject(Web3Service);
}
