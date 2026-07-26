import { Component, Input, Output, EventEmitter, forwardRef, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  previewUrl?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, IconComponent, TooltipDirective],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() variant: 'horizontal' | 'dropzone' | 'avatar' = 'horizontal';
  @Input() accept: string = '*';
  @Input() multiple: boolean = true;
  @Input() maxSizeMB: number = 10;
  @Input() maxFiles: number = 10;
  @Input() disabled: boolean = false;
  @Input() autoUpload: boolean = true;
  @Input() compact: boolean = false;
  @Input() avatarMode: boolean = false;
  @Input() showFileList: boolean = true;
  
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() buttonText: string = 'Chọn tệp';
  @Input() icon: string = 'cloud-upload';

  @Output() filesChange = new EventEmitter<UploadFileItem[]>();
  @Output() fileAdded = new EventEmitter<UploadFileItem>();
  @Output() fileRemoved = new EventEmitter<UploadFileItem>();
  @Output() uploadComplete = new EventEmitter<UploadFileItem[]>();
  @Output() uploadError = new EventEmitter<{ file: UploadFileItem; error: string }>();

  readonly files = signal<UploadFileItem[]>([]);
  readonly isDragging = signal<boolean>(false);
  readonly globalError = signal<string | null>(null);
  readonly previewModalFile = signal<UploadFileItem | null>(null);

  readonly effectiveVariant = computed(() => {
    if (this.avatarMode) return 'avatar';
    return this.variant;
  });

  readonly displayTitle = computed(() => {
    if (this.title) return this.title;
    if (this.effectiveVariant() === 'avatar') return 'Tải lên ảnh đại diện';
    return 'Chọn file từ thiết bị';
  });

  readonly displaySubtitle = computed(() => {
    if (this.subtitle) return this.subtitle;
    if (this.effectiveVariant() === 'avatar') return `PNG, JPG tối đa ${this.maxSizeMB}MB`;
    return `Kéo và thả hoặc nhấn để chọn file từ thiết bị của bạn`;
  });

  readonly totalSizeBytes = computed(() => {
    return this.files().reduce((acc, f) => acc + f.size, 0);
  });

  readonly isAllCompleted = computed(() => {
    const list = this.files();
    return list.length > 0 && list.every(f => f.status === 'completed');
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (Array.isArray(value)) {
      // Intentionally handle external value binding if needed
    } else if (!value) {
      this.files.set([]);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  triggerFileInput(): void {
    if (this.disabled) return;
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFiles(Array.from(target.files));
      target.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) return;
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.disabled) return;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(incomingFiles: File[]): void {
    this.globalError.set(null);

    let filesToProcess = incomingFiles;
    if (!this.multiple) {
      filesToProcess = incomingFiles.slice(0, 1);
    }

    const currentFiles = this.files();
    if (this.multiple && currentFiles.length + filesToProcess.length > this.maxFiles) {
      this.globalError.set(`Bạn chỉ được phép tải lên tối đa ${this.maxFiles} tệp.`);
      filesToProcess = filesToProcess.slice(0, this.maxFiles - currentFiles.length);
    }

    const newItems: UploadFileItem[] = [];

    for (const file of filesToProcess) {
      const errorMsg = this.validateFile(file);
      const id = 'file_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      
      const item: UploadFileItem = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type || this.getFallbackType(file.name),
        progress: 0,
        status: errorMsg ? 'error' : (this.autoUpload ? 'uploading' : 'pending'),
        errorMessage: errorMsg || undefined
      };

      if (item.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          item.previewUrl = e.target?.result as string;
          this.files.update(list => [...list]);
        };
        reader.readAsDataURL(file);
      }

      newItems.push(item);
    }

    let updatedList: UploadFileItem[];
    if (this.multiple) {
      updatedList = [...currentFiles, ...newItems];
    } else {
      updatedList = newItems;
    }

    this.files.set(updatedList);
    this.notifyChanges();

    newItems.forEach(item => {
      this.fileAdded.emit(item);
      if (item.status === 'error') {
        this.uploadError.emit({ file: item, error: item.errorMessage || 'Lỗi không xác định' });
      } else if (this.autoUpload) {
        this.simulateUpload(item);
      }
    });
  }

  private validateFile(file: File): string | null {
    const maxSizeBytes = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Dung lượng tệp vượt quá ${this.maxSizeMB} MB`;
    }

    if (this.accept && this.accept !== '*') {
      const acceptedTypes = this.accept.split(',').map(t => t.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      const isMatch = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return fileType.startsWith(mainType + '/');
        }
        return fileType === type;
      });

      if (!isMatch) {
        return `Định dạng tệp không được hỗ trợ (${file.name.split('.').pop()})`;
      }
    }

    return null;
  }

  simulateUpload(item: UploadFileItem): void {
    item.status = 'uploading';
    item.progress = 0;
    item.errorMessage = undefined;
    this.files.update(list => [...list]);

    const interval = setInterval(() => {
      if (item.status !== 'uploading') {
        clearInterval(interval);
        return;
      }

      const increment = Math.floor(Math.random() * 25) + 15;
      item.progress = Math.min(item.progress + increment, 100);
      this.files.update(list => [...list]);

      if (item.progress >= 100) {
        item.status = 'completed';
        clearInterval(interval);
        this.files.update(list => [...list]);
        this.notifyChanges();
        
        if (this.isAllCompleted()) {
          this.uploadComplete.emit(this.files());
        }
      }
    }, 180);
  }

  retryUpload(item: UploadFileItem): void {
    if (this.disabled) return;
    this.simulateUpload(item);
  }

  removeFile(item: UploadFileItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled) return;

    this.files.update(list => list.filter(f => f.id !== item.id));
    this.fileRemoved.emit(item);
    this.notifyChanges();
  }

  clearAll(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled) return;

    this.files.set([]);
    this.notifyChanges();
  }

  openPreview(item: UploadFileItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.previewModalFile.set(item);
  }

  closePreview(): void {
    this.previewModalFile.set(null);
  }

  getFileIcon(type: string, name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'file-image';
    }
    if (type === 'application/pdf' || ext === 'pdf') {
      return 'file-pdf';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return 'file-zip';
    }
    if (['ts', 'js', 'html', 'css', 'scss', 'json', 'py', 'java', 'cpp', 'c', 'php', 'sql'].includes(ext)) {
      return 'file-code';
    }
    if (['txt', 'md', 'doc', 'docx', 'rtf'].includes(ext)) {
      return 'file-text';
    }
    return 'file-generic';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getFallbackType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image/' + ext;
    if (ext === 'pdf') return 'application/pdf';
    return 'application/octet-stream';
  }

  private notifyChanges(): void {
    const currentList = this.files();
    this.filesChange.emit(currentList);
    this.onChange(currentList);
    this.onTouched();
  }
}
