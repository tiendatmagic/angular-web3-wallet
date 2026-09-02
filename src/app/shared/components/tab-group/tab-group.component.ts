import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ViewChild,
  signal,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';

export interface TabOption {
  value: any;
  label: string;
  icon?: string;
  badge?: string | number;
  dotClass?: string;
}

@Component({
  selector: 'app-tab-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  },
  imports: [CommonModule, IconComponent],
  templateUrl: './tab-group.component.html',
})
export class TabGroupComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  @Input() options: TabOption[] = [];
  @Input() activeValue: any = null;
  @Input() containerClass: string = '';
  @Input() buttonClass: string = '';
  @Input() labelClass: string = '';
  @Input() flex: boolean = true;
  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('containerEl') containerEl!: ElementRef<HTMLDivElement>;
  @ViewChildren('tabBtn') tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  private resizeObserver?: ResizeObserver;
  private resizeListener?: () => void;
  private rafId: number | null = null;

  public readonly sliderStyle = signal<{ left: string; width: string; ready: boolean; animated: boolean }>({
    left: '0px',
    width: '0px',
    ready: false,
    animated: false
  });

  public get activeIndex(): number {
    return this.options.findIndex((opt) => opt.value === this.activeValue);
  }

  ngAfterViewInit(): void {
    this.updateSliderPosition(false);

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.updateSliderPosition(false);
        requestAnimationFrame(() => {
          if (this.sliderStyle().ready) {
            this.sliderStyle.update((s) => ({ ...s, animated: true }));
            this.cdr.markForCheck();
          }
        });
      });

      setTimeout(() => this.updateSliderPosition(true), 50);
      setTimeout(() => this.updateSliderPosition(true), 150);

      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          this.updateSliderPosition(true);
        });
      }

      this.resizeListener = () => {
        if (!this.rafId) {
          this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.updateSliderPosition(true);
          });
        }
      };
      window.addEventListener('resize', this.resizeListener, { passive: true });

      this.setupResizeObserver();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeValue'] || changes['options']) {
      this.updateSliderPosition(true);
      if (changes['options']) {
        setTimeout(() => this.setupResizeObserver(), 0);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateSliderPosition(true);
    });

    if (this.containerEl?.nativeElement) {
      this.resizeObserver.observe(this.containerEl.nativeElement);
    }

    if (this.tabButtons) {
      this.tabButtons.forEach((btn) => {
        if (btn.nativeElement) {
          this.resizeObserver?.observe(btn.nativeElement);
        }
      });
    }
  }

  public onSelect(value: any): void {
    if (value !== this.activeValue) {
      this.valueChange.emit(value);
      this.activeValue = value;
      this.updateSliderPosition(true);
      this.cdr.markForCheck();
    }
  }

  public updateSliderPosition(enableAnimation: boolean = true): void {
    if (!this.tabButtons || !this.containerEl) return;

    const buttons = this.tabButtons.toArray();
    const activeIdx = this.activeIndex;

    if (activeIdx !== -1 && buttons[activeIdx]) {
      const activeEl = buttons[activeIdx].nativeElement;
      const nextLeft = `${activeEl.offsetLeft}px`;
      const nextWidth = `${activeEl.offsetWidth}px`;

      if (activeEl.offsetWidth === 0) return;

      const current = this.sliderStyle();
      const shouldAnimate = enableAnimation && current.ready;

      if (current.left !== nextLeft || current.width !== nextWidth || !current.ready || current.animated !== shouldAnimate) {
        this.sliderStyle.set({
          left: nextLeft,
          width: nextWidth,
          ready: true,
          animated: shouldAnimate
        });
        this.cdr.markForCheck();
      }

      const container = this.containerEl.nativeElement;
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const buttonLeft = activeEl.offsetLeft;
      const buttonWidth = activeEl.offsetWidth;

      if (buttonLeft < scrollLeft) {
        container.scrollTo({ left: buttonLeft - 8, behavior: 'smooth' });
      } else if (buttonLeft + buttonWidth > scrollLeft + containerWidth) {
        container.scrollTo({ left: buttonLeft + buttonWidth - containerWidth + 8, behavior: 'smooth' });
      }
    } else {
      const current = this.sliderStyle();
      if (current.left !== '0px' || current.width !== '0px' || current.ready) {
        this.sliderStyle.set({ left: '0px', width: '0px', ready: false, animated: false });
        this.cdr.markForCheck();
      }
    }
  }
}
