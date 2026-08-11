import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, TranslatePipe],
  templateUrl: './breadcrumb.component.html',
  host: { 'class': 'block' },
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() showHome: boolean = true;
  @Input() separatorIcon: string = 'chevron-right';
}

