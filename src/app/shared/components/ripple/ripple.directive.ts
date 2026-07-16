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
    if (this.disabled || event.button !== 0) return; // Chỉ nhận click chuột trái
    // Tránh kích hoạt đúp nếu vừa touchstart xong
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

    // Đảm bảo container cha có positioning phù hợp để chứa ripple tuyệt đối
    const computedStyle = getComputedStyle(container);
    if (computedStyle.position === 'static') {
      this.renderer.setStyle(container, 'position', 'relative');
    }
    if (this.unbounded) {
      this.renderer.setStyle(container, 'overflow', 'visible');
    } else if (computedStyle.overflow !== 'hidden') {
      this.renderer.setStyle(container, 'overflow', 'hidden');
    }

    // Tạo phần tử ripple span
    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'app-ripple-element');

    const rect = container.getBoundingClientRect();
    
    // Cờ centered độc lập với cờ unbounded theo phản hồi của người dùng
    const isCentered = this.centered;
    
    // Tính toán tọa độ tâm của sóng nước
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

    // Tính toán kích thước (đường kính) để sóng nước bao phủ toàn bộ container
    if (this.radius > 0) {
      size = this.radius * 2;
    } else {
      if (this.unbounded) {
        // Đối với unbounded ripple, đường kính bằng đường chéo của container để bao phủ vừa khít từ tâm ra góc
        size = Math.sqrt(rect.width * rect.width + rect.height * rect.height);
      } else {
        // Bounded ripple: đường kính bằng khoảng cách xa nhất từ vị trí click đến 4 góc của container * 2
        const maxDistX = Math.max(x, rect.width - x);
        const maxDistY = Math.max(y, rect.height - y);
        size = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) * 2;
      }
    }

    // Thiết lập styles cơ bản
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${y - size / 2}px`);
    
    // Thiết lập màu sắc nếu được chỉ định
    if (this.color) {
      this.renderer.setStyle(ripple, 'background-color', this.color);
    }

    // Thiết lập độ mờ động (opacity)
    let finalOpacity = 0.3;
    if (this.color) {
      finalOpacity = 1.0; // Giữ nguyên độ mờ của rgba/hex được truyền vào
    }
    if (this.opacity !== null) {
      finalOpacity = this.opacity; // Người dùng ghi đè thủ công
    }
    this.renderer.setStyle(ripple, 'opacity', finalOpacity.toString());

    // Thiết lập duration động (thời gian hiệu ứng)
    this.renderer.setStyle(ripple, 'animation-duration', `${this.duration}ms`);

    // Đưa ripple vào DOM
    this.renderer.appendChild(container, ripple);

    // Dọn dẹp ripple sau khi kết thúc hiệu ứng animation
    // Chạy ngoài Angular zone để tránh kích hoạt Change Detection không cần thiết
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        ripple.remove();
      }, this.duration);
    });
  }
}
