/**
 * I18nService - Internationalization Service
 * 
 * Handles loading and managing translations for different languages.
 * Supports template string replacement and fallback to English.
 */

export type SupportedLanguage = 'en' | 'ja';

interface TranslationData {
  [key: string]: any;
}

export class I18nService {
  private translations: Map<SupportedLanguage, TranslationData> = new Map();
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';

  constructor() {
    this.detectLanguage();
  }

  /**
   * Initialize the i18n service with translation data
   */
  async initialize() {
    try {
      // Load English translations
      const enTranslations = await this.loadTranslationFile('en');
      this.translations.set('en', enTranslations);

      // Load Japanese translations
      const jaTranslations = await this.loadTranslationFile('ja');
      this.translations.set('ja', jaTranslations);

    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to minimal translations
      this.translations.set('en', {});
      this.translations.set('ja', {});
    }
  }

  /**
   * Load translation file for a specific language
   */
  private async loadTranslationFile(lang: SupportedLanguage): Promise<TranslationData> {
    try {
      // In a real Obsidian plugin, you would load from the plugin's data folder
      // For now, we'll return the translations directly
      if (lang === 'en') {
        const enModule = await import('../i18n/en.json');
        return enModule.default || enModule;
      } else if (lang === 'ja') {
        const jaModule = await import('../i18n/ja.json');
        return jaModule.default || jaModule;
      }
      throw new Error(`Unsupported language: ${lang}`);
    } catch (error) {
      console.error(`Failed to load ${lang} translations:`, error);
      return {};
    }
  }

  /**
   * Detect user's preferred language
   */
  private detectLanguage() {
    // Check browser/system language
    const userLanguage = navigator.language || 'en';
    
    if (userLanguage.startsWith('ja')) {
      this.currentLanguage = 'ja';
    } else {
      this.currentLanguage = 'en';
    }
  }

  /**
   * Set the current language
   */
  setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language;
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): SupportedLanguage[] {
    return ['en', 'ja'];
  }

  /**
   * Translate a key to the current language
   * 
   * @param key - Translation key (dot-separated path)
   * @param params - Parameters for template replacement
   * @returns Translated string
   */
  t(key: string, params?: Record<string, any>): string {
    const translation = this.getTranslation(key, this.currentLanguage) || 
                       this.getTranslation(key, this.fallbackLanguage) ||
                       key; // Fallback to key if translation not found

    if (params) {
      return this.replaceParams(translation, params);
    }

    return translation;
  }

  /**
   * Get translation for a specific key and language
   */
  private getTranslation(key: string, language: SupportedLanguage): string | null {
    const translations = this.translations.get(language);
    if (!translations) return null;

    const keys = key.split('.');
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * Replace template parameters in translation strings
   * Supports {{param}} syntax
   */
  private replaceParams(template: string, params: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * Get all translations for a specific path prefix
   * Useful for getting all category or priority translations
   */
  getTranslationGroup(prefix: string): Record<string, string> {
    const translations = this.translations.get(this.currentLanguage) || {};
    const keys = prefix.split('.');
    let current: any = translations;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        const fallbackTranslations = this.translations.get(this.fallbackLanguage) || {};
        let fallbackCurrent: any = fallbackTranslations;
        for (const fallbackKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && fallbackKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fallbackKey];
          } else {
            return {};
          }
        }
        current = fallbackCurrent;
        break;
      }
    }

    if (current && typeof current === 'object') {
      return current as Record<string, string>;
    }

    return {};
  }
}