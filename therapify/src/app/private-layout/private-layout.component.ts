import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-private-layout',
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayoutComponent {}
