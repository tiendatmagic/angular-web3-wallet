import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CardComponent } from '@shared/components/card/card.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent, CardComponent, TranslatePipe],
  templateUrl: './about.component.html'
})
export class AboutComponent { }
