import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CardComponent } from '@shared/components/card/card.component';
import { CustomInputComponent } from '@shared/components/custom-input/custom-input.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    CardComponent,
    CustomInputComponent,
    TranslatePipe
  ],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private stateService = inject(StateService);
  private translationService = inject(TranslationService);

  public email = signal('');
  public message = signal('');

  public sendMessage(): void {
    this.stateService.showToast(this.translationService.t('contact.success_toast'), 'success');
    this.email.set('');
    this.message.set('');
  }
}
