import { Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-logo',
  imports: [IconComponent],
  template: `
    <div class="relative w-full h-full flex items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary/15 p-[9%] border border-secondary/20 group">
      <div class="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-sm group-hover:blur-md transition-all"></div>
      <app-icon
        name="logo"
        viewBox="0 0 100 100"
        class="w-full h-full text-secondary relative z-10 animate-[spin_20s_linear_infinite] hover:animate-[spin_5s_linear_infinite] transition-all"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]})
export class LogoComponent {}
