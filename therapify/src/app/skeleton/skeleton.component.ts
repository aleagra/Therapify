import { Component, computed, input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: '',
  styleUrls: ['./skeleton.component.css'],
  host: {
    '[style.width]': 'resolvedWidth()',
    '[style.height]': 'resolvedHeight()',
    '[style.borderRadius]': 'resolvedRadius()',
    '[attr.aria-hidden]': '"true"',
  },
})
export class SkeletonComponent {
  width = input<string>('100%');
  height = input<string>('1rem');
  radius = input<string>('var(--r-xs)');
  circle = input<boolean, boolean | string>(false, {
    transform: booleanAttribute,
  });

  resolvedWidth = computed(() => {
    if (this.circle()) {
      return this.height() || this.width() || '40px';
    }
    return this.width() || '100%';
  });

  resolvedHeight = computed(() => {
    if (this.circle()) {
      return this.height() || this.width() || '40px';
    }
    return this.height() || '1rem';
  });

  resolvedRadius = computed(() => {
    if (this.circle()) {
      return 'var(--r-full)';
    }
    return this.radius() || 'var(--r-xs)';
  });
}
