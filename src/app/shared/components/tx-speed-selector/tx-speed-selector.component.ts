import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';
import { TabGroupComponent, TabOption } from '@shared/components/tab-group/tab-group.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-tx-speed-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TabGroupComponent, BadgeComponent, TranslatePipe],
  templateUrl: './tx-speed-selector.component.html',
  host: { 'class': 'block' },
})
export class TxSpeedSelectorComponent {
  public stateService = inject(StateService);
  private translationService = inject(TranslationService);

  public readonly speedOptions = computed<TabOption[]>(() => [
    { value: 'default', label: this.translationService.t('tx_speed.default') },
    { value: 'fast', label: this.translationService.t('tx_speed.fast') },
    { value: 'custom', label: this.translationService.t('tx_speed.custom') }
  ]);
}

