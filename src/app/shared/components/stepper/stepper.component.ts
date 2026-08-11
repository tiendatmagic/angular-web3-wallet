import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface StepItem {
  id?: string | number;
  label: string;
  subtitle?: string;
  state?: 'completed' | 'active' | 'pending' | 'error';
  icon?: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() activeIndex: number = 0;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() clickable: boolean = false;

  @Output() activeIndexChange = new EventEmitter<number>();

  selectStep(index: number): void {
    if (this.clickable) {
      this.activeIndexChange.emit(index);
    }
  }

  getStepState(index: number): 'completed' | 'active' | 'pending' | 'error' {
    if (this.steps[index]?.state) {
      return this.steps[index].state!;
    }
    if (index < this.activeIndex) return 'completed';
    if (index === this.activeIndex) return 'active';
    return 'pending';
  }
}
