import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  msg: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public readonly successMessage = signal<ToastMessage | null>(null);
  public readonly errorMessage = signal<ToastMessage | null>(null);

  private _successTimer: any = null;
  private _errorTimer: any = null;

  public showToast(msg: string, type: 'success' | 'error' = 'success') {
    if (type === 'success') {
      // Xoá timer cũ nếu có
      if (this._successTimer) clearTimeout(this._successTimer);
      // Reset về null để Angular unmount DOM rồi restart progress bar animation
      this.successMessage.set(null);
      setTimeout(() => {
        this.successMessage.set({ msg, id: Date.now() });
        this._successTimer = setTimeout(() => this.successMessage.set(null), 3000);
      }, 0);
    } else {
      if (this._errorTimer) clearTimeout(this._errorTimer);
      this.errorMessage.set(null);
      setTimeout(() => {
        this.errorMessage.set({ msg, id: Date.now() });
        this._errorTimer = setTimeout(() => this.errorMessage.set(null), 4000);
      }, 0);
    }
  }
}
