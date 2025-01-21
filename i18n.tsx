import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import translations from './i18n/'

export function getI18n() : I18n {
    const i18n = new I18n(translations);
    const [locale] = Localization.getLocales();
    i18n.locale = locale.languageTag;
    i18n.enableFallback = true;
    i18n.defaultLocale = 'en';
    return i18n;
}

export function getLanguageTag(): string {
    let languageTag = Localization.getLocales().at(0)?.languageTag;
    return languageTag ? languageTag : "ja-JP";
}