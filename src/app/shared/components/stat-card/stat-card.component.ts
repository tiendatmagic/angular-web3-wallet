import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() subtitle?: string;
  @Input() iconName: string = 'wallet';
  @Input() changeValue?: string;
  @Input() changeType: 'increase' | 'decrease' | 'neutral' = 'increase';
  @Input() iconBgGradient: string = 'from-purple-600 to-indigo-600';
}
