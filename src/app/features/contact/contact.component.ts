import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CardComponent } from '@shared/components/card/card.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, CardComponent],
  templateUrl: './contact.component.html'
})
export class ContactComponent { }
