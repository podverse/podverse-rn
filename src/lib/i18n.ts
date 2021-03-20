import * as RNLocalize from 'react-native-localize'

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  en: () => require('../resources/i18n/translations/en.json'),
  es: () => require('../resources/i18n/translations/es.json')
}

class Internationalizer {
  static instance: Internationalizer
  translationConfig: any
  
  constructor(translationConfig: any) {
    this.translationConfig = translationConfig
  }
  
  
  static initializeTranslator = () => {
    if (!Internationalizer.instance) {
      const fallback = { languageTag: 'en', isRTL: false }
      const { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback

      Internationalizer.instance = new Internationalizer(translationGetters[languageTag]())
    }

    return Internationalizer.instance
  }

  static translate = (key: string) => {
    if (Internationalizer.instance.translationConfig[key]) {
      return Internationalizer.instance.translationConfig[key]
    } else {
      return `[Missing tranlation for key: ${key}]`
    }
  }
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
