import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface AvatarItem {
  src?: string;
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './avatar.component.html',
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  host: { 'class': 'inline-block' },
})
export class AvatarComponent {
  @Input() src: string = '';
  @Input() name: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() shape: 'circle' | 'square' = 'circle';
  @Input() status?: 'online' | 'offline' | 'busy' | 'away';
  @Input() avatars?: AvatarItem[];
  @Input() max: number = 4;

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  get visibleAvatars(): AvatarItem[] {
    if (!this.avatars) return [];
    return this.avatars.slice(0, this.max);
  }

  get extraCount(): number {
    if (!this.avatars || this.avatars.length <= this.max) return 0;
    return this.avatars.length - this.max;
  }

  getInitialsFor(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}

