import i18n from 'i18n-js'
import memoize from 'lodash.memoize'
import { I18nManager, Platform } from 'react-native'
import RNFS from 'react-native-fs'
import * as RNLocalize from 'react-native-localize'

export const setI18nConfig = async () => {
  const translationsDir = await (Platform.OS === 'android'
    ? RNFS.readDirAssets('translations')
    : RNFS.readDir(RNFS.MainBundlePath + '/i18n/locales'))
  const translationPaths = translationsDir
    .filter(({ isFile, name }) => isFile() && name.endsWith('.json'))
    .reduce((all, { name, path }) => {
      const languageTag = name.replace('.json', '')
      return { ...all, [languageTag]: path }
    }, {})

  // fallback if no available language fits
  const fallback = { languageTag: 'en', isRTL: false }

  const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationPaths)) || fallback

  const fileContent = await (Platform.OS === 'android'
    ? RNFS.readFileAssets(translationPaths[languageTag], 'utf8')
    : RNFS.readFile(translationPaths[languageTag], 'utf8'))

  // clear translation cache
  translate.cache.clear()
  // update layout direction
  I18nManager.forceRTL(isRTL)

  // set i18n-js config
  i18n.translations = { [languageTag]: JSON.parse(fileContent) }
  i18n.locale = languageTag
}

export const translate = memoize(
  (key: string, config: any) => i18n.t(key, config),
  (key: string, config: string) => (config ? key + JSON.stringify(config) : key)
) as any

export const supportedLanguages = ['en', 'es']

export const convertFilterOptionsToI18N = (rightItems: any) => rightItems.map((x: any) => convertFilterOptionToI18N(x))

const convertFilterOptionToI18N = (item: any) => {
  return {
    label: translate(item.i18nKey),
    value: item.value
  }
}
