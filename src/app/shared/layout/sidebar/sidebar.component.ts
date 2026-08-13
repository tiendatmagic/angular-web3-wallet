import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ThemeSwitcherComponent } from '@shared/components/theme-switcher/theme-switcher.component';
import { TxSpeedSelectorComponent } from '@shared/components/tx-speed-selector/tx-speed-selector.component';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

export interface NavItem {
  readonly labelKey: string;
  readonly path: string;
  readonly icon: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    LogoComponent,
    ThemeSwitcherComponent,
    TxSpeedSelectorComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './sidebar.component.html',
  styles: [
    `
      :host {
        display: contents;
      }

      .mobile-menu-shell {
        visibility: hidden;
        pointer-events: none;
        transition: visibility 0s linear 300ms;
      }

      .mobile-menu-shell--open {
        visibility: visible;
        pointer-events: auto;
        transition-delay: 0s;
      }

      .mobile-menu-backdrop {
        opacity: 0;
        pointer-events: none;
        transition: opacity 300ms ease-in-out;
      }

      .mobile-menu-backdrop--open {
        opacity: 1;
        pointer-events: auto;
      }

      .mobile-menu-panel {
        transform: translateX(-100%);
        pointer-events: none;
        transition: transform 300ms ease-in-out;
      }

      .mobile-menu-panel--open {
        transform: translateX(0);
        pointer-events: auto;
      }
    `,
  ],
})
export class SidebarComponent {
  public stateService = inject(StateService);
  public translationService = inject(TranslationService);

  public readonly navItems: readonly NavItem[] = [
    { labelKey: 'nav.home', path: '/home', icon: 'home', exact: true },
    { labelKey: 'nav.about', path: '/about', icon: 'info' },
    { labelKey: 'nav.contact', path: '/contact', icon: 'send' },
  ];
}
