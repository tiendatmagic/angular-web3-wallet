import { Directive, Input, ElementRef, HostListener, Renderer2, NgZone } from '@angular/core';

/**
 * Directive appRipple tạo hiệu ứng sóng nước (ripple) khi click chuột hoặc chạm tay.
 * Tương tự như MatRipple của Angular Material.
 *
 * Sử dụng:
 *   <div appRipple>Click me</div>
 *   <button appRipple [appRippleColor]="'rgba(255, 255, 255, 0.3)'">Button</button>
 */
@Directive({
  selector: '[appRipple]',
  standalone: true
})
export class RippleDirective {
  /** Màu sắc tùy chỉnh cho ripple (ví dụ: 'rgba(255, 255, 255, 0.3)', 'var(--color-primary)') */
  @Input('appRippleColor') color: string = '';

  /** Hiển thị sóng nước lan tỏa từ tâm thay vì vị trí click */
  @Input('appRippleCentered') centered: boolean = false;

  /** Vô hiệu hóa hiệu ứng ripple */
  @Input('appRippleDisabled') disabled: boolean = false;

  /** Cho phép sóng nước lan tỏa vượt ra ngoài viền của phần tử cha (không áp dụng overflow: hidden) */
  @Input('appRippleUnbounded') unbounded: boolean = false;

  /** Bán kính tối đa của vòng tròn ripple (nếu bằng 0 thì tự tính toán bao phủ toàn bộ container) */
  @Input('appRippleRadius') radius: number = 0;

  /** Thời gian lan tỏa của hiệu ứng sóng nước (ms), mặc định là 500ms */
  @Input('appRippleDuration') duration: number = 500;

  /** Độ mờ ban đầu của sóng nước, nếu bằng null thì tự động quyết định (0.25 cho currentColor, 1.0 cho màu tùy chỉnh) */
  @Input('appRippleOpacity') opacity: number | null = null;

  private lastTouchTimestamp = 0;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.disabled || event.button !== 0) return;
    if (Date.now() - this.lastTouchTimestamp < 800) return;
    this.createRipple(event);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.disabled) return;
    this.lastTouchTimestamp = Date.now();
    this.createRipple(event);
  }

  private createRipple(event: MouseEvent | TouchEvent): void {
    const container = this.el.nativeElement;

    const computedStyle = getComputedStyle(container);
    if (computedStyle.position === 'static') {
      this.renderer.setStyle(container, 'position', 'relative');
    }
    if (this.unbounded) {
      this.renderer.setStyle(container, 'overflow', 'visible');
    } else if (computedStyle.overflow !== 'hidden') {
      this.renderer.setStyle(container, 'overflow', 'hidden');
    }

    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'app-ripple-element');

    const rect = container.getBoundingClientRect();
    const isCentered = this.centered;
    
    let x = 0;
    let y = 0;
    let size = 0;

    if (isCentered) {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
      x = clientX - rect.left;
      y = clientY - rect.top;
    }

    if (this.radius > 0) {
      size = this.radius * 2;
    } else {
      if (this.unbounded) {
        size = Math.sqrt(rect.width * rect.width + rect.height * rect.height);
      } else {
        const maxDistX = Math.max(x, rect.width - x);
        const maxDistY = Math.max(y, rect.height - y);
        size = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) * 2;
      }
    }

    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${y - size / 2}px`);
    
    if (this.color) {
      this.renderer.setStyle(ripple, 'background-color', this.color);
    }

    let finalOpacity = 0.3;
    if (this.color) {
      finalOpacity = 1.0;
    }
    if (this.opacity !== null) {
      finalOpacity = this.opacity;
    }
    this.renderer.setStyle(ripple, 'opacity', finalOpacity.toString());

    this.renderer.setStyle(ripple, 'animation-duration', `${this.duration}ms`);

    this.renderer.appendChild(container, ripple);

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        ripple.remove();
      }, this.duration);
    });
  }
}
