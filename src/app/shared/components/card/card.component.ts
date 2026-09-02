import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card, [app-card]',
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '[class.app-card]': '!interactive',
    '[class.app-card-interactive]': 'interactive',
  },
})
export class CardComponent {
    @Input() interactive = false;
}
