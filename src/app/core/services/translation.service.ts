import { Injectable, signal, computed } from '@angular/core';
import { SupportedLang, LanguageOption, TranslationDictionary } from '@core/i18n/i18n.types';
import { VI_TRANSLATIONS } from '@core/i18n/vi';
import { EN_TRANSLATIONS } from '@core/i18n/en';

const LANG_STORAGE_KEY = 'app_language_preference';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'vi',
    label: VI_TRANSLATIONS.language.vietnamese,
    nativeName: VI_TRANSLATIONS.language.vietnamese,
    flagIcon: 'flag-vi'
  },
  {
    code: 'en',
    label: EN_TRANSLATIONS.language.english,
    nativeName: EN_TRANSLATIONS.language.english,
    flagIcon: 'flag-en'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  public currentLang = signal<SupportedLang>('vi');

  public translations = computed<TranslationDictionary>(() => {
    return this.currentLang() === 'en' ? EN_TRANSLATIONS : VI_TRANSLATIONS;
  });

  public availableLanguages = LANGUAGE_OPTIONS;

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang;
    if (saved && (saved === 'vi' || saved === 'en')) {
      this.currentLang.set(saved);
    } else {
      const browserLang = navigator.language || '';
      if (browserLang.toLowerCase().startsWith('vi')) {
        this.currentLang.set('vi');
      } else if (browserLang.toLowerCase().startsWith('en')) {
        this.currentLang.set('en');
      }
    }
  }

  public setLanguage(lang: SupportedLang): void {
    if (this.currentLang() === lang) return;
    this.currentLang.set(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }

  public getCurrentLanguageOption(): LanguageOption {
    return (
      this.availableLanguages.find((l) => l.code === this.currentLang()) ||
      this.availableLanguages[0]
    );
  }

  public translate(key: string, params?: Record<string, any>): string {
    if (!key) return '';

    const dict = this.translations();
    const parts = key.split('.');
    let val: any = dict;

    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        val = null;
        break;
      }
    }

    if (typeof val !== 'string') {
      return key;
    }

    if (params) {
      return val.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? String(params[paramName]) : match;
      });
    }

    return val;
  }

  public t(key: string, params?: Record<string, any>): string {
    return this.translate(key, params);
  }
}
