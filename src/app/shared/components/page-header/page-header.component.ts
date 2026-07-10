import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() containerClass = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6';
}
