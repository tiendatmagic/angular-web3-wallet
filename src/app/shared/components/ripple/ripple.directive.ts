import { Directive, Input, ElementRef, HostListener, Renderer2, NgZone } from '@angular/core';

@Directive({
  selector: '[appRipple]',
  standalone: true
})
export class RippleDirective {
  @Input('appRippleColor') color: string = '#ffffff';
  @Input('appRippleCentered') centered: boolean = false;
  @Input('appRippleDisabled') disabled: boolean = false;
  @Input('appRippleUnbounded') unbounded: boolean = false;
  @Input('appRippleRadius') radius: number = 0;
  @Input('appRippleDuration') duration: number = 700;
  @Input('appRippleOpacity') opacity: number | null = 0.4;

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
