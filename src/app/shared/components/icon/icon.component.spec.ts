import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent]
    }).compileComponents();
  });

  it('renders slash separators without falling back to a question mark', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'slash');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.querySelectorAll('path')).toHaveLength(1);
    expect(svg.querySelector('circle')).toBeNull();
  });

  it('renders the vertical menu trigger as three visible dots', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'dots-vertical');
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('circle');
    expect(dots).toHaveLength(3);
    expect([...dots].every((dot) => dot.getAttribute('r') === '2')).toBe(true);
  });

  it('does not disguise an unknown icon name as a question icon', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'not-a-real-icon');
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.children).toHaveLength(0);
  });

  it('passes progress geometry through the centralized icon renderer', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'progress-circle');
    fixture.componentRef.setInput('radius', 46);
    fixture.componentRef.setInput('dashArray', 289);
    fixture.componentRef.setInput('dashOffset', 92);
    fixture.detectChanges();

    const circles = fixture.nativeElement.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(circles[1].getAttribute('stroke-dasharray')).toBe('289');
    expect(circles[1].getAttribute('stroke-dashoffset')).toBe('92');
  });
});
