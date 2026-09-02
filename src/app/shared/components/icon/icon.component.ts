import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
  host: {
    'class': 'inline-flex items-center justify-center shrink-0 leading-none align-middle'
  }
})
export class IconComponent {
    @Input() name: string = '';

    @Input() strokeWidth: string | number = '2';

    @Input() solid: boolean = false;

    @Input() viewBox: string = '0 0 24 24';

    @Input() radius: string | number = 46;
    @Input() dashArray: string | number | null = null;
    @Input() dashOffset: string | number | null = null;
    @Input() trackClass: string = '';
    @Input() valueClass: string = '';
}
