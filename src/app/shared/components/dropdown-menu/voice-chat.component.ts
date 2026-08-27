import {
  Component,
  Input,
  signal,
  computed,
  HostListener,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  inject,
} from '@angular/core';
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
  host: { class: 'w-full flex justify-center max-w-full' },
})
export class VoiceChatComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private resizeObserver?: ResizeObserver;

  @Input() participants: VoiceParticipant[] = [
    {
      id: '1',
      name: 'Jessica',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isSpeaking: true,
    },
    {
      id: '2',
      name: 'Linda',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Albert',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Robert',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      name: 'Jenny',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '6',
      name: 'Ben',
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isSpeaking: true,
    },
    {
      id: '7',
      name: 'Emily',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  ];

  public readonly isExpanded = signal<boolean>(false);
  public readonly isJoined = signal<boolean>(false);
  public readonly currentWidth = signal<number>(360);

  public readonly COLLAPSED_WIDTH = 268;
  public readonly EXPANDED_WIDTH = 360;

  public readonly AVATAR_SIZE_COLLAPSED = 40;
  public readonly AVATAR_SIZE_EXPANDED = 52;
  public readonly AVATAR_OVERLAP = -12;

  public readonly isUltraCompact = computed(() => this.currentWidth() < 260);
  public readonly isNarrow = computed(() => this.currentWidth() < 330);
  public readonly expandedHeight = computed(() => {
    if (this.isUltraCompact()) {
      return 365;
    }
    if (this.isNarrow()) {
      return 405;
    }
    return 355;
  });
  public readonly collapsedWidth = computed(() =>
    Math.min(this.COLLAPSED_WIDTH, this.currentWidth())
  );

  ngOnInit(): void {
    this.updateWidth();
  }

  ngAfterViewInit(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          if (width > 0) {
            const available = Math.min(360, Math.floor(width));
            this.currentWidth.set(available);
          }
        }
      });
      this.resizeObserver.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.updateWidth();
  }

  private updateWidth(): void {
    if (typeof window !== 'undefined') {
      const hostWidth = this.el.nativeElement?.getBoundingClientRect()?.width;
      const available =
        hostWidth && hostWidth > 0
          ? Math.min(360, Math.floor(hostWidth))
          : Math.min(360, window.innerWidth - 32);
      this.currentWidth.set(available > 0 ? available : 320);
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

  public getAvatarPosition(index: number): {
    x: number;
    y: number;
    size: number;
    opacity: number;
    zIndex: number;
    delay: number;
  } {
    const expanded = this.isExpanded();
    const width = this.currentWidth();

    if (!expanded) {
      const cWidth = this.collapsedWidth();
      const size = cWidth < 235 ? 30 : cWidth < 268 ? 34 : this.AVATAR_SIZE_COLLAPSED;
      const overlap = cWidth < 235 ? -8 : cWidth < 268 ? -10 : this.AVATAR_OVERLAP;
      const startX = cWidth < 235 ? 38 : cWidth < 268 ? 44 : 54;
      const limit = 3;
      const isVisible = index < limit;
      return {
        x: isVisible
          ? startX + index * (size + overlap)
          : startX + 2 * (size + overlap),
        y: Math.round((58 - size) / 2),
        size,
        opacity: isVisible ? 1 : 0,
        zIndex: 4 - Math.min(index, 3),
        delay: 0,
      };
    }

    if (this.isUltraCompact()) {
      const avatarSize = 38;
      const cols = 3;
      const colWidth = Math.floor((width - 12) / cols);
      const gridStartX = Math.round((width - cols * colWidth) / 2 + (colWidth - avatarSize) / 2);
      const gridStartY = 62;
      const rowHeight = 64;

      const row = Math.floor(index / cols);
      const col = index === 6 ? 1 : index % cols;

      return {
        x: gridStartX + col * colWidth,
        y: gridStartY + row * rowHeight,
        size: avatarSize,
        opacity: 1,
        zIndex: 1,
        delay: index * 15,
      };
    }

    if (this.isNarrow()) {
      const avatarSize = 44;
      const cols = 3;
      const colWidth = Math.floor((width - 16) / cols);
      const gridStartX = Math.round((width - cols * colWidth) / 2 + (colWidth - avatarSize) / 2);
      const gridStartY = 68;
      const rowHeight = 74;

      const row = Math.floor(index / cols);
      const col = index === 6 ? 1 : index % cols;

      return {
        x: gridStartX + col * colWidth,
        y: gridStartY + row * rowHeight,
        size: avatarSize,
        opacity: 1,
        zIndex: 1,
        delay: index * 15,
      };
    }

    const avatarSize = this.AVATAR_SIZE_EXPANDED;
    const cols = 4;
    const colWidth = Math.floor(width / cols);
    const gridStartX = Math.round((width - cols * colWidth) / 2 + (colWidth - avatarSize) / 2);
    const gridStartY = 72;
    const rowHeight = 84;

    if (index < 4) {
      return {
        x: gridStartX + index * colWidth,
        y: gridStartY,
        size: avatarSize,
        opacity: 1,
        zIndex: 1,
        delay: index * 15,
      };
    }

    const colIndex = index - 4;
    return {
      x: Math.round(gridStartX + (colIndex + 0.5) * colWidth),
      y: gridStartY + rowHeight,
      size: avatarSize,
      opacity: 1,
      zIndex: 1,
      delay: index * 15,
    };
  }

  public toggleJoin(event: MouseEvent): void {
    event.stopPropagation();
    this.isJoined.update(val => !val);
  }
}
