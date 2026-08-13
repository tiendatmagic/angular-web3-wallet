import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';

import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { LanguageSelectorComponent } from '@shared/components/language-selector/language-selector.component';
import { NetworkSelectorComponent } from '@shared/components/network-selector/network-selector.component';
import { AccountDropdownComponent } from '@shared/components/account-dropdown/account-dropdown.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    RouterModule,
    FormsModule,
    LogoComponent,
    LanguageSelectorComponent,
    NetworkSelectorComponent,
    AccountDropdownComponent,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class HeaderComponent {
  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
}
