import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
})
export class DividerComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() label?: string;
  @Input() labelAlign: 'left' | 'center' | 'right' = 'center';
  @Input() variant: 'solid' | 'dashed' | 'gradient' = 'solid';
}

