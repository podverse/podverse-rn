import i18n from 'i18n-js'
import memoize from 'lodash.memoize'
import { I18nManager } from 'react-native'
import * as RNLocalize from 'react-native-localize'

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  en: () => require('../resources/i18n/translations/en.json'),
  es: () => require('../resources/i18n/translations/es.json')
}

export const translate = memoize(
  (key: any, config: any) => i18n.t(key, config),
  (key: any, config: any) => (config ? key + JSON.stringify(config) : key)
) as any

export const setI18nConfig = () => {
  // fallback if no available language fits
  const fallback = { languageTag: 'en', isRTL: false }
  console.log('set it up')
  const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback

  // clear translation cache
  translate.cache.clear()
  // update layout direction
  I18nManager.forceRTL(isRTL)

  // set i18n-js config
  i18n.translations = { [languageTag]: translationGetters[languageTag]() }
  i18n.locale = languageTag
}

export const convertFilterOptionsToI18N = (rightItems: any) => rightItems.map((x: any) => convertFilterOptionToI18N(x))

const convertFilterOptionToI18N = (item: any) => {
  return {
    label: translate(item.i18nKey),
    value: item.value
  }
}
