import { Component, inject, computed } from '@angular/core';
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
    'class': 'block'
  }
})
export class ThemeSwitcherComponent {
  public stateService = inject(StateService);

  public readonly pillTransform = computed<string>(() => {
    const mode = this.stateService.themeMode();
    if (mode === 'light') return 'translateX(0%)';
    if (mode === 'auto') return 'translateX(100%)';
    return 'translateX(200%)';
  });

  public setTheme(mode: ThemeMode): void {
    this.stateService.setThemeMode(mode);
  }
}
