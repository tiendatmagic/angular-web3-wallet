import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <main class="max-w-[1530px] mx-auto w-full px-4 sm:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
      <div class="app-card !p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
        <div class="flex items-center gap-3.5 mb-6">
          <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/10">
            <app-icon name="blockchain" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 dark:text-white">Giới thiệu Angular Web3 Wallet</h2>
            <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Giới thiệu về nền tảng và dự án</p>
          </div>
        </div>


      </div>
    </main>
  `
})
export class AboutComponent { }
