import { Component, Input, signal } from '@angular/core';
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
  styleUrl: './voice-chat.component.scss',
  host: { 'class': 'block w-full flex justify-center' },
})
export class VoiceChatComponent {
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

  public readonly COLLAPSED_WIDTH = 268;
  public readonly EXPANDED_WIDTH = 360;
  public readonly EXPANDED_HEIGHT = 440;

  public readonly AVATAR_SIZE_COLLAPSED = 44;
  public readonly AVATAR_SIZE_EXPANDED = 56;
  public readonly AVATAR_OVERLAP = -12;

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
      const isVisible = total > limit ? index < limit : index < total;
      return {
        x: startX + index * (this.AVATAR_SIZE_COLLAPSED + this.AVATAR_OVERLAP),
        y: 8,
        size: this.AVATAR_SIZE_COLLAPSED,
        opacity: isVisible ? 1 : 0,
        zIndex: 4 - index,
        delay: (6 - index) * 10
      };
    }

    const gridStartX = 28;
    const gridStartY = 84;
    const colWidth = 80;
    const rowHeight = 95;

    const col = index < 4 ? index : index - 4;
    const row = index < 4 ? 0 : 1;

    return {
      x: gridStartX + col * colWidth,
      y: gridStartY + row * rowHeight,
      size: this.AVATAR_SIZE_EXPANDED,
      opacity: 1,
      zIndex: 1,
      delay: index * 12
    };
  }

  public toggleJoin(event: MouseEvent): void {
    event.stopPropagation();
    this.isJoined.update(val => !val);
  }
}

