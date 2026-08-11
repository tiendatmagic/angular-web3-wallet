import { Injectable, signal } from '@angular/core';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public readonly toasts = signal<ToastItem[]>([]);

  public showToast(message: string, type: 'success' | 'error' | 'warning' = 'success', duration?: number) {
    const defaultDuration = type === 'success' ? 3000 : type === 'warning' ? 3500 : 4000;
    const finalDuration = duration || defaultDuration;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newToast: ToastItem = {
      id,
      message,
      type,
      duration: finalDuration
    };

    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.removeToast(id);
    }, finalDuration);
  }

  public success(message: string, duration?: number) {
    this.showToast(message, 'success', duration);
  }

  public error(message: string, duration?: number) {
    this.showToast(message, 'error', duration);
  }

  public warning(message: string, duration?: number) {
    this.showToast(message, 'warning', duration);
  }

  public removeToast(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
