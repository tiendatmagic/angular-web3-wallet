import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';

import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { NetworkSelectorComponent } from '@shared/components/network-selector/network-selector.component';
import { AccountDropdownComponent } from '@shared/components/account-dropdown/account-dropdown.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IconComponent,
    BadgeComponent,
    RouterModule,
    FormsModule,
    LogoComponent,
    LanguageSelectorComponent,
    NetworkSelectorComponent,
    AccountDropdownComponent,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
  host: {
    class: 'contents',
  },
})
export class HeaderComponent {
  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
}
