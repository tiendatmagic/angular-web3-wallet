import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  public readonly activeDropdownId = signal<string | null>(null);

  public open(id: string): void {
    this.activeDropdownId.set(id);
  }

  public closeAll(): void {
    this.activeDropdownId.set(null);
  }

  public close(id: string): void {
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    }
  }

  public isActive(id: string): boolean {
    return this.activeDropdownId() === id;
  }
}
