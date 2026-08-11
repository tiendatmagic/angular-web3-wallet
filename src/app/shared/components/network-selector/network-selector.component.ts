import { Component, signal, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-network-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, TranslatePipe],
  templateUrl: './network-selector.component.html',
  host: { 'class': 'block' },
})
export class NetworkSelectorComponent {
  public stateService = inject(StateService);
  private elementRef = inject(ElementRef);

  public isOpen = signal(false);

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((prev) => !prev);
  }

  public switchNetwork(chainId: number, event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    setTimeout(async () => {
      await this.stateService.switchNetwork(chainId);
    }, 100);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}

