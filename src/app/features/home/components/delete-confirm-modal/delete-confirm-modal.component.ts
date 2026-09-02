import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  Optional,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { CustomInputComponent } from '@shared/components/custom-input/custom-input.component';
import { CustomSelectComponent } from '@shared/components/custom-select/custom-select.component';
import { CustomCheckboxComponent } from '@shared/components/custom-checkbox/custom-checkbox.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { MODAL_DATA, ModalRef } from '@core/services/modal-ref';
import {
  DeleteConfirmModalData,
  DeleteConfirmModalResult,
  DeleteConfirmItemDetail,
  DeleteConfirmReasonOption
} from './delete-confirm-modal.types';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    ButtonComponent,
    BadgeComponent,
    AlertComponent,
    CustomInputComponent,
    CustomSelectComponent,
    CustomCheckboxComponent,
    TranslatePipe
  ],
  templateUrl: './delete-confirm-modal.component.html',
  host: {
    class: 'block'
  }
})
export class DeleteConfirmModalComponent implements OnInit {
  private readonly translationService = inject(TranslationService);

  @Input() isOpen = false;
  @Input() inputTitle = '';
  @Input() inputSubtitle = '';
  @Input() inputItemName = '';
  @Input() inputItemType = '';
  @Input() inputItemDetails: DeleteConfirmItemDetail[] = [];
  @Input() inputWarningMessage = '';
  @Input() inputRequireConfirmationText = false;
  @Input() inputConfirmationKeyword = 'DELETE';
  @Input() inputRequireReason = false;
  @Input() inputReasonOptions: DeleteConfirmReasonOption[] = [];
  @Input() inputConfirmButtonText = '';
  @Input() inputCancelButtonText = '';
  @Input() inputRequireCheckboxAgreement = false;
  @Input() inputCheckboxAgreementText = '';

  @Output() confirmed = new EventEmitter<DeleteConfirmModalResult>();
  @Output() cancelled = new EventEmitter<void>();

  public isDynamic = false;

  public title = signal('');
  public subtitle = signal('');
  public itemName = signal('');
  public itemType = signal('');
  public itemDetails = signal<DeleteConfirmItemDetail[]>([]);
  public warningMessage = signal('');
  public requireConfirmationText = signal(false);
  public confirmationKeyword = signal('DELETE');
  public requireReason = signal(false);
  public reasonOptions = signal<DeleteConfirmReasonOption[]>([]);
  public confirmButtonText = signal('');
  public cancelButtonText = signal('');
  public requireCheckboxAgreement = signal(false);
  public checkboxAgreementText = signal('');

  public confirmInputText = signal('');
  public selectedReason = signal<string | null>(null);
  public customReason = signal('');
  public checkboxAgreed = signal(false);
  public isDeleting = signal(false);

  public readonly isKeywordMatched = computed(() => {
    if (!this.requireConfirmationText()) return true;
    const required = this.confirmationKeyword().trim().toLowerCase();
    const actual = this.confirmInputText().trim().toLowerCase();
    return required.length > 0 && actual === required;
  });

  public readonly isValid = computed(() => {
    if (this.requireConfirmationText() && !this.isKeywordMatched()) {
      return false;
    }
    if (this.requireReason()) {
      if (!this.selectedReason()) return false;
      if (this.selectedReason() === 'other' && !this.customReason().trim()) return false;
    }
    if (this.requireCheckboxAgreement() && !this.checkboxAgreed()) {
      return false;
    }
    return true;
  });

  constructor(
    @Optional() @Inject(MODAL_DATA) private modalData: DeleteConfirmModalData | null,
    @Optional() private modalRef: ModalRef<DeleteConfirmModalResult> | null
  ) {
    if (this.modalRef) {
      this.isDynamic = true;
    }
  }

  ngOnInit(): void {
    const data: DeleteConfirmModalData = this.isDynamic && this.modalData
      ? this.modalData
      : {
          title: this.inputTitle,
          subtitle: this.inputSubtitle,
          itemName: this.inputItemName,
          itemType: this.inputItemType,
          itemDetails: this.inputItemDetails,
          warningMessage: this.inputWarningMessage,
          requireConfirmationText: this.inputRequireConfirmationText,
          confirmationKeyword: this.inputConfirmationKeyword,
          requireReason: this.inputRequireReason,
          reasonOptions: this.inputReasonOptions,
          confirmButtonText: this.inputConfirmButtonText,
          cancelButtonText: this.inputCancelButtonText,
          requireCheckboxAgreement: this.inputRequireCheckboxAgreement,
          checkboxAgreementText: this.inputCheckboxAgreementText
        };

    this.title.set(data.title || this.translationService.t('delete_modal.default_title'));
    this.subtitle.set(data.subtitle || this.translationService.t('delete_modal.default_subtitle'));
    this.itemName.set(data.itemName || '');
    this.itemType.set(data.itemType || '');
    this.itemDetails.set(data.itemDetails || []);
    this.warningMessage.set(data.warningMessage || this.translationService.t('delete_modal.default_warning'));
    this.requireConfirmationText.set(data.requireConfirmationText ?? false);
    this.confirmationKeyword.set(data.confirmationKeyword || 'DELETE');
    this.requireReason.set(data.requireReason ?? false);

    const defaultReasons: DeleteConfirmReasonOption[] = [
      { value: 'no_longer_needed', label: this.translationService.t('delete_modal.reason_no_longer_needed') },
      { value: 'duplicate', label: this.translationService.t('delete_modal.reason_duplicate') },
      { value: 'expired', label: this.translationService.t('delete_modal.reason_expired') },
      { value: 'testing', label: this.translationService.t('delete_modal.reason_testing') },
      { value: 'other', label: this.translationService.t('delete_modal.reason_other') }
    ];
    this.reasonOptions.set(data.reasonOptions && data.reasonOptions.length > 0 ? data.reasonOptions : defaultReasons);

    this.confirmButtonText.set(data.confirmButtonText || this.translationService.t('delete_modal.confirm_btn'));
    this.cancelButtonText.set(data.cancelButtonText || this.translationService.t('common.cancel'));
    this.requireCheckboxAgreement.set(data.requireCheckboxAgreement ?? false);
    this.checkboxAgreementText.set(data.checkboxAgreementText || this.translationService.t('delete_modal.checkbox_agreement_text'));
  }

  public confirm(): void {
    if (!this.isValid() || this.isDeleting()) return;

    this.isDeleting.set(true);

    const result: DeleteConfirmModalResult = {
      confirmed: true,
      reason: this.selectedReason() || undefined,
      customReason: this.selectedReason() === 'other' ? this.customReason().trim() : undefined,
      deletedAt: new Date().toISOString()
    };

    setTimeout(() => {
      this.isDeleting.set(false);
      if (this.isDynamic && this.modalRef) {
        this.modalRef.close(result);
      } else {
        this.confirmed.emit(result);
      }
    }, 400);
  }

  public cancel(): void {
    if (this.isDeleting()) return;
    if (this.isDynamic && this.modalRef) {
      this.modalRef.close();
    } else {
      this.cancelled.emit();
    }
  }
}
