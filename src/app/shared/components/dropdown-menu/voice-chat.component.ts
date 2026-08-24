import { Component, Input, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface VoiceParticipant {
  id: string;
  name: string;
  avatar: string;
  isSpeaking?: boolean;
}

@Component({
  selector: 'app-voice-chat',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './voice-chat.component.html',
  host: { 'class': 'block w-full flex justify-center' },
})
export class VoiceChatComponent implements OnInit {
  @Input() participants: VoiceParticipant[] = [
    {
      id: '1',
      name: 'Jessica',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isSpeaking: true
    },
    {
      id: '2',
      name: 'Linda',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: '3',
      name: 'Albert',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: '4',
      name: 'Robert',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: '5',
      name: 'Jenny',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: '6',
      name: 'Ben',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isSpeaking: true
    },
    {
      id: '7',
      name: 'Emily',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    }
  ];

  public readonly isExpanded = signal<boolean>(false);
  public readonly isJoined = signal<boolean>(false);
  public readonly currentWidth = signal<number>(360);

  public readonly COLLAPSED_WIDTH = 268;
  public readonly EXPANDED_WIDTH = 360;

  public readonly AVATAR_SIZE_COLLAPSED = 44;
  public readonly AVATAR_SIZE_EXPANDED = 56;
  public readonly AVATAR_OVERLAP = -12;

  public readonly isNarrow = computed(() => this.currentWidth() < 340);
  public readonly expandedHeight = computed(() => this.isNarrow() ? 470 : 440);

  ngOnInit(): void {
    this.updateWidth();
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.updateWidth();
  }

  private updateWidth(): void {
    if (typeof window !== 'undefined') {
      const available = Math.min(360, window.innerWidth - 32);
      this.currentWidth.set(available > 280 ? available : 280);
    }
  }

  public toggleExpand(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isExpanded.update(val => !val);
  }

  public closeExpand(event: MouseEvent): void {
    event.stopPropagation();
    this.isExpanded.set(false);
  }

  public getAvatarPosition(index: number): { x: number; y: number; size: number; opacity: number; zIndex: number; delay: number } {
    const expanded = this.isExpanded();
    const total = this.participants.length;

    if (!expanded) {
      const startX = 60;
      const limit = 3;
      const isVisible = index < limit;
      return {
        x: isVisible ? startX + index * (this.AVATAR_SIZE_COLLAPSED + this.AVATAR_OVERLAP) : startX + 2 * (this.AVATAR_SIZE_COLLAPSED + this.AVATAR_OVERLAP),
        y: 8,
        size: this.AVATAR_SIZE_COLLAPSED,
        opacity: isVisible ? 1 : 0,
        zIndex: 4 - Math.min(index, 3),
        delay: 0
      };
    }

    const width = this.currentWidth();
    const isNarrow = this.isNarrow();

    if (isNarrow) {
      const avatarSize = 48;
      const cols = 3;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const availableWidth = width - 24;
      const colWidth = availableWidth / cols;
      const gridStartX = 12 + (colWidth - avatarSize) / 2;
      const gridStartY = 78;
      const rowHeight = 82;

      return {
        x: Math.round(gridStartX + col * colWidth),
        y: Math.round(gridStartY + row * rowHeight),
        size: avatarSize,
        opacity: 1,
        zIndex: 1,
        delay: index * 15
      };
    }

    const avatarSize = this.AVATAR_SIZE_EXPANDED;
    const colWidth = 80;
    const rowHeight = 95;
    const cols = 4;
    const col = index < cols ? index : index - cols;
    const row = index < cols ? 0 : 1;
    const gridStartX = (width - cols * colWidth) / 2 + (colWidth - avatarSize) / 2;
    const gridStartY = 84;

    return {
      x: Math.round(gridStartX + col * colWidth),
      y: Math.round(gridStartY + row * rowHeight),
      size: avatarSize,
      opacity: 1,
      zIndex: 1,
      delay: index * 15
    };
  }

  public toggleJoin(event: MouseEvent): void {
    event.stopPropagation();
    this.isJoined.update(val => !val);
  }
}

