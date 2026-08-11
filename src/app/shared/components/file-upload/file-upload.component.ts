import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  ElementRef,
  ViewChild,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TooltipDirective } from '@shared/components/tooltip/tooltip.directive';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';

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
  imports: [CommonModule, IconComponent, TooltipDirective, TranslatePipe],
  templateUrl: './file-upload.component.html',
  host: { 'class': 'block' },
  styleUrl: './file-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() variant: 'dropzone' | 'horizontal' | 'avatar' = 'horizontal';
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
  @Input() buttonText: string = '';
  @Input() icon: string = 'cloud-upload';

  @Output() filesChange = new EventEmitter<UploadFileItem[]>();
  @Output() fileAdded = new EventEmitter<UploadFileItem>();
  @Output() fileRemoved = new EventEmitter<UploadFileItem>();
  @Output() uploadComplete = new EventEmitter<UploadFileItem[]>();
  @Output() uploadError = new EventEmitter<{ file: UploadFileItem; error: string }>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private translationService = inject(TranslationService);

  readonly files = signal<UploadFileItem[]>([]);
  readonly isDragging = signal<boolean>(false);
  readonly globalError = signal<string | null>(null);
  readonly previewModalFile = signal<UploadFileItem | null>(null);

  readonly effectiveVariant = computed(() => {
    if (this.avatarMode) return 'avatar';
    return this.variant;
  });

  readonly displayButtonText = computed(() => {
    if (this.buttonText) return this.buttonText;
    return this.translationService.t('file_upload_ui.select_files');
  });

  readonly displayTitle = computed(() => {
    if (this.title) return this.title;
    if (this.effectiveVariant() === 'avatar') {
      return this.translationService.t('file_upload_ui.select_avatar');
    }
    return this.translationService.t('file_upload_ui.select_from_device');
  });

  readonly displaySubtitle = computed(() => {
    if (this.subtitle) return this.subtitle;
    if (this.effectiveVariant() === 'avatar') {
      return `PNG, JPG max ${this.maxSizeMB}MB`;
    }
    return this.translationService.t('file_upload_ui.drag_drop_files');
  });

  readonly totalSizeBytes = computed(() => {
    return this.files().reduce((acc, f) => acc + f.size, 0);
  });

  readonly isAllCompleted = computed(() => {
    const list = this.files();
    if (list.length === 0) return false;
    return list.every((f) => f.status === 'completed');
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (Array.isArray(value)) {
      const formatted: UploadFileItem[] = value.map((f: any, idx: number) => {
        if (f instanceof File) {
          return this.createFileItem(f);
        } else if (typeof f === 'object' && f.name) {
          return {
            id: f.id || `file_${Date.now()}_${idx}`,
            file: f.file || (new File([], f.name)),
            name: f.name,
            size: f.size || 0,
            type: f.type || 'application/octet-stream',
            progress: f.progress ?? 100,
            status: f.status || 'completed',
            previewUrl: f.previewUrl || f.url
          };
        }
        return null;
      }).filter((item): item is UploadFileItem => item !== null);

      this.files.set(formatted);
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

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public triggerFileInput(): void {
    if (this.disabled) return;
    this.onTouched();
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
      input.value = '';
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragging.set(true);
    }
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.disabled) return;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(incomingFiles: File[]): void {
    this.globalError.set(null);

    let selected = incomingFiles;

    if (!this.multiple) {
      selected = incomingFiles.slice(0, 1);
    }

    const currentFiles = this.files();
    if (this.multiple && currentFiles.length + selected.length > this.maxFiles) {
      this.globalError.set(`Tối đa chỉ được tải lên ${this.maxFiles} tệp tin.`);
      selected = selected.slice(0, this.maxFiles - currentFiles.length);
    }

    const newItems: UploadFileItem[] = [];

    for (const file of selected) {
      if (!this.validateFileType(file)) {
        this.globalError.set(`Định dạng tệp "${file.name}" không được hỗ trợ.`);
        continue;
      }

      if (!this.validateFileSize(file)) {
        this.globalError.set(`Dung lượng tệp "${file.name}" vượt quá giới hạn ${this.maxSizeMB}MB.`);
        continue;
      }

      const item = this.createFileItem(file);
      newItems.push(item);
      this.fileAdded.emit(item);
    }

    if (newItems.length === 0) return;

    let updatedList: UploadFileItem[];
    if (this.multiple) {
      updatedList = [...currentFiles, ...newItems];
    } else {
      updatedList = newItems;
    }

    this.files.set(updatedList);
    this.emitChange(updatedList);

    if (this.autoUpload) {
      newItems.forEach((item) => this.simulateUpload(item));
    }
  }

  private createFileItem(file: File): UploadFileItem {
    const id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const item: UploadFileItem = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      progress: 0,
      status: 'pending'
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        item.previewUrl = e.target?.result as string;
        this.files.update((list) => [...list]);
      };
      reader.readAsDataURL(file);
    }

    return item;
  }

  private validateFileType(file: File): boolean {
    if (this.accept === '*' || !this.accept) return true;
    const rules = this.accept.split(',').map((s) => s.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    return rules.some((rule) => {
      if (rule.startsWith('.')) {
        return fileName.endsWith(rule);
      } else if (rule.endsWith('/*')) {
        const typePrefix = rule.replace('/*', '');
        return mimeType.startsWith(typePrefix);
      }
      return mimeType === rule;
    });
  }

  private validateFileSize(file: File): boolean {
    const maxBytes = this.maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }

  private simulateUpload(item: UploadFileItem): void {
    this.updateFileStatus(item.id, { status: 'uploading', progress: 10 });

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        this.updateFileStatus(item.id, { status: 'completed', progress: 100 });
        
        const completedList = this.files().filter((f) => f.status === 'completed');
        this.uploadComplete.emit(completedList);
      } else {
        this.updateFileStatus(item.id, { progress: currentProgress });
      }
    }, 250);
  }

  private updateFileStatus(id: string, patch: Partial<UploadFileItem>): void {
    this.files.update((list) =>
      list.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
    this.emitChange(this.files());
  }

  public retryUpload(item: UploadFileItem): void {
    if (this.disabled) return;
    this.simulateUpload(item);
  }

  public removeFile(item: UploadFileItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled) return;

    const filtered = this.files().filter((f) => f.id !== item.id);
    this.files.set(filtered);
    this.fileRemoved.emit(item);
    this.emitChange(filtered);

    if (this.previewModalFile()?.id === item.id) {
      this.closePreview();
    }
  }

  public clearAll(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.disabled) return;

    this.files.set([]);
    this.emitChange([]);
    this.closePreview();
  }

  public openPreview(item: UploadFileItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (item.previewUrl) {
      this.previewModalFile.set(item);
    }
  }

  public closePreview(): void {
    this.previewModalFile.set(null);
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  public getFileIcon(mimeType: string, fileName: string): string {
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) {
      return 'file-image';
    }
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
      return 'file-pdf';
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || /\.(zip|rar|7z|tar|gz)$/i.test(fileName)) {
      return 'file-zip';
    }
    if (mimeType.includes('text') || mimeType.includes('json') || mimeType.includes('code') || /\.(ts|js|html|css|json|txt|md)$/i.test(fileName)) {
      return 'file-text';
    }
    return 'file-generic';
  }

  private emitChange(list: UploadFileItem[]): void {
    this.filesChange.emit(list);
    this.onChange(list.map((item) => item.file));
  }
}

