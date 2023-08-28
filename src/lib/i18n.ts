import * as RNLocalize from 'react-native-localize'
import Config from 'react-native-config'
import { parseTranslatorsSection } from 'podverse-shared'

// NOTE: remember to update src/lib/utility
const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  da: () => require('../resources/i18n/translations/da.json'),
  de: () => require('../resources/i18n/translations/de.json'),
  el: () => require('../resources/i18n/translations/el.json'),
  en: () => require('../resources/i18n/translations/en.json'),
  es: () => require('../resources/i18n/translations/es.json'),
  fr: () => require('../resources/i18n/translations/fr.json'),
  it: () => require('../resources/i18n/translations/it.json'),
  lt: () => require('../resources/i18n/translations/lt.json'),
  nb: () => require('../resources/i18n/translations/nb_NO.json'),
  nl: () => require('../resources/i18n/translations/nl.json'),
  oc: () => require('../resources/i18n/translations/oc.json'),
  pt: () => require('../resources/i18n/translations/pt.json'),
  ru: () => require('../resources/i18n/translations/ru.json'),
  sv: () => require('../resources/i18n/translations/sv.json')
}

export const getTransalatorsSections = () => {
  const languageKeys = Object.keys(translationGetters)
  const translatorSections = []
  for (const key of languageKeys) {
    const translatorsField = translationGetters[key]?.()._translatorsField
    if (translatorsField) {
      const translatorSection = parseTranslatorsSection(translate(`language - ${key}`), translatorsField)
      translatorSections.push(translatorSection)
    }
  }

  return translatorSections
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
