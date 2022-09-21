import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { en } from './en'
import { de } from './de'

export const translations = {
    en: en,
    de: de,
};

export function getI18n() : any {
    const i18n = new I18n(translations);
    i18n.locale = Localization.locale;
    i18n.enableFallback = true;
    i18n.defaultLocale = 'en';
    return i18n;
}