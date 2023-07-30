import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './i18n/en.json'
import de from './i18n/de.json'

export const translations = {
    en: en,
    de: de,
};

export function getI18n() : I18n {
    const i18n = new I18n(translations);
    i18n.locale = Localization.locale;
    i18n.enableFallback = true;
    i18n.defaultLocale = 'en';
    return i18n;
}

export function getLanguageTag(): string {
    let languageTag = Localization.getLocales().at(0)?.languageTag;
    return languageTag ? languageTag : "ja-JP";
}