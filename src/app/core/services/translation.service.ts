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
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" class="w-full h-full object-cover"><rect width="640" height="480" fill="#da251d"/><polygon fill="#ffff00" points="320,96 352.3,195.5 456.9,195.5 372.3,257 404.6,356.5 320,295 235.4,356.5 267.7,257 183.1,195.5 287.7,195.5"/></svg>`
  },
  {
    code: 'en',
    label: EN_TRANSLATIONS.language.english,
    nativeName: EN_TRANSLATIONS.language.english,
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" class="w-full h-full object-cover"><path fill="#bd3d44" d="M0 0h640v480H0z"/><path stroke="#fff" stroke-width="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 276.9h640M0 350.8h640M0 424.6h640"/><path fill="#192f5d" d="M0 0h285.7v258.5H0z"/><g fill="#fff"><g id="d"><g id="c"><g id="e"><path d="M22.3 22l6.8 21.1H7l17.8-13-6.8-21.1L35.7 22z"/><use href="#e" x="47.6"/></g><use href="#c" x="95.2"/></g><use href="#d" x="190.5"/></g><use href="#d" y="47.6"/><g id="f"><use href="#c" y="95.2"/><use href="#c" y="142.8"/></g><use href="#f" x="23.8"/></g></svg>`
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
