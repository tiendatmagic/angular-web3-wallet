import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getContainingBlockOffset } from './dom.utils';

describe('getContainingBlockOffset', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentElement) {
      document.body.removeChild(container);
    }
  });

  it('should return { left: 0, top: 0 } when element is null or document root', () => {
    expect(getContainingBlockOffset(null)).toEqual({ left: 0, top: 0 });
    expect(getContainingBlockOffset(document.body)).toEqual({ left: 0, top: 0 });
  });

  it('should return { left: 0, top: 0 } when no ancestor forms a containing block', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    container.appendChild(parent);

    expect(getContainingBlockOffset(child)).toEqual({ left: 0, top: 0 });
  });

  it('should detect ancestor with CSS transform as containing block', () => {
    const parent = document.createElement('div');
    parent.style.transform = 'scale(0.95)';
    parent.getBoundingClientRect = () => ({
      left: 150,
      top: 80,
      right: 550,
      bottom: 480,
      width: 400,
      height: 400,
      x: 150,
      y: 80,
      toJSON: () => {}
    });

    const child = document.createElement('div');
    parent.appendChild(child);
    container.appendChild(parent);

    expect(getContainingBlockOffset(child)).toEqual({ left: 150, top: 80 });
  });

  it('should detect ancestor with will-change: transform as containing block', () => {
    const parent = document.createElement('div');
    parent.style.willChange = 'transform, opacity';
    parent.getBoundingClientRect = () => ({
      left: 220,
      top: 110,
      right: 620,
      bottom: 510,
      width: 400,
      height: 400,
      x: 220,
      y: 110,
      toJSON: () => {}
    });

    const child = document.createElement('div');
    parent.appendChild(child);
    container.appendChild(parent);

    expect(getContainingBlockOffset(child)).toEqual({ left: 220, top: 110 });
  });

  it('should detect ancestor with filter or backdrop-filter as containing block', () => {
    const parent = document.createElement('div');
    parent.style.backdropFilter = 'blur(10px)';
    parent.getBoundingClientRect = () => ({
      left: 50,
      top: 60,
      right: 350,
      bottom: 360,
      width: 300,
      height: 300,
      x: 50,
      y: 60,
      toJSON: () => {}
    });

    const child = document.createElement('div');
    parent.appendChild(child);
    container.appendChild(parent);

    expect(getContainingBlockOffset(child)).toEqual({ left: 50, top: 60 });
  });
});
