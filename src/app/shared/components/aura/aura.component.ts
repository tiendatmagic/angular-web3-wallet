import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aura, [app-aura]',
  imports: [CommonModule],
  templateUrl: './aura.component.html',
  styleUrls: ['./aura.component.css']
})
export class AuraComponent {
  @Input() variant: 'primary' | 'secondary' | 'dual' | 'rainbow' | 'holo' | 'gold' | 'silver' | 'glow' = 'dual';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() glow = true;
  @Input() speed = '4s';
  @Input() radius = '15px';
  @Input() paused = false;

  get sizeStyles() {
    switch (this.size) {
      case 'xs':
        return {
          borderInset: '-1px',
          borderOffset: '1px',
          glowInset: '-3px',
          glowBlur: '5px',
          glowOpacity: '0.4'
        };
      case 'sm':
        return {
          borderInset: '-1.2px',
          borderOffset: '1.2px',
          glowInset: '-5px',
          glowBlur: '10px',
          glowOpacity: '0.55'
        };
      case 'lg':
        return {
          borderInset: '-2px',
          borderOffset: '2px',
          glowInset: '-12px',
          glowBlur: '25px',
          glowOpacity: '0.75'
        };
      case 'xl':
        return {
          borderInset: '-3px',
          borderOffset: '3px',
          glowInset: '-18px',
          glowBlur: '40px',
          glowOpacity: '0.85'
        };
      case 'md':
      default:
        return {
          borderInset: '-1.5px',
          borderOffset: '1.5px',
          glowInset: '-8px',
          glowBlur: '15px',
          glowOpacity: '0.65'
        };
    }
  }
}
