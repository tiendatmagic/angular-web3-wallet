import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent, AvatarItem } from './avatar.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create single avatar with default initials and transition classes', () => {
    component.name = 'Satoshi Nakamoto';
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.initials).toBe('SN');

    const avatarEl = fixture.nativeElement.querySelector('div.cursor-pointer');
    expect(avatarEl).toBeTruthy();
    expect(avatarEl.classList.contains('transition-[transform,scale,box-shadow]')).toBe(true);
    expect(avatarEl.classList.contains('hover:scale-110')).toBe(true);
    expect(avatarEl.classList.contains('transform-gpu')).toBe(true);
  });

  it('should render image and status dot when provided', () => {
    component.name = 'Elena Rostova';
    component.src = 'https://example.com/avatar.jpg';
    component.status = 'online';
    fixture.detectChanges();

    const imgEl = fixture.nativeElement.querySelector('img');
    expect(imgEl).toBeTruthy();
    expect(imgEl.getAttribute('src')).toBe('https://example.com/avatar.jpg');

    const statusDot = fixture.nativeElement.querySelector('span.bg-emerald-500');
    expect(statusDot).toBeTruthy();
  });

  it('should render avatar group stack with correct visible count and +N counter', () => {
    const mockList: AvatarItem[] = [
      { name: 'User 1', status: 'online' },
      { name: 'User 2', status: 'offline' },
      { name: 'User 3', status: 'busy' },
      { name: 'User 4', status: 'away' },
      { name: 'User 5', status: 'online' },
      { name: 'User 6', status: 'online' }
    ];

    component.avatars = mockList;
    component.max = 4;
    fixture.detectChanges();

    expect(component.visibleAvatars.length).toBe(4);
    expect(component.extraCount).toBe(2);

    const counterBadge = fixture.nativeElement.querySelector('.z-10');
    expect(counterBadge).toBeTruthy();
    expect(counterBadge.textContent.trim()).toBe('+2');
    expect(counterBadge.classList.contains('transition-[transform,scale,background-color,color,box-shadow]')).toBe(true);
    expect(counterBadge.classList.contains('hover:-translate-y-2')).toBe(true);
    expect(counterBadge.classList.contains('hover:scale-110')).toBe(true);
    expect(counterBadge.classList.contains('cursor-pointer')).toBe(true);
    expect(counterBadge.classList.contains('select-none')).toBe(true);
  });

  it('should not render +N counter when total avatars is less than or equal to max', () => {
    const mockList: AvatarItem[] = [
      { name: 'User 1' },
      { name: 'User 2' }
    ];

    component.avatars = mockList;
    component.max = 4;
    fixture.detectChanges();

    expect(component.visibleAvatars.length).toBe(2);
    expect(component.extraCount).toBe(0);

    const counterBadge = fixture.nativeElement.querySelector('.z-10');
    expect(counterBadge).toBeNull();
  });

  it('should generate accurate initials for single, double, and multi-word names', () => {
    expect(component.getInitialsFor('Satoshi Nakamoto')).toBe('SN');
    expect(component.getInitialsFor('Nguyễn Tiến Đạt')).toBe('NĐ');
    expect(component.getInitialsFor('Vitalik')).toBe('VI');
    expect(component.getInitialsFor('')).toBe('?');
    expect(component.getInitialsFor(undefined)).toBe('?');
  });
});
