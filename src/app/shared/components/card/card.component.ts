import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card, [app-card]',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    '[class.app-card]': '!interactive',
    '[class.app-card-interactive]': 'interactive',
  },
})
export class CardComponent {
    @Input() interactive = false;
}
