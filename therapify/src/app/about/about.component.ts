import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PLATFORM_METRICS } from '../../types/constants';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  readonly metrics = PLATFORM_METRICS;
}
