import * as RNLocalize from 'react-native-localize'
import Config from 'react-native-config'

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  de: () => require('../resources/i18n/translations/de.json'),
  el: () => require('../resources/i18n/translations/el.json'),
  en: () => require('../resources/i18n/translations/en.json'),
  es: () => require('../resources/i18n/translations/es.json'),
  fr: () => require('../resources/i18n/translations/fr.json'),
  lt: () => require('../resources/i18n/translations/lt.json'),
  nb: () => require('../resources/i18n/translations/nb_NO.json'),
  pt: () => require('../resources/i18n/translations/pt.json'),
  ru: () => require('../resources/i18n/translations/ru.json'),
  sv: () => require('../resources/i18n/translations/sv.json')
}

class Internationalizer {
  static instance: Internationalizer
  translationConfig: any

  constructor(translationConfig: any) {
    this.translationConfig = translationConfig
  }

  static initializeTranslator = () => {
    if (!Internationalizer.instance) {
      const languageTag = getLanguageTag()
      Internationalizer.instance = new Internationalizer(translationGetters[languageTag]())
    }

    return Internationalizer.instance
  }

  static translate = (key: string) => {
    if (Internationalizer.instance.translationConfig[key]) {
      return Internationalizer.instance.translationConfig[key]
    } else {
      return Config.IS_DEV ? `[Missing tranlation for key: ${key}]` : translationGetters.en()[key]
    }
  }
}

export const getLanguageTag = () => {
  const fallback = { languageTag: 'en', isRTL: false }
  const { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback
  return languageTag
}

export const convertFilterOptionsToI18N = (rightItems: any) => rightItems.map((x: any) => convertFilterOptionToI18N(x))

const convertFilterOptionToI18N = (item: any) => {
  return {
    label: translate(item.label),
    value: item.value
  }
}

Internationalizer.initializeTranslator()
export const translate = Internationalizer.translate
