import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <app-skeleton id="default-skeleton"></app-skeleton>
    <app-skeleton id="circle-skeleton" circle width="46px" height="46px"></app-skeleton>
    <app-skeleton id="custom-skeleton" width="55%" height="22px" radius="var(--r-lg)"></app-skeleton>
  `,
})
class TestHostComponent {}

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render default skeleton with aria-hidden="true"', () => {
    const el = fixture.nativeElement.querySelector('#default-skeleton');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('1rem');
  });

  it('should render circle skeleton with radius var(--r-full)', () => {
    const el = fixture.nativeElement.querySelector('#circle-skeleton');
    expect(el).toBeTruthy();
    expect(el.style.width).toBe('46px');
    expect(el.style.height).toBe('46px');
    expect(el.style.borderRadius).toBe('var(--r-full)');
  });

  it('should render custom skeleton with custom properties', () => {
    const el = fixture.nativeElement.querySelector('#custom-skeleton');
    expect(el).toBeTruthy();
    expect(el.style.width).toBe('55%');
    expect(el.style.height).toBe('22px');
    expect(el.style.borderRadius).toBe('var(--r-lg)');
  });
});
