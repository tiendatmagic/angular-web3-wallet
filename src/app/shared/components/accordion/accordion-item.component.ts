import { Component, Input, Output, EventEmitter, inject, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  templateUrl: './accordion-item.component.html',
  host: { 'class': 'block' },
})
export class AccordionItemComponent {
  public readonly cdr = inject(ChangeDetectorRef);
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() expanded = false;
  @Input() disabled = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  private accordion = inject(forwardRef(() => AccordionComponent), { optional: true });

  public toggle(): void {
    if (this.disabled) return;
    
    if (this.accordion) {
      this.accordion.toggleItem(this);
    } else {
      this.expanded = !this.expanded;
      this.expandedChange.emit(this.expanded);
    }
  }
}
