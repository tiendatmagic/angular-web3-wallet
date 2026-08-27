import { TestBed } from '@angular/core/testing';
import { ProgressComponent } from './progress.component';

describe('ProgressComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressComponent],
    }).compileComponents();
  });

  it('calculates percentage and formatted value correctly', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('value', 68);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();

    expect(fixture.componentInstance.percentage()).toBe(68);
    expect(fixture.componentInstance.formattedValue()).toBe('68%');
  });

  it('does not render duplicate top header for circular and semicircle gauges', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('type', 'circle');
    fixture.componentRef.setInput('label', 'Circular Ring');
    fixture.componentRef.setInput('value', 68);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const topHeaders = compiled.querySelectorAll('.progress-wrapper > .flex.items-center.justify-between');
    expect(topHeaders.length).toBe(0);

    const innerLabel = compiled.querySelector('.absolute span.uppercase');
    expect(innerLabel?.textContent?.trim()).toBe('Circular Ring');
  });

  it('calculates circle circumference and dashoffset accurately', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('type', 'circle');
    fixture.componentRef.setInput('strokeWidth', 8);
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.circleRadius()).toBe(46);
    const expectedCircumference = 2 * Math.PI * 46;
    expect(comp.circleCircumference()).toBeCloseTo(expectedCircumference, 2);
    expect(comp.circleDashoffset()).toBeCloseTo(expectedCircumference / 2, 2);
  });

  it('calculates semicircle circumference and dashoffset accurately', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('type', 'semicircle');
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const expectedCircumference = Math.PI * 40;
    expect(comp.semiCircleCircumference()).toBeCloseTo(expectedCircumference, 2);
    expect(comp.semiCircleDashoffset()).toBeCloseTo(expectedCircumference / 2, 2);
  });
});
