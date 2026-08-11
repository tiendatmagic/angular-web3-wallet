import { Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-logo',
  imports: [IconComponent],
  templateUrl: './logo.component.html',
  host: { 'class': 'block' },
})
export class LogoComponent {}
