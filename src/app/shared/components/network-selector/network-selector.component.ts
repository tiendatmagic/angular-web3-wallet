import { Component, signal, inject, ElementRef, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { DropdownService } from '@core/services/dropdown.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-network-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, TranslatePipe],
  templateUrl: './network-selector.component.html',
  host: {
    'class': 'block',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class NetworkSelectorComponent {
  public stateService = inject(StateService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  public readonly instanceId = 'network_selector_' + Math.random().toString(36).substring(2, 9);

  public isOpen = signal(false);

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
    }
  });

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    if (newState) {
      this.dropdownService.open(this.instanceId);
    } else {
      this.dropdownService.close(this.instanceId);
    }
  }

  public switchNetwork(chainId: number, event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
    setTimeout(async () => {
      await this.stateService.switchNetwork(chainId);
    }, 100);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }
}

