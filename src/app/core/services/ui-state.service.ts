import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  public readonly showMobileMenu = signal<boolean>(false);
  public readonly showDropdown = signal<boolean>(false);
  public readonly showNetworkDropdown = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);
  public readonly isSidebarCollapsed = signal<boolean>(
    typeof window !== 'undefined' && localStorage.getItem('angular_web3_sidebar_collapsed') === 'true'
  );
}
