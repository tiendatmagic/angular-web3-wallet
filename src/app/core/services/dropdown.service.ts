import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  /** Signal lưu trữ ID duy nhất của dropdown đang được mở trên toàn ứng dụng */
  public readonly activeDropdownId = signal<string | null>(null);

  /**
   * Đăng ký mở dropdown mới và tự động yêu cầu tất cả các dropdown khác phải đóng lại.
   * @param id Mã định danh duy nhất của dropdown instance
   */
  public open(id: string): void {
    this.activeDropdownId.set(id);
  }

  /** Đóng tất cả các dropdown đang mở */
  public closeAll(): void {
    this.activeDropdownId.set(null);
  }

  /** Đóng dropdown nếu trùng ID */
  public close(id: string): void {
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    }
  }

  /** Kiểm tra xem dropdown có ID tương ứng có đang mở hay không */
  public isActive(id: string): boolean {
    return this.activeDropdownId() === id;
  }
}
