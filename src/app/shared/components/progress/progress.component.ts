import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface ProgressSegment {
  value: number;
  color?: string;
  label?: string;
}

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
export type ProgressType = 'bar' | 'circle' | 'semicircle';
export type ProgressValuePosition = 'right' | 'top' | 'inside' | 'bottom' | 'none';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './progress.component.html',
  host: { 'class': 'block' },
})
export class ProgressComponent {
  @Input() set value(val: number) {
    this.valueSignal.set(val ?? 0);
  }
  get value(): number {
    return this.valueSignal();
  }

  @Input() set max(val: number) {
    this.maxSignal.set(val && val > 0 ? val : 100);
  }
  get max(): number {
    return this.maxSignal();
  }

  @Input() size: ProgressSize = 'md';
  @Input() variant: ProgressVariant = 'primary';
  @Input() type: ProgressType = 'bar';
  @Input() showValue: boolean = false;
  @Input() valuePosition: ProgressValuePosition = 'right';
  @Input() label?: string;
  @Input() striped: boolean = false;
  @Input() animated: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() steps: number = 0;
  @Input() segments: ProgressSegment[] = [];
  @Input() strokeWidth: number = 8;

  readonly valueSignal = signal<number>(0);
  readonly maxSignal = signal<number>(100);

  readonly percentage = computed(() => {
    if (this.maxSignal() <= 0) return 0;
    const pct = Math.round((this.valueSignal() / this.maxSignal()) * 100);
    return Math.min(100, Math.max(0, pct));
  });

  readonly formattedValue = computed(() => {
    return `${this.percentage()}%`;
  });

  readonly circleRadius = computed(() => {
    return 50 - this.strokeWidth / 2;
  });

  readonly circleCircumference = computed(() => {
    return 2 * Math.PI * this.circleRadius();
  });

  readonly circleDashoffset = computed(() => {
    const pct = this.percentage();
    return this.circleCircumference() - (pct / 100) * this.circleCircumference();
  });

  readonly semiCircleCircumference = computed(() => {
    return Math.PI * 40;
  });

  readonly semiCircleDashoffset = computed(() => {
    const pct = this.percentage();
    return this.semiCircleCircumference() - (pct / 100) * this.semiCircleCircumference();
  });

  get stepArray(): number[] {
    return this.steps > 0 ? Array.from({ length: this.steps }, (_, i) => i) : [];
  }

  getVariantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'bg-[var(--color-primary)]';
      case 'secondary':
        return 'bg-slate-600 dark:bg-slate-400';
      case 'success':
        return 'bg-emerald-500 dark:bg-emerald-400';
      case 'warning':
        return 'bg-amber-500 dark:bg-amber-400';
      case 'danger':
        return 'bg-rose-500 dark:bg-rose-400';
      case 'info':
        return 'bg-sky-500 dark:bg-sky-400';
      case 'gradient':
        return 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]';
      default:
        return 'bg-[var(--color-primary)]';
    }
  }

  getVariantStrokeColor(): string {
    switch (this.variant) {
      case 'primary':
        return 'stroke-[var(--color-primary)]';
      case 'secondary':
        return 'stroke-slate-600 dark:stroke-slate-400';
      case 'success':
        return 'stroke-emerald-500 dark:stroke-emerald-400';
      case 'warning':
        return 'stroke-amber-500 dark:stroke-amber-400';
      case 'danger':
        return 'stroke-rose-500 dark:stroke-rose-400';
      case 'info':
        return 'stroke-sky-500 dark:stroke-sky-400';
      case 'gradient':
        return 'stroke-[var(--color-primary)]';
      default:
        return 'stroke-[var(--color-primary)]';
    }
  }

  getVariantTextColor(): string {
    switch (this.variant) {
      case 'primary':
        return 'text-[var(--color-primary)]';
      case 'secondary':
        return 'text-slate-600 dark:text-slate-400';
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'danger':
        return 'text-rose-600 dark:text-rose-400';
      case 'info':
        return 'text-sky-600 dark:text-sky-400';
      case 'gradient':
        return 'text-[var(--color-primary)]';
      default:
        return 'text-[var(--color-primary)]';
    }
  }

  getBarHeightClass(): string {
    switch (this.size) {
      case 'xs':
        return 'h-1.5';
      case 'sm':
        return 'h-2.5';
      case 'md':
        return 'h-3.5';
      case 'lg':
        return 'h-5';
      case 'xl':
        return 'h-6';
      default:
        return 'h-3.5';
    }
  }

  getCircleSizePx(): number {
    switch (this.size) {
      case 'xs':
        return 48;
      case 'sm':
        return 64;
      case 'md':
        return 88;
      case 'lg':
        return 112;
      case 'xl':
        return 136;
      default:
        return 88;
    }
  }

  getSegmentPercentage(segValue: number): number {
    if (this.maxSignal() <= 0) return 0;
    return Math.min(100, Math.max(0, (segValue / this.maxSignal()) * 100));
  }
}

